// Chrome membatasi captureVisibleTab ~2x per detik, jadi kita beri jeda antar capture.
const CAPTURE_DELAY_MS = 500;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ambil ukuran halaman & viewport dari tab aktif
async function getPageMetrics(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      totalHeight: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      originalScrollY: window.scrollY,
    }),
  });
  return result;
}

// Scroll halaman ke posisi Y tertentu
async function scrollTo(tabId, y) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (yPos) => window.scrollTo(0, yPos),
    args: [y],
  });
}

async function captureFullPage(tabId, windowId) {
  const metrics = await getPageMetrics(tabId);
  const { totalHeight, viewportWidth, viewportHeight, dpr, originalScrollY } = metrics;

  const slices = [];
  let currentY = 0;

  while (currentY < totalHeight) {
    // Klip posisi scroll terakhir supaya tidak melebihi tinggi halaman
    const targetY = Math.min(currentY, totalHeight - viewportHeight);
    await scrollTo(tabId, targetY);
    await wait(CAPTURE_DELAY_MS);

    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
    slices.push({ dataUrl, y: targetY });

    if (targetY + viewportHeight >= totalHeight) break;
    currentY += viewportHeight;
  }

  // Kembalikan scroll ke posisi semula
  await scrollTo(tabId, originalScrollY);

  return stitchSlices(slices, {
    totalHeight,
    viewportWidth,
    viewportHeight,
    dpr,
  });
}

async function stitchSlices(slices, { totalHeight, viewportWidth, dpr }) {
  const canvas = new OffscreenCanvas(viewportWidth * dpr, totalHeight * dpr);
  const ctx = canvas.getContext('2d');

  for (const slice of slices) {
    const blob = await (await fetch(slice.dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);
    ctx.drawImage(bitmap, 0, slice.y * dpr);
  }

  const finalBlob = await canvas.convertToBlob({ type: 'image/png' });
  return blobToDataURL(finalBlob);
}

// Service worker MV3 tidak menyediakan URL.createObjectURL, jadi kita
// konversi blob ke data URL (base64) secara manual sebagai gantinya.
async function blobToDataURL(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // hindari call stack overflow untuk file besar
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${blob.type};base64,${base64}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'start-capture') return;

  (async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const imageUrl = await captureFullPage(tab.id, tab.windowId);

      await chrome.downloads.download({
        url: imageUrl,
        filename: `fullpage-screenshot-${Date.now()}.png`,
        saveAs: true,
      });

      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  return true; // keep message channel open for async sendResponse
});