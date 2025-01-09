import { CONFIG } from '../config.js';
import { POLYGON_COORDINATES, POLYGON_OPTIONS } from '../constants/mapConstants.js';
import { isPointInPolygon, calculatePolygonCenter } from '../utils/polygonUtils.js';
import { updateWeather } from './weatherService.js';
import { calculateFare, updateArgoDisplay } from '../utils/fareCalculator.js';

let map, marker, pickupLocation, destinationLocation;

export function initializeMaps() {
  const center = calculatePolygonCenter(POLYGON_COORDINATES);
  
  map = L.map('map').setView([center.lat, center.lng], CONFIG.DEFAULT_ZOOM);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  const polygon = L.polygon(POLYGON_COORDINATES, POLYGON_OPTIONS).addTo(map);
  
  marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map);
  
  map.fitBounds(polygon.getBounds());
  
  setupMarkerEvents();
  setupMapControls();
}

function setupMarkerEvents() {
  marker.on('dragend', function(event) {
    const position = event.target.getLatLng();
    
    if (!isPointInPolygon(position, POLYGON_COORDINATES)) {
      const center = calculatePolygonCenter(POLYGON_COORDINATES);
      event.target.setLatLng([center.lat, center.lng]);
      alert('LAYANAN KHUSUS GUNUNG PUTRI');
      return;
    }
    
    if (isPickupStep()) {
      pickupLocation = position;
      document.getElementById('confirm-pickup').disabled = false;
    } else {
      destinationLocation = position;
      updateWeather(position);
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
    navigator.geolocation.getCurrentPosition(function(position) {
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      if (isPointInPolygon(newPosition, POLYGON_COORDINATES)) {
        marker.setLatLng(newPosition);
        map.setView(newPosition, CONFIG.DEFAULT_ZOOM);
        pickupLocation = newPosition;
        document.getElementById('confirm-pickup').disabled = false;
      } else {
        const center = calculatePolygonCenter(POLYGON_COORDINATES);
        marker.setLatLng([center.lat, center.lng]);
        alert('LAYANAN KHUSUS GUNUNG PUTRI');
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function confirmPickup() {
  if (!pickupLocation) {
    alert('Please select a pickup location first');
    return;
  }
  
  document.getElementById('step-pickup').classList.remove('active');
  document.getElementById('step-destination').classList.add('active');
  
  // Reset marker for destination selection
  const center = calculatePolygonCenter(POLYGON_COORDINATES);
  marker.setLatLng([center.lat, center.lng]);
  map.setView([center.lat, center.lng], CONFIG.DEFAULT_ZOOM);
}

export function setDestination(position) {
  if (!isPointInPolygon(position, POLYGON_COORDINATES)) {
    alert('LAYANAN KHUSUS GUNUNG PUTRI');
    return false;
  }
  
  destinationLocation = position;
  marker.setLatLng([position.lat, position.lng]);
  map.setView([position.lat, position.lng], CONFIG.DEFAULT_ZOOM);
  
  updateWeather(position);
  calculateAndUpdateArgo();
  return true;
}

function calculateAndUpdateArgo() {
  if (!pickupLocation || !destinationLocation) return;
  
  const distance = map.distance(pickupLocation, destinationLocation) / 1000; // Convert to kilometers
  const fare = calculateFare(distance);
  updateArgoDisplay(fare);
}

function isPickupStep() {
  return document.getElementById('step-pickup').classList.contains('active');
}

export function getPickupLocation() {
  return pickupLocation;
}

export function getDestinationLocation() {
  return destinationLocation;
}