export class UIManager {
  showLoading(message, type = 'default') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
      <div class="loading-container ${type}-state">
        <div class="loading-spinner"></div>
        <p class="loading-message">${message}</p>
        <p class="loading-submessage"></p>
      </div>
    `;
  }

  hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  updateLoadingMessage(message) {
    const messageElement = document.querySelector('.loading-message');
    if (messageElement) {
      messageElement.innerHTML = message.replace('\n', '<br>');
    }
  }

  showResponseOptions(onRetry, onCancel) {
    const optionsOverlay = document.createElement('div');
    optionsOverlay.className = 'response-options';
    optionsOverlay.innerHTML = `
      <div class="options-container">
        <h3>Tidak ada respon dari driver</h3>
        <button class="retry-btn">Coba Lagi</button>
        <button class="cancel-btn">Keluar</button>
      </div>
    `;
    
    document.body.appendChild(optionsOverlay);
    
    optionsOverlay.querySelector('.retry-btn').onclick = onRetry;
    optionsOverlay.querySelector('.cancel-btn').onclick = onCancel;
  }

  hideResponseOptions() {
    const options = document.querySelector('.response-options');
    if (options) {
      options.remove();
    }
  }

  showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.innerHTML = `
      <div class="message-container">
        <h3>Perjalanan Selesai</h3>
        <p>Terima kasih telah menggunakan layanan kami!</p>
        <button onclick="window.location.reload()">Kembali</button>
      </div>
    `;
    document.body.appendChild(message);
  }

  showAlert(message) {
    alert(message);
  }
}