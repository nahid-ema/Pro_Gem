import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFGenerateOptions {
  elementId: string;
  filename?: string;
}

/**
 * Converts OKLCH (L C H [/ A]) to RGB/RGBA string
 */
function oklchToRgb(lStr: string, cStr: string, hStr: string, aStr?: string): string {
  let L = parseFloat(lStr);
  if (lStr.endsWith('%')) L = L / 100;

  let C = parseFloat(cStr);
  if (cStr.endsWith('%')) C = C / 100;

  let H = parseFloat(hStr);
  if (hStr.endsWith('deg')) H = parseFloat(hStr);
  else if (hStr.endsWith('rad')) H = (parseFloat(hStr) * 180) / Math.PI;
  else if (hStr.endsWith('turn')) H = parseFloat(hStr) * 360;

  if (isNaN(H)) H = 0;

  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  return oklabToRgbValues(L, a, b, aStr);
}

/**
 * Converts OKLAB (L a b [/ A]) to RGB/RGBA string
 */
function oklabToRgbValues(L: number, a: number, b: number, aStr?: string): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 0.1291980554 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    const val = clamped >= 0.0031308 ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055 : 12.92 * clamped;
    return Math.round(Math.max(0, Math.min(255, val * 255)));
  };

  const r = toSrgb(rLin);
  const g = toSrgb(gLin);
  const bVal = toSrgb(bLin);

  if (aStr !== undefined && aStr !== null && aStr !== '') {
    let alpha = parseFloat(aStr);
    if (aStr.endsWith('%')) alpha = alpha / 100;
    if (isNaN(alpha)) alpha = 1;
    return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
  }

  return `rgb(${r}, ${g}, ${bVal})`;
}

const OKLCH_REGEX = /oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([-\d.degdegturnrad]+)(?:\s*\/\s*([\d.%]+))?\s*\)/gi;
const OKLAB_REGEX = /oklab\(\s*([\d.%]+)\s+([-\d.%]+)\s+([-\d.%]+)(?:\s*\/\s*([\d.%]+))?\s*\)/gi;
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
 * Converts any unsupported CSS color substring into standard browser-supported color strings
 */
export function convertUnsupportedColors(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string') return cssValue;
  if (!/(?:oklch|oklab|color-mix|color|light-dark)/i.test(cssValue)) return cssValue;

  let converted = cssValue.replace(OKLCH_REGEX, (_, l, c, h, a) => oklchToRgb(l, c, h, a));
  converted = converted.replace(OKLAB_REGEX, (_, l, aVal, bVal, alpha) =>
    oklabToRgbValues(
      parseFloat(l) > 1 ? parseFloat(l) / 100 : parseFloat(l),
      parseFloat(aVal),
      parseFloat(bVal),
      alpha
    )
  );

  if (/(?:oklch|oklab|color-mix|color|light-dark)/i.test(converted)) {
    const ctx = getCanvasCtx();
    if (ctx) {
      converted = converted.replace(COLOR_FUNC_REGEX, (match) => {
        try {
          ctx.fillStyle = '#000000';
          ctx.fillStyle = match;
          const parsed = ctx.fillStyle;
          if (parsed && parsed !== match && parsed !== '#000000') {
            return parsed;
          }
        } catch {
          // Ignore canvas parse errors
        }
        return 'rgb(15, 23, 42)';
      });
    }
  }

  return converted;
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
    windowWidth: 794, // Standardized A4 canvas width (794px)
    onclone: (clonedDoc, clonedElement) => {
      // 0. Force Light Mode on cloned document so PDF is always clean white paper style
      clonedDoc.documentElement.classList.remove('dark');
      clonedDoc.body.classList.remove('dark');

      let current: HTMLElement | null = clonedElement;
      while (current) {
        current.classList.remove('dark');
        current = current.parentElement;
      }

      clonedElement.querySelectorAll('*').forEach((el) => {
        el.classList.remove('dark');
      });

      // Force white background, dark text, full opacity, and visible position on cloned element
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#0f172a';
      clonedElement.style.opacity = '1';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.display = 'block';
      clonedElement.style.position = 'relative';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.width = '794px';
      if (!clonedElement.style.padding) {
        clonedElement.style.padding = '36px 40px';
      }
      clonedElement.style.borderRadius = '0px';

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
              if (val && /(?:oklch|oklab|color-mix|color|light-dark)/i.test(val)) {
                const converted = convertUnsupportedColors(val);
                node.style.setProperty(prop, converted, 'important');
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

  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm

  const marginX = 8; // 8mm side margins (194mm printable width)
  const marginY = 8; // 8mm top & bottom margin

  const maxPdfWidth = pageWidth - marginX * 2; // 194mm
  const maxPdfHeight = pageHeight - marginY * 2; // 281mm

  let renderWidth = maxPdfWidth;
  let renderHeight = (canvas.height * renderWidth) / canvas.width;

  // Scale down if height exceeds single A4 page printable height
  if (renderHeight > maxPdfHeight) {
    renderHeight = maxPdfHeight;
    renderWidth = (canvas.width * renderHeight) / canvas.height;
  }

  // Center the image horizontally and vertically on the page
  const xPos = (pageWidth - renderWidth) / 2;
  const yPos = (pageHeight - renderHeight) / 2;

  pdf.addImage(imgData, 'JPEG', xPos, yPos, renderWidth, renderHeight, undefined, 'FAST');

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
  // Clean phone number format for WhatsApp
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone && !cleanPhone.startsWith('88') && cleanPhone.length === 11) {
    cleanPhone = `88${cleanPhone}`;
  }

  // Pre-open popup window synchronously BEFORE async operation to avoid browser popup blockers
  let waWindow: Window | null = null;
  const isMobileShareSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.canShare) &&
    Boolean(navigator.share) &&
    navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] });

  // If a specific tenant phone is provided OR native share is not available, open standard WhatsApp popup window
  if (cleanPhone || !isMobileShareSupported) {
    waWindow = window.open('about:blank', '_blank');
  }

  try {
    const { file, downloadUrl } = await generateElementPDF({ elementId, filename });

    // 1. If tenant phone number is provided -> Download PDF + Open WhatsApp chat with THAT tenant number!
    if (cleanPhone) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

      if (waWindow && !waWindow.closed) {
        waWindow.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank');
      }

      return 'downloaded';
    }

    // 2. If no phone number is provided, try Mobile Native Share Sheet if available
    if (isMobileShareSupported && navigator.share) {
      if (waWindow && !waWindow.closed) {
        waWindow.close();
        waWindow = null;
      }
      try {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return 'shared';
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return 'downloaded';
        }
      }
    }

    // 3. Fallback: Download PDF and open general WhatsApp share link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    if (waWindow && !waWindow.closed) {
      waWindow.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank');
    }

    return 'downloaded';
  } catch (error) {
    if (waWindow && !waWindow.closed) {
      waWindow.close();
    }
    throw error;
  }
}
