// Mobile-specific optimizations
export class MobileOptimizer {
  constructor() {
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.isScrolling = false;
    this.setupMobileOptimizations();
  }

  setupMobileOptimizations() {
    // Prevent zoom on double tap
    this.preventDoubleTabZoom();
    
    // Optimize touch scrolling
    this.optimizeTouchScrolling();
    
    // Handle orientation changes
    this.handleOrientationChange();
    
    // Optimize viewport
    this.optimizeViewport();
    
    // Setup touch gestures
    this.setupTouchGestures();
  }

  preventDoubleTabZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  optimizeTouchScrolling() {
    // Add momentum scrolling for iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Optimize scroll performance
    let ticking = false;
    
    const updateScrolling = () => {
      this.isScrolling = false;
      ticking = false;
    };
    
    document.addEventListener('scroll', () => {
      this.isScrolling = true;
      
      if (!ticking) {
        requestAnimationFrame(updateScrolling);
        ticking = true;
      }
    }, { passive: true });
  }

  handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
      // Delay to ensure viewport has updated
      setTimeout(() => {
        // Trigger resize events for map and other components
        window.dispatchEvent(new Event('resize'));
        
        // Scroll to top to fix iOS viewport issues
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  optimizeViewport() {
    // Set viewport height for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
  }

  setupTouchGestures() {
    // Handle touch events for better UX
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      // Prevent pull-to-refresh on iOS
      if (e.touches[0].clientY > this.touchStartY && window.scrollY === 0) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
    }, { passive: true });
  }

  // Optimize map for mobile
  optimizeMapForMobile(map) {
    if (this.isMobile() && map) {
      // Safely disable map interactions that don't work well on mobile
      if (map.touchZoom && typeof map.touchZoom.disable === 'function') {
        map.touchZoom.disable();
      }
      if (map.doubleClickZoom && typeof map.doubleClickZoom.disable === 'function') {
        map.doubleClickZoom.disable();
      }
      
      // Safely enable better mobile interactions
      if (map.tap && typeof map.tap.enable === 'function') {
        map.tap.enable();
      }
      if (map.touchZoom && typeof map.touchZoom.enable === 'function') {
        map.touchZoom.enable();
      }
      
      // Optimize tile loading for mobile
      if (map.options) {
        map.options.preferCanvas = true;
        map.options.updateWhenZooming = false;
      }
    }
  }

  // Check if device is mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // Optimize form inputs for mobile
  optimizeFormInputs() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Prevent zoom on focus for iOS
      if (this.isMobile()) {
        input.addEventListener('focus', () => {
          input.style.fontSize = '16px';
        });
        
        input.addEventListener('blur', () => {
          input.style.fontSize = '';
        });
      }
    });
  }

  // Handle safe area insets for devices with notches
  handleSafeAreaInsets() {
    if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
      document.documentElement.style.setProperty(
        '--safe-area-top',
        'env(safe-area-inset-top)'
      );
      document.documentElement.style.setProperty(
        '--safe-area-bottom',
        'env(safe-area-inset-bottom)'
      );
    }
  }

  // Optimize animations for mobile
  optimizeAnimations() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }
  }
}

// Export singleton instance
export const mobileOptimizer = new MobileOptimizer();