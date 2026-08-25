import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  title?: string;
  margin?: number; // mm
  onProgress?: (status: string) => void;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Converts CSS oklch(L C H / alpha) or oklch(L C H) to standard rgb(r,g,b) / rgba(r,g,b,a)
 * to ensure full compatibility with html2canvas and other legacy CSS parsers.
 */
function oklchToRgb(str: string): string {
  try {
    const cleaned = str.trim();
    const parts = cleaned.split(/[\s/]+/).filter(Boolean);
    if (parts.length < 3) return 'rgb(0, 0, 0)';

    let L_val = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) {
      L_val = L_val / 100;
    }
    const C = parseFloat(parts[1]) || 0;
    const H = parseFloat(parts[2]) || 0;
    let alpha = 1;
    if (parts.length >= 4) {
      alpha = parseFloat(parts[3]);
      if (parts[3].endsWith('%')) {
        alpha = alpha / 100;
      }
    }

    const L = L_val;
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l = Math.cbrt(L + 0.3963377774 * a + 0.2158037573 * b);
    const m = Math.cbrt(L - 0.1055613458 * a - 0.0638541728 * b);
    const s = Math.cbrt(L - 0.0894841775 * a - 1.2914855480 * b);

    const l3 = l * l * l;
    const m3 = m * m * m;
    const s3 = s * s * s;

    const r_lin = +4.0767434721 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const gamma = (x: number) => {
      const v = clamp(x, 0, 1);
      return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    };

    const r = Math.round(gamma(r_lin) * 255);
    const g = Math.round(gamma(g_lin) * 255);
    const bl = Math.round(gamma(b_lin) * 255);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${bl})`;
  } catch {
    return 'rgb(0, 0, 0)';
  }
}

/**
 * Sanitizes all modern CSS color functions from stylesheets and inline styles in cloned DOM
 */
function sanitizeModernCssColors(cssText: string): string {
  if (!cssText) return '';
  return cssText
    .replace(/oklch\(([^)]+)\)/gi, (_, p1) => oklchToRgb(p1))
    .replace(/oklab\(([^)]+)\)/gi, 'rgb(0,0,0)')
    .replace(/color\([^)]+\)/gi, 'rgb(0,0,0)')
    .replace(/color-mix\([^)]+\)/gi, 'rgb(50,50,50)')
    .replace(/light-dark\(([^,]+),[^)]+\)/gi, '$1');
}

/**
 * Export any HTML DOM element (e.g. A4 Paper canvas) directly to a downloadable PDF
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<{ success: boolean; blob?: Blob; pdf?: jsPDF; error?: string }> {
  try {
    if (options.onProgress) {
      options.onProgress('Подготовка документа к рендерингу...');
    }

    const orientation = options.orientation || 'portrait';
    const isPortrait = orientation === 'portrait';
    const pageWidth = isPortrait ? 210 : 297; // A4 in mm
    const pageHeight = isPortrait ? 297 : 210;

    // Clone or capture element with high scale for crisp typography and vector-like look
    const canvas = await html2canvas(element, {
      scale: 2, // 2x retina scale for sharp fonts
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // 1. Sanitize all <style> blocks in cloned document to remove any oklch() color definitions
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = sanitizeModernCssColors(styleEl.textContent);
          }
        });

        // 2. Sanitize inline styles of elements
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('color('))) {
            el.setAttribute('style', sanitizeModernCssColors(styleAttr));
          }
        });

        // 3. Reset transform and shadows on the target print paper
        const target = clonedDoc.querySelector('[data-pdf-content]') as HTMLElement || clonedDoc.body;
        if (target) {
          target.style.transform = 'none';
          target.style.boxShadow = 'none';
          target.style.margin = '0 auto';
        }
      }
    });

    if (options.onProgress) {
      options.onProgress('Формирование страниц PDF...');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Calculate dimensions
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Subsequent pages if document height exceeds single A4 page
    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const filename = (options.filename || 'Документ_СК_РФ').replace(/[/\\?%*:|"<>]/g, '_') + '.pdf';

    // Download PDF directly
    pdf.save(filename);

    const blob = pdf.output('blob');

    if (options.onProgress) {
      options.onProgress('Готово');
    }

    return { success: true, blob, pdf };
  } catch (err: unknown) {
    console.error('Failed to export PDF:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Неизвестная ошибка при экспорте PDF'
    };
  }
}

/**
 * Clean native print function with fallback
 */
export function printProceduralDocument(): void {
  window.print();
}
