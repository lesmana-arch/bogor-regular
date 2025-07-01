import { initializeMaps, getLocation } from './services/mapService.js';
import { initializeSearchListeners } from './services/searchService.js';
import { placeOrder } from './services/orderService.js';
import { Scheduler } from './services/schedulerService.js';
import { performanceOptimizer } from './utils/performanceOptimizer.js';
import { mobileOptimizer } from './utils/mobileOptimizer.js';

class App {
  constructor() {
    this.scheduler = new Scheduler();
    this.initializeElements();
    this.setupEventListeners();
    this.setupPerformanceOptimizations();
    this.updateUI();
    
    // Use optimized intervals
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
    // Use passive listeners where possible for better performance
    this.elements.autoLocation.addEventListener('click', getLocation);
    
    this.elements.confirmPickup.addEventListener('click', () => {
      this.transitionToDestination();
    });
    
    this.elements.orderButton.addEventListener('click', placeOrder);
    
    // Optimize resize handling
    window.addEventListener('resize', () => {
      performanceOptimizer.throttle(() => {
        this.handleResize();
      }, 100, 'resize');
    }, { passive: true });
  }

  setupPerformanceOptimizations() {
    // Initialize mobile optimizations
    mobileOptimizer.optimizeFormInputs();
    mobileOptimizer.handleSafeAreaInsets();
    mobileOptimizer.optimizeAnimations();
    
    // Preload critical resources
    performanceOptimizer.preloadResources([
      './services/weatherService.js',
      './services/orderService.js'
    ]);
    
    // Setup lazy loading
    performanceOptimizer.lazyLoadImages();
  }

  transitionToDestination() {
    const pickupStep = document.getElementById('step-pickup');
    const destinationStep = document.getElementById('step-destination');
    
    // Add smooth transition
    pickupStep.style.opacity = '0';
    pickupStep.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      pickupStep.classList.remove('active');
      destinationStep.classList.add('active');
      
      // Animate in destination step
      destinationStep.style.opacity = '0';
      destinationStep.style.transform = 'translateY(10px)';
      
      requestAnimationFrame(() => {
        destinationStep.style.opacity = '1';
        destinationStep.style.transform = 'translateY(0)';
      });
    }, 150);
  }

  handleResize() {
    // Handle responsive layout changes
    const map = window.mapInstance;
    if (map) {
      map.invalidateSize();
    }
  }

  updateUI() {
    if (this.scheduler.isOpen()) {
      this.showMainContent();
    } else {
      this.showCountdownOverlay();
    }
  }

  showMainContent() {
    this.elements.content.style.display = 'block';
    this.elements.overlay.style.display = 'none';
    this.elements.overlay.classList.remove('visible');
    this.scheduler.stopCountdown();
  }

  showCountdownOverlay() {
    this.elements.content.style.display = 'none';
    this.elements.overlay.style.display = 'flex';
    
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      this.elements.overlay.classList.add('visible');
    });
    
    this.scheduler.startCountdown(
      (time) => {
        this.elements.countdown.textContent = time;
      },
      () => {
        this.hideCountdownOverlay();
      }
    );
  }

  hideCountdownOverlay() {
    this.elements.overlay.classList.remove('visible');
    
    setTimeout(() => {
      this.elements.content.style.display = 'block';
      this.elements.overlay.style.display = 'none';
    }, 300);
  }

  // Cleanup method for performance
  destroy() {
    performanceOptimizer.cleanup();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if device supports modern features
  if ('IntersectionObserver' in window && 'requestIdleCallback' in window) {
    // Use optimized initialization for modern browsers
    requestIdleCallback(() => {
      new App();
      initializeMaps();
      initializeSearchListeners();
    });
  } else {
    // Fallback for older browsers
    new App();
    initializeMaps();
    initializeSearchListeners();
  }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause non-critical operations when page is hidden
    performanceOptimizer.throttle(() => {
      // Pause animations, reduce update frequency
    }, 1000, 'visibility');
  }
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}