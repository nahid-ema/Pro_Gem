import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFGenerateOptions {
  elementId: string;
  filename?: string;
}

const COLOR_FUNC_REGEX = /(?:oklch|oklab|color-mix|color|light-dark)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/gi;

let canvasCtx: CanvasRenderingContext2D | null = null;
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (!canvasCtx && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvasCtx = canvas.getContext('2d');
  }
  return canvasCtx;
}

/**
 * Converts any unsupported CSS color substring (oklch, oklab, color-mix, etc.) into standard browser-supported color strings (#rrggbb or rgba)
 */
export function convertUnsupportedColors(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string') return cssValue;
  if (!/(?:oklch|oklab|color-mix|color|light-dark)/i.test(cssValue)) return cssValue;

  const ctx = getCanvasCtx();
  if (!ctx) return cssValue;

  return cssValue.replace(COLOR_FUNC_REGEX, (match) => {
    try {
      ctx.fillStyle = '#000000'; // reset
      ctx.fillStyle = match;
      const converted = ctx.fillStyle;
      if (converted && converted !== match) {
        return converted;
      }
    } catch {
      // fallback if canvas parsing fails
    }
    return 'rgb(0, 0, 0)';
  });
}

/**
 * Captures an HTML element and generates a crisp PDF Blob and File object.
 */
export async function generateElementPDF({
  elementId,
  filename = 'receipt.pdf',
}: PDFGenerateOptions): Promise<{ blob: Blob; file: File; downloadUrl: string }> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Render element onto canvas with high resolution scale
  const canvas = await html2canvas(element, {
    scale: 2, // 2x scale for crisp text rendering
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 800, // Standardized canvas width for consistent A4 output
    onclone: (clonedDoc, clonedElement) => {
      // 1. Sanitize all <style> tags in cloned document
      const styleTags = clonedDoc.querySelectorAll('style');
      styleTags.forEach((styleTag) => {
        if (styleTag.textContent && /(?:oklch|oklab|color-mix|color|light-dark)/i.test(styleTag.textContent)) {
          styleTag.textContent = convertUnsupportedColors(styleTag.textContent);
        }
      });

      // 2. Sanitize active CSSStyleSheets in cloned document
      try {
        Array.from(clonedDoc.styleSheets).forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (let i = rules.length - 1; i >= 0; i--) {
              const rule = rules[i];
              if (rule.cssText && /(?:oklch|oklab|color-mix|color|light-dark)/i.test(rule.cssText)) {
                if (rule instanceof CSSStyleRule) {
                  for (let j = 0; j < rule.style.length; j++) {
                    const propName = rule.style[j];
                    const propVal = rule.style.getPropertyValue(propName);
                    if (propVal && /(?:oklch|oklab|color-mix|color|light-dark)/i.test(propVal)) {
                      const converted = convertUnsupportedColors(propVal);
                      rule.style.setProperty(propName, converted, rule.style.getPropertyPriority(propName));
                    }
                  }
                } else {
                  const sanitizedText = convertUnsupportedColors(rule.cssText);
                  try {
                    sheet.deleteRule(i);
                    sheet.insertRule(sanitizedText, i);
                  } catch {
                    // Ignore insert failures
                  }
                }
              }
            }
          } catch {
            // Ignore cross-origin stylesheet access errors
          }
        });
      } catch {
        // Ignore stylesheet access errors
      }

      // 3. Compute explicit resolved styles for all cloned elements
      const colorProps = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'box-shadow',
        'fill',
        'stroke',
      ];

      const allClonedElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))];

      allClonedElements.forEach((node) => {
        if (node instanceof HTMLElement || node instanceof SVGElement) {
          const compStyle = clonedDoc.defaultView?.getComputedStyle(node);
          if (compStyle) {
            colorProps.forEach((prop) => {
              const val = compStyle.getPropertyValue(prop);
              if (val) {
                if (/(?:oklch|oklab|color-mix|color|light-dark)/i.test(val)) {
                  const converted = convertUnsupportedColors(val);
                  node.style.setProperty(prop, converted, 'important');
                } else if (val.startsWith('rgb')) {
                  node.style.setProperty(prop, val, 'important');
                }
              }
            });
          }

          const styleAttr = node.getAttribute('style');
          if (styleAttr && /(?:oklch|oklab|color-mix|color|light-dark)/i.test(styleAttr)) {
            node.setAttribute('style', convertUnsupportedColors(styleAttr));
          }
        }
      });
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 190; // 210mm - 20mm total margins
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);

  const blob = pdf.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  return { blob, file, downloadUrl };
}

/**
 * Share or download PDF report via WhatsApp or native Web Share API
 */
export async function shareOrDownloadPDF({
  elementId,
  filename = 'receipt.pdf',
  phone = '',
  title = 'Payment Receipt',
  text = 'Nahid Kutir Payment Receipt PDF',
}: PDFGenerateOptions & { phone?: string; title?: string; text?: string }): Promise<'shared' | 'downloaded'> {
  const { blob, file, downloadUrl } = await generateElementPDF({ elementId, filename });

  // Clean phone number format for WhatsApp
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone && !cleanPhone.startsWith('88')) {
    cleanPhone = `88${cleanPhone}`;
  }

  // Check if native Web Share API supports file sharing (mobile / Android / PWA)
  if (
    navigator.canShare &&
    navigator.canShare({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return 'shared';
    } catch (err: any) {
      // If user cancelled share sheet, return downloaded or handle gracefully
      if (err.name === 'AbortError') {
        return 'downloaded';
      }
    }
  }

  // Fallback for Desktop / Browsers without File Share API:
  // 1. Trigger direct PDF file download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 2. Open WhatsApp chat with pre-filled message
  if (cleanPhone) {
    const waMessage = `${text}\n\n📎 (পিডিএফ ফাইলটি আপনার ডিভাইসে ডাউনলোড হয়েছে, দয়া করে সাথে পাঠালিন/সংযুক্ত করুন)`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`, '_blank');
  }

  return 'downloaded';
}

