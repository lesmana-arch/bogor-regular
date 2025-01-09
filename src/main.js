import { initializeMaps, getLocation } from './services/mapService.js';
import { initializeSearchListeners } from './services/searchService.js';
import { placeOrder } from './services/orderService.js';
import { Scheduler } from './services/schedulerService.js';

class App {
  constructor() {
    this.scheduler = new Scheduler();
    this.initializeElements();
    this.setupEventListeners();
    this.updateUI();
    setInterval(() => this.updateUI(), 1000);
    setInterval(() => this.scheduler.switchMessage(), 3000);
  }

  initializeElements() {
    this.elements = {
      content: document.getElementById('content'),
      overlay: document.getElementById('overlay'),
      countdown: document.getElementById('countdown'),
      message: document.getElementById('message'),
      autoLocation: document.getElementById('auto-location'),
      confirmPickup: document.getElementById('confirm-pickup'),
      orderButton: document.getElementById('order-button')
    };
  }

  setupEventListeners() {
    this.elements.autoLocation.addEventListener('click', getLocation);
    this.elements.confirmPickup.addEventListener('click', () => {
      document.getElementById('step-pickup').classList.remove('active');
      document.getElementById('step-destination').classList.add('active');
    });
    this.elements.orderButton.addEventListener('click', placeOrder);
  }

  updateUI() {
    if (this.scheduler.isOpen()) {
      this.elements.content.style.display = 'block';
      this.elements.overlay.style.display = 'none';
      this.elements.overlay.classList.remove('visible');
      this.scheduler.stopCountdown();
    } else {
      this.elements.content.style.display = 'none';
      this.elements.overlay.style.display = 'flex';
      setTimeout(() => {
        this.elements.overlay.classList.add('visible');
      }, 10);
      
      this.scheduler.startCountdown(
        (time) => {
          this.elements.countdown.textContent = time;
        },
        () => {
          this.elements.overlay.classList.remove('visible');
          setTimeout(() => {
            this.elements.content.style.display = 'block';
            this.elements.overlay.style.display = 'none';
          }, 300);
        }
      );
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
  initializeMaps();
  initializeSearchListeners();
});