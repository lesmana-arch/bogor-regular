import { CONFIG } from '../config.js';
import { POLYGON_COORDINATES, POLYGON_OPTIONS } from '../constants/mapConstants.js';
import { isPointInPolygon, calculatePolygonCenter } from '../utils/polygonUtils.js';
import { updateWeather } from './weatherService.js';
import { calculateFare, updateArgoDisplay } from '../utils/fareCalculator.js';
import { performanceOptimizer } from '../utils/performanceOptimizer.js';
import { mobileOptimizer } from '../utils/mobileOptimizer.js';

let map, marker, pickupLocation, destinationLocation;

export function initializeMaps() {
  const center = calculatePolygonCenter(POLYGON_COORDINATES);
  
  // Create map with optimized settings
  map = L.map('map', {
    preferCanvas: mobileOptimizer.isMobile(),
    zoomControl: !mobileOptimizer.isMobile(), // Hide zoom controls on mobile
    attributionControl: false // Hide attribution for cleaner look
  }).setView([center.lat, center.lng], CONFIG.DEFAULT_ZOOM);
  
  // Store map instance globally for resize handling
  window.mapInstance = map;
  
  // Use optimized tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    loading: 'lazy' // Lazy load tiles
  }).addTo(map);

  // Create polygon with optimized styling
  const polygon = L.polygon(POLYGON_COORDINATES, {
    ...POLYGON_OPTIONS,
    interactive: false // Improve performance
  }).addTo(map);
  
  // Create marker with custom icon - NOT draggable initially
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  marker = L.marker([center.lat, center.lng], { 
    draggable: false, // Start as non-draggable
    icon: customIcon
  }).addTo(map);
  
  map.fitBounds(polygon.getBounds());
  
  // Optimize map for mobile
  mobileOptimizer.optimizeMapForMobile(map);
  
  setupMarkerEvents();
  setupMapControls();
}

function setupMarkerEvents() {
  marker.on('dragend', function(event) {
    const position = event.target.getLatLng();
    
    if (!isPointInPolygon(position, POLYGON_COORDINATES)) {
      const center = calculatePolygonCenter(POLYGON_COORDINATES);
      event.target.setLatLng([center.lat, center.lng]);
      
      // Show modern alert
      showModernAlert('PASTIKAN LOKASI BERADA DALAM RADIUS LAYANAN');
      return;
    }
    
    // Only allow dragging for destination step
    if (!isPickupStep()) {
      destinationLocation = position;
      
      // Use throttled weather update for performance
      performanceOptimizer.throttle(() => {
        updateWeather(position);
      }, 1000, 'weather');
      
      calculateAndUpdateArgo();
    }
  });
}

function setupMapControls() {
  document.getElementById('confirm-pickup').addEventListener('click', confirmPickup);
  document.getElementById('confirm-pickup').disabled = true;
}

export function getLocation() {
  if (navigator.geolocation) {
    // Show loading state
    const button = document.getElementById('auto-location');
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
        <path d="M12 2v2c5.39.87 9.5 5.7 9.5 11.5s-4.11 10.63-9.5 11.5v2c6.5-.93 11.5-6.78 11.5-13.5S18.5 2.93 12 2z"/>
      </svg>
      Mencari lokasi...
    `;
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (isPointInPolygon(newPosition, POLYGON_COORDINATES)) {
          marker.setLatLng(newPosition);
          map.setView(newPosition, CONFIG.DEFAULT_ZOOM);
          pickupLocation = newPosition;
          document.getElementById('confirm-pickup').disabled = false;
          
          // Success feedback
          button.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Lokasi ditemukan!
          `;
          
          setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
          }, 2000);
        } else {
          const center = calculatePolygonCenter(POLYGON_COORDINATES);
          marker.setLatLng([center.lat, center.lng]);
          showModernAlert('LAYANAN KHUSUS GUNUNG PUTRI');
          
          // Reset button
          button.innerHTML = originalText;
          button.disabled = false;
        }
      },
      function(error) {
        showModernAlert('Tidak dapat mengakses lokasi. Pastikan GPS aktif.');
        button.innerHTML = originalText;
        button.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  } else {
    showModernAlert("Geolocation tidak didukung oleh browser ini.");
  }
}

function confirmPickup() {
  if (!pickupLocation) {
    showModernAlert('Gunakan tombol AUTO LOCATION untuk menentukan lokasi pickup');
    return;
  }
  
  document.getElementById('step-pickup').classList.remove('active');
  document.getElementById('step-destination').classList.add('active');
  
  // Reset marker for destination selection with animation
  const center = calculatePolygonCenter(POLYGON_COORDINATES);
  marker.setLatLng([center.lat, center.lng]);
  map.setView([center.lat, center.lng], CONFIG.DEFAULT_ZOOM);
  
  // Update marker color for destination and make it draggable
  const destinationIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  marker.setIcon(destinationIcon);
  // Enable dragging for destination selection
  marker.dragging.enable();
}

export function setDestination(position) {
  if (!isPointInPolygon(position, POLYGON_COORDINATES)) {
    showModernAlert('LAYANAN KHUSUS GUNUNG PUTRI');
    return false;
  }
  
  destinationLocation = position;
  marker.setLatLng([position.lat, position.lng]);
  map.setView([position.lat, position.lng], CONFIG.DEFAULT_ZOOM);
  
  // Use throttled updates for performance
  performanceOptimizer.throttle(() => {
    updateWeather(position);
  }, 1000, 'weather');
  
  calculateAndUpdateArgo();
  return true;
}

function calculateAndUpdateArgo() {
  if (!pickupLocation || !destinationLocation) return;
  
  const distance = map.distance(pickupLocation, destinationLocation) / 1000;
  const fare = calculateFare(distance);
  updateArgoDisplay(fare);
  
  // Add visual feedback for fare calculation
  const argoElement = document.getElementById('argo');
  argoElement.style.transform = 'scale(1.05)';
  setTimeout(() => {
    argoElement.style.transform = '';
  }, 300);
}

function isPickupStep() {
  return document.getElementById('step-pickup').classList.contains('active');
}

function showModernAlert(message) {
  // Create modern alert overlay
  const alertOverlay = document.createElement('div');
  alertOverlay.className = 'modern-alert-overlay';
  alertOverlay.innerHTML = `
    <div class="modern-alert">
      <div class="alert-icon">⚠️</div>
      <div class="alert-message">${message}</div>
      <button class="alert-button" onclick="this.parentElement.parentElement.remove()">OK</button>
    </div>
  `;
  
  // Add styles
  alertOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(alertOverlay);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (alertOverlay.parentElement) {
      alertOverlay.remove();
    }
  }, 3000);
}

export function getPickupLocation() {
  return pickupLocation;
}

export function getDestinationLocation() {
  return destinationLocation;
}