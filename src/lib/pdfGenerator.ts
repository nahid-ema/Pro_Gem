import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFGenerateOptions {
  elementId: string;
  filename?: string;
}

const OKLCH_REGEX = /oklch\([^)]+\)/gi;

let canvasCtx: CanvasRenderingContext2D | null = null;
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (!canvasCtx && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvasCtx = canvas.getContext('2d');
  }
  return canvasCtx;
}

/**
 * Converts any oklch(...) CSS color substring into a standard browser-supported color string (#rrggbb or rgba)
 */
export function convertOklchColorString(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string' || !cssValue.includes('oklch')) {
    return cssValue;
  }

  const ctx = getCanvasCtx();
  if (!ctx) return cssValue;

  return cssValue.replace(OKLCH_REGEX, (match) => {
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
        if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
          styleTag.textContent = convertOklchColorString(styleTag.textContent);
        }
      });

      // 2. Sanitize CSS Rules in document stylesheets
      try {
        Array.from(clonedDoc.styleSheets).forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach((rule) => {
              if (rule instanceof CSSStyleRule && rule.cssText.includes('oklch')) {
                for (let i = 0; i < rule.style.length; i++) {
                  const propName = rule.style[i];
                  const propVal = rule.style.getPropertyValue(propName);
                  if (propVal && propVal.includes('oklch')) {
                    const converted = convertOklchColorString(propVal);
                    rule.style.setProperty(propName, converted, rule.style.getPropertyPriority(propName));
                  }
                }
              }
            });
          } catch {
            // Ignore CORS stylesheet errors
          }
        });
      } catch {
        // Ignore stylesheet access errors
      }

      // 3. Sanitize computed & inline styles on all cloned elements
      const propsToFix = [
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
        'background-image',
        'background',
      ];

      const allClonedElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))];

      allClonedElements.forEach((node) => {
        if (node instanceof HTMLElement || node instanceof SVGElement) {
          const compStyle = clonedDoc.defaultView?.getComputedStyle(node);
          if (compStyle) {
            propsToFix.forEach((prop) => {
              const val = compStyle.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                const converted = convertOklchColorString(val);
                node.style.setProperty(prop, converted, 'important');
              }
            });
          }

          const styleAttr = node.getAttribute('style');
          if (styleAttr && styleAttr.includes('oklch')) {
            node.setAttribute('style', convertOklchColorString(styleAttr));
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

