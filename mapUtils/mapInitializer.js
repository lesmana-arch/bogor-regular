import { CONFIG } from '../config.js';
import { calculatePolygonCenter } from './polygonUtils.js';
import { setupMarkerEvents } from './markerUtils.js';

export function initializeMap(elementId, POLYGON_COORDINATES, POLYGON_OPTIONS) {
  const center = calculatePolygonCenter(POLYGON_COORDINATES);
  
  const map = L.map(elementId).setView([center.lat, center.lng], CONFIG.DEFAULT_ZOOM);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  const polygon = L.polygon(POLYGON_COORDINATES, POLYGON_OPTIONS).addTo(map);
  
  const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map);
  
  map.fitBounds(polygon.getBounds());
  
  return { map, marker };
}