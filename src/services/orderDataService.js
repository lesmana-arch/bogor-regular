import { getPickupLocation, getDestinationLocation } from './mapService.js';

export function collectOrderData() {
  const pickup = getPickupLocation();
  const destination = getDestinationLocation();
  
  if (!pickup || !destination) {
    throw new Error('Lokasi pickup dan tujuan harus ditentukan');
  }

  const service = document.getElementById('service').value;
  const argoElement = document.getElementById('argo');
  const argoText = argoElement.textContent || argoElement.innerText;
  const argo = parseInt(argoText.replace(/[^\d]/g, ''));

  return {
    pickup: {
      lat: pickup.lat,
      lng: pickup.lng,
      googleMapsUrl: `https://www.google.com/maps?q=${pickup.lat},${pickup.lng}`
    },
    destination: {
      lat: destination.lat,
      lng: destination.lng,
      googleMapsUrl: `https://www.google.com/maps?q=${destination.lat},${destination.lng}`
    },
    service,
    fare: argo,
    timestamp: Date.now()
  };
}

export function validateOrderData(data) {
  if (!data.pickup || !data.destination) {
    return { valid: false, message: 'Lokasi pickup dan tujuan harus ditentukan' };
  }

  if (!data.service) {
    return { valid: false, message: 'Pilih jenis layanan' };
  }

  if (isNaN(data.fare) || data.fare === 0) {
    return { valid: false, message: 'Argo tidak valid' };
  }

  return { valid: true };
}