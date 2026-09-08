const btn = document.getElementById('captureBtn');
const status = document.getElementById('status');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  status.textContent = 'Mengambil screenshot...';

  chrome.runtime.sendMessage({ action: 'start-capture' }, (response) => {
    btn.disabled = false;
    if (chrome.runtime.lastError) {
      status.textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    if (response && response.success) {
      status.textContent = 'Selesai! File sedang diunduh.';
    } else {
      status.textContent = 'Gagal: ' + (response?.error || 'unknown error');
    }
  });
});
