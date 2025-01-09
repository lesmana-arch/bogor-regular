import { CONFIG } from '../config.js';
import { calculatePolygonCenter } from './polygonUtils.js';
import { isPointInPolygon } from './polygonUtils.js';

export function setupMarkerEvents(marker, map, polygonCoordinates, onMarkerMove) {
  marker.on('dragend', function(event) {
    const position = event.target.getLatLng();
    
    if (!isPointInPolygon(position, polygonCoordinates)) {
      const center = calculatePolygonCenter(polygonCoordinates);
      event.target.setLatLng([center.lat, center.lng]);
      alert('LAYANAN KHUSUS CIBINONG/GUNUNG PUTRI');
    }
    
    if (onMarkerMove) {
      onMarkerMove(position);
    }
  });
}

export function updateMarkerPosition(marker, map, position, polygonCoordinates) {
  if (isPointInPolygon(position, polygonCoordinates)) {
    marker.setLatLng(position);
    map.setView(position, CONFIG.DEFAULT_ZOOM);
    return true;
  } else {
    const center = calculatePolygonCenter(polygonCoordinates);
    marker.setLatLng([center.lat, center.lng]);
    alert('LAYANAN KHUSUS CIBINONG/GUNUNG PUTRI');
    return false;
  }
}