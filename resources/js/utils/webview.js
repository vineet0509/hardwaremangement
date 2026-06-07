import Swal from 'sweetalert2';
/**
 * webview.js - Android WebView compatibility helpers
 *
 * Android WebView blocks:
 *  - window.open() → use location.href or Android JS bridge
 *  - Blob URL downloads → must base64-encode and push via JS interface
 *  - <a download> clicks → same problem
 *  - WhatsApp wa.me links → must use location.href, not window.open
 *  - File chooser (input type=file) → requires Android WebChromeClient (no JS fix needed, handled by app)
 */

/** Returns true when running inside an Android WebView */
export const isAndroidWebView = () => {
  const ua = navigator.userAgent || '';
  return /wv/.test(ua) || /Android.*WebView/.test(ua) || typeof window.Android !== 'undefined';
};

/**
 * Open a URL safely:
 *  - In WebView → use location.href (opens in same view, then Android app can intercept)
 *  - In browser → use window.open with _blank
 */
export const safeOpen = (url) => {
  if (isAndroidWebView()) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Open a WhatsApp URL safely.
 * In WebView, wa.me must be opened via location.href so Android can hand off to the WhatsApp app.
 */
export const openWhatsApp = (phone, message) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  if (isAndroidWebView()) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Download a file from a URL (authenticated).
 * - In browser  → opens in new tab (PDF/Excel will download automatically)
 * - In WebView  → fetches via XHR, converts to base64, and triggers Android download
 *                 via the window.Android.downloadFile(base64, filename, mimeType) bridge.
 *                 Falls back to location.href if the bridge is not available.
 */
export const downloadFile = async (url, filename = 'download', mimeType = 'application/octet-stream') => {
  if (!isAndroidWebView()) {
    window.open(url, '_blank');
    return;
  }

  // Android WebView path
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]; // strip data:...;base64,
      if (window.Android && typeof window.Android.downloadFile === 'function') {
        // Android JS Bridge — the app must implement this
        window.Android.downloadFile(base64, filename, mimeType);
      } else {
        // Fallback: try to navigate to the URL directly and hope Android handles it
        window.location.href = url;
      }
    };
    reader.readAsDataURL(blob);
  } catch (e) {
    console.error('WebView download error', e);
    window.location.href = url;
  }
};

/**
 * Download a client-side generated blob (e.g. CSV string).
 * - In browser  → standard blob URL + link.click()
 * - In WebView  → convert to base64 and use Android bridge or fallback
 */
export const downloadBlob = (blobOrContent, filename = 'download.csv', mimeType = 'text/csv;charset=utf-8;') => {
  const blob = blobOrContent instanceof Blob
    ? blobOrContent
    : new Blob([blobOrContent], { type: mimeType });

  if (!isAndroidWebView()) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Android WebView path
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result.split(',')[1];
    if (window.Android && typeof window.Android.downloadFile === 'function') {
      window.Android.downloadFile(base64, filename, mimeType.split(';')[0]);
    } else {
      // Fallback: try data URI
      const dataUrl = reader.result;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  reader.readAsDataURL(blob);
};

/**
 * Open a print-ready HTML in a new window.
 * - In browser  → window.open() as usual
 * - In WebView  → window.open() is blocked, so we write to a hidden iframe
 *                 and call iframe.contentWindow.print()
 */
export const printHtml = (htmlContent) => {
  if (!isAndroidWebView()) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Popup blocked. Please allow popups for this site.');
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return;
  }

  // Android WebView path — use a hidden iframe
  let iframe = document.getElementById('__print_iframe__');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '__print_iframe__';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      // Last resort: use Android print bridge if available
      if (window.Android && typeof window.Android.printPage === 'function') {
        window.Android.printPage();
      }
    }
  };
};
