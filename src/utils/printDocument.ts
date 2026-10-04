/**
 * Reliable Printing & PDF Document Export Utility
 * Works seamlessly in sandboxed iframe environments, modals, and mobile browsers.
 */

export interface PrintDocumentOptions {
  title: string;
  orientation?: 'portrait' | 'landscape';
  dir?: 'ltr' | 'rtl';
  customStyles?: string;
}

export function printDocumentContent(
  element: HTMLElement | null,
  options: PrintDocumentOptions
): boolean {
  if (!element) {
    console.error('printDocumentContent: element is null');
    try {
      window.print();
      return true;
    } catch (e) {
      console.error('Fallback window.print() failed:', e);
      return false;
    }
  }

  const { title, orientation = 'portrait', dir = 'ltr', customStyles = '' } = options;

  // Clone node and clean any interactive buttons/toolbars if any
  const cloned = element.cloneNode(true) as HTMLElement;
  const printHidden = cloned.querySelectorAll('.print\\:hidden, [data-print-hide="true"]');
  printHidden.forEach((el) => el.remove());

  const contentHtml = cloned.outerHTML;

  try {
    // Create an invisible iframe for isolated printing
    const iframe = document.createElement('iframe');
    iframe.name = 'aasj-print-frame';
    iframe.id = 'aasj-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc || !iframe.contentWindow) {
      throw new Error('Unable to access iframe document');
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@500;700;900&family=Noto+Naskh+Arabic:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 ${orientation};
      margin: ${orientation === 'portrait' ? '5mm 8mm 5mm 8mm' : '8mm'};
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      color: #0f172a !important;
      font-family: 'Amiri', 'Playfair Display', Georgia, serif;
      width: 100% !important;
      height: 100% !important;
    }
    .print-canvas {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    ${customStyles}
  </style>
</head>
<body class="m-0 p-0">
  <div class="print-canvas">
    ${contentHtml}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.error(e);
        }
      }, 300);
    });
  </script>
</body>
</html>`);
    doc.close();

    // Clean up iframe after printing
    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch (err) {
        // ignore
      }
    }, 60000);

    return true;
  } catch (err) {
    console.warn('Iframe print failed, falling back to direct window.print():', err);
    try {
      window.focus();
      window.print();
      return true;
    } catch (windowPrintErr) {
      console.error('All printing methods failed:', windowPrintErr);
      return false;
    }
  }
}

/**
 * Direct file download as a self-contained, high-resolution HTML document.
 * Authors and editors can open it in any browser or MS Word and save as PDF.
 */
export function downloadDocumentAsHtml(
  element: HTMLElement | null,
  filename: string,
  options: PrintDocumentOptions
): void {
  if (!element) return;

  const { title, orientation = 'portrait', dir = 'ltr', customStyles = '' } = options;
  const cloned = element.cloneNode(true) as HTMLElement;
  const printHidden = cloned.querySelectorAll('.print\\:hidden, [data-print-hide="true"]');
  printHidden.forEach((el) => el.remove());

  const fullHtml = `<!DOCTYPE html>
<html dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 ${orientation}; margin: ${orientation === 'portrait' ? '5mm 8mm 5mm 8mm' : '8mm'}; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }
    body { background: #f8fafc; padding: 20px; font-family: 'Amiri', 'Playfair Display', Georgia, serif; }
    .doc-container { max-width: 900px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 12px; padding: 24px; }
    @media print {
      body { background: white !important; padding: 0 !important; margin: 0 !important; }
      .doc-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 auto !important; max-width: 100% !important; width: 100% !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      .no-print { display: none !important; }
    }
    ${customStyles}
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 900px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #064e3b; color: white; padding: 12px 20px; border-radius: 8px;">
    <span style="font-weight: bold;">Archives of Agriculture Sciences Journal (AASJ)</span>
    <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
  <div class="doc-container">
    ${cloned.outerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
