import { CONFIG } from '../config.js';
import { isPointInPolygon } from './polygonUtils.js';
import { updateMarkerPosition } from './markerUtils.js';

export async function searchLocation(query, resultsContainer, onLocationSelect) {
  if (query.length <= 2) {
    resultsContainer.innerHTML = '';
    return;
  }

  resultsContainer.innerHTML = 'Searching...';

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${CONFIG.API_KEY}&q=${query}&format=json&addressdetails=1&limit=1`
    );
    const results = await response.json();

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }

    displaySearchResults(results, resultsContainer, onLocationSelect);
  } catch (error) {
    console.error('Error fetching address:', error);
    resultsContainer.innerHTML = '<p>Search failed. Please try again later.</p>';
  }
}

function displaySearchResults(results, container, onLocationSelect) {
  container.innerHTML = '';
  
  results.forEach((result) => {
    const resultItem = createResultItem(result);
    resultItem.addEventListener('click', () => {
      const position = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      onLocationSelect(position);
      container.innerHTML = '';
    });
    container.appendChild(resultItem);
  });
}

function createResultItem(result) {
  const resultItem = document.createElement('div');
  resultItem.style.cursor = 'pointer';
  resultItem.style.padding = '5px';
  resultItem.style.backgroundColor = '#4c2a66';
  resultItem.style.marginBottom = '5px';
  resultItem.innerHTML = `<p>${result.display_name}</p>`;
  return resultItem;
}