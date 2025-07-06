import { CONFIG } from '../config.js';

export function calculateFare(distance) {
  if (!distance || distance <= 0) return 0;

  let totalFare;
  if (distance <= 1) {
    totalFare = CONFIG.FIRST_KM_RATE;
  } else {
    const additionalDistance = distance - 1;
    totalFare = CONFIG.FIRST_KM_RATE + (additionalDistance * CONFIG.NEXT_KM_RATE);
  }

  return Math.ceil(totalFare / 100) * 100;
}

export function updateArgoDisplay(fare) {
  const argoElement = document.getElementById('argo');
  if (argoElement) {
    argoElement.innerText = `Argo: Rp ${fare}`;
    updateOrderButtonState(fare);
  }
}

export function updateOrderButtonState(fare) {
  const orderButton = document.getElementById('order-button');
  if (orderButton) {
    const isDisabled = !fare || fare === 0;
    orderButton.disabled = isDisabled;
    orderButton.style.backgroundColor = isDisabled ? '#cccccc' : '';
    orderButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
  }
}