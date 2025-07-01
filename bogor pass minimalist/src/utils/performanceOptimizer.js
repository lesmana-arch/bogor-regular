// Performance optimization utilities
export class PerformanceOptimizer {
  constructor() {
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.intersectionObserver = null;
    this.setupIntersectionObserver();
  }

  // Debounce function calls
  debounce(func, delay, key) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  // Throttle function calls
  throttle(func, delay, key) {
    if (this.throttleTimers.has(key)) {
      return;
    }
    
    func();
    
    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timer);
  }

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      this.intersectionObserver.observe(img);
    });
  }

  // Setup intersection observer for lazy loading
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            this.intersectionObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  }

  // Optimize map rendering
  optimizeMapRendering(map) {
    // Reduce map update frequency on mobile
    if (this.isMobile()) {
      map.options.zoomSnap = 0.5;
      map.options.wheelPxPerZoomLevel = 120;
    }
    
    // Use requestAnimationFrame for smooth animations
    map.on('movestart', () => {
      this.throttle(() => {
        // Optimize during map movement
      }, 16, 'mapMove');
    });
  }

  // Check if device is mobile
  isMobile() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }

  // Optimize search performance
  optimizeSearch(searchFunction, delay = 300) {
    return (query) => {
      this.debounce(() => {
        searchFunction(query);
      }, delay, 'search');
    };
  }

  // Memory cleanup
  cleanup() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // Preload critical resources
  preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  // Optimize bundle loading
  loadModuleWhenNeeded(modulePath) {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          import(modulePath).then(resolve);
        });
      } else {
        setTimeout(() => {
          import(modulePath).then(resolve);
        }, 0);
      }
    });
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();