import { firebaseService } from './firebaseService.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/uiUtils.js';
import { startTimer, stopTimer } from '../utils/timerUtils.js';

let currentOrderId = null;
let statusListener = null;

export async function processOrder(orderData) {
  try {
    showLoadingOverlay('Mencari driver...');
    
    // Create order in Firebase
    currentOrderId = await firebaseService.createOrder(orderData);
    
    // Start listening for status changes
    let responseTimeout;
    
    return new Promise((resolve, reject) => {
      statusListener = firebaseService.listenToOrderStatus(currentOrderId, (data) => {
        if (!data) return;
        
        switch (data.status) {
          case 'accepted':
            clearTimeout(responseTimeout);
            hideLoadingOverlay();
            startRideProgress(data);
            resolve(data);
            break;
            
          case 'completed':
            stopRideProgress();
            showCompletionMessage();
            resolve(data);
            break;
            
          case 'rejected':
            clearTimeout(responseTimeout);
            hideLoadingOverlay();
            handleRejection();
            reject(new Error('Order rejected'));
            break;
        }
      });
      
      // Set 1-minute timeout for driver response
      responseTimeout = setTimeout(() => {
        hideLoadingOverlay();
        showResponseOptions();
      }, 60000);
    });
  } catch (error) {
    hideLoadingOverlay();
    throw error;
  }
}

function startRideProgress(orderData) {
  const { estimatedPickupTime, estimatedArrivalTime } = orderData;
  
  // Start pickup countdown
  startTimer('pickup', estimatedPickupTime, () => {
    showLoadingOverlay('Menunggu konfirmasi pickup driver...');
  });
  
  // After pickup, start journey countdown
  startTimer('journey', estimatedArrivalTime, () => {
    showLoadingOverlay('Dalam perjalanan ke tujuan...');
  });
}

function stopRideProgress() {
  stopTimer('pickup');
  stopTimer('journey');
  if (statusListener) {
    statusListener();
    statusListener = null;
  }
}

function showResponseOptions() {
  const optionsOverlay = document.createElement('div');
  optionsOverlay.className = 'response-options';
  optionsOverlay.innerHTML = `
    <div class="options-container">
      <h3>Tidak ada respon dari driver</h3>
      <button onclick="window.orderProcessing.retryOrder()">Coba Lagi</button>
      <button onclick="window.orderProcessing.cancelOrder()">Keluar</button>
    </div>
  `;
  document.body.appendChild(optionsOverlay);
}

export function retryOrder() {
  document.querySelector('.response-options').remove();
  // Retry with current order data
  processOrder(window.currentOrderData);
}

export function cancelOrder() {
  document.querySelector('.response-options').remove();
  stopRideProgress();
  window.location.reload();
}

function showCompletionMessage() {
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