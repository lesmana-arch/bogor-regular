import { CONFIG } from './config.js';
import { getPickupLocation, getDestinationLocation } from './mapService.js';

export function placeOrder() {
  const service = document.getElementById('service').value;
  const destination = getDestinationLocation();
  const pickup = getPickupLocation();

  const argoElement = document.getElementById('argo');
  const argoText = argoElement.textContent || argoElement.innerText;
  const argo = parseInt(argoText.replace(/[^\d]/g, ''));

  if (!destination || !pickup) {
    alert("Pastikan titik pickup dan tujuan sudah ditentukan.");
    return;
  }

  if (isNaN(argo) || argo === 0) {
    alert("PILIH TUJUAN");
    return;
  }

  const destinationLink = `https://www.google.com/maps?q=${destination.lat},${destination.lng}`;
  const pickupLink = `https://www.google.com/maps?q=${pickup.lat},${pickup.lng}`;

  const message = `JENIS LAYANAN: ${service}%0ATUJUAN: ${destinationLink}%0APICK UP: ${pickupLink}%0AARGO: Rp ${argo}`;
  const whatsappURL = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;

  window.open(whatsappURL, '_blank');
}