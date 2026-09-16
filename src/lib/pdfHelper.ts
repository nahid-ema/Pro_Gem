import domToImage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';

interface PDFExportOptions {
  fileName: string;
  format?: 'a4' | 'a5';
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
}

export interface FallbackReportData {
  title: string;
  subtitle?: string;
  kpis?: { label: string; value: string }[];
  rentRows?: { date: string; room: string; tenant: string; rent: number; paid: number; due: number }[];
  expenseRows?: { date: string; category: string; desc: string; amount: number }[];
}

/**
 * Downloads a Blob safely across both top-level and iframe environments.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_) {}
  }, 4000);
}

/**
 * Fallback PDF generator using native jsPDF drawing if DOM-to-canvas ever encounters an unexpected error.
 */
function generateNativePDF(data: FallbackReportData, fileName: string) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(data.title, 14, y);

  y += 7;
  if (data.subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    pdf.text(data.subtitle, 14, y);
    y += 10;
  }

  // Draw separator
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.5);
  pdf.line(14, y, 196, y);
  y += 8;

  // KPIs
  if (data.kpis && data.kpis.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);

    let kpiX = 14;
    data.kpis.forEach((kpi, idx) => {
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(kpiX, y, 28, 16, 2, 2, 'FD');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(kpi.label, kpiX + 2, y + 5);
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(kpi.value, kpiX + 2, y + 12);
      kpiX += 31;
      if (idx === 5) {
        y += 18;
        kpiX = 14;
      }
    });
    y += 22;
  }

  // Rent Records
  if (data.rentRows && data.rentRows.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Rent Collection Register', 14, y);
    y += 6;

    pdf.setFontSize(8);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, y, 182, 6, 'F');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Date', 16, y + 4);
    pdf.text('Room', 40, y + 4);
    pdf.text('Tenant', 65, y + 4);
    pdf.text('Expected', 120, y + 4);
    pdf.text('Paid', 145, y + 4);
    pdf.text('Due', 170, y + 4);
    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);

    data.rentRows.forEach((r) => {
      if (y > 275) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(r.date, 16, y + 4);
      pdf.text(r.room, 40, y + 4);
      pdf.text(r.tenant.substring(0, 25), 65, y + 4);
      pdf.text(String(r.rent), 120, y + 4);
      pdf.text(String(r.paid), 145, y + 4);
      pdf.text(String(r.due), 170, y + 4);
      pdf.setDrawColor(241, 245, 249);
      pdf.line(14, y + 5, 196, y + 5);
      y += 6;
    });
    y += 6;
  }

  // Operating Expenses
  if (data.expenseRows && data.expenseRows.length > 0) {
    if (y > 250) {
      pdf.addPage();
      y = 15;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Operating Expenses', 14, y);
    y += 6;

    pdf.setFontSize(8);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(14, y, 182, 6, 'F');
    pdf.setTextColor(51, 65, 85);
    pdf.text('Date', 16, y + 4);
    pdf.text('Category', 40, y + 4);
    pdf.text('Description', 80, y + 4);
    pdf.text('Amount', 160, y + 4);
    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);

    data.expenseRows.forEach((e) => {
      if (y > 275) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(e.date, 16, y + 4);
      pdf.text(e.category, 40, y + 4);
      pdf.text(e.desc.substring(0, 40), 80, y + 4);
      pdf.text(String(e.amount), 160, y + 4);
      pdf.setDrawColor(241, 245, 249);
      pdf.line(14, y + 5, 196, y + 5);
      y += 6;
    });
  }

  const blob = pdf.output('blob');
  downloadBlob(blob, fileName);
}

/**
 * Exports an HTML element to a multi-page PDF document.
 * Automatically splits long elements across pages so no content is cut off.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions,
  fallbackData?: FallbackReportData
): Promise<void> {
  const {
    fileName,
    format = 'a4',
    orientation = 'portrait',
    marginMm = 8,
    scale = 2,
  } = options;

  try {
    // 1. Capture with dom-to-image-more
    // Using domToImage.toCanvas natively supports complex scripts (Bangla, etc) 
    // and modern CSS (oklch) because it uses the browser's own rendering engine via SVG foreignObject.
    const width = element.scrollWidth || 1024;
    const height = element.scrollHeight || 1400;

    console.log('PDF Export Dimensions:', {
      width,
      height,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    });

    const canvas = await domToImage.toCanvas(element, {
      bgcolor: '#ffffff',
      width: width * scale,
      height: height * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`,
        maxHeight: 'none',
        overflow: 'visible',
      },
    });

    console.log('Canvas generated:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    // 2. Determine PDF page dimensions in mm
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const printableWidthMm = pageWidth - marginMm * 2;
    const printableHeightMm = pageHeight - marginMm * 2;

    // Calculate pixel-to-mm ratio
    const pxPerMm = canvas.width / printableWidthMm;
    const pageHeightPx = Math.floor(printableHeightMm * pxPerMm);

    const totalPages = Math.ceil(canvas.height / pageHeightPx);

    if (totalPages <= 1) {
      // Single page
      const imgData = canvas.toDataURL('image/png');
      const imgHeightMm = (canvas.height * printableWidthMm) / canvas.width;
      pdf.addImage(imgData, 'PNG', marginMm, marginMm, printableWidthMm, imgHeightMm);
    } else {
      // Multi-page slicing so tall reports never cut off
      for (let page = 0; page < totalPages; page++) {
        const sourceY = page * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/png');
          const sliceHeightMm = (sourceHeight * printableWidthMm) / canvas.width;

          if (page > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            pageImgData,
            'PNG',
            marginMm,
            marginMm,
            printableWidthMm,
            sliceHeightMm
          );
        }
      }
    }

    // 3. Download the generated PDF blob
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, fileName);
  } catch (err) {
    console.error('Canvas PDF export failed, trying native fallback:', err);
    if (fallbackData) {
      generateNativePDF(fallbackData, fileName);
    } else {
      throw err;
    }
  }
}
