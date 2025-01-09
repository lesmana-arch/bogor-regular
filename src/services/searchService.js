import { CONFIG } from '../config.js';
import { setDestination } from './mapService.js';

let searchTimeout;

export function initializeSearchListeners() {
  const searchInput = document.getElementById('address-search');
  const resultsContainer = document.getElementById('address-results');

  if (!searchInput || !resultsContainer) return;

  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    const query = event.target.value.trim();

    if (query.length < 3) {
      resultsContainer.innerHTML = '';
      return;
    }

    resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';

    searchTimeout = setTimeout(() => {
      performSearch(query, resultsContainer);
    }, 300);
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#address-search') && !event.target.closest('#address-results')) {
      resultsContainer.innerHTML = '';
    }
  });
}

async function performSearch(query, resultsContainer) {
  try {
    // Check if config is properly loaded
    if (!CONFIG || !CONFIG.API_KEY) {
      throw new Error('Configuration not properly loaded');
    }

    const url = 'https://us1.locationiq.com/v1/search.php';
    const params = new URLSearchParams({
      key: CONFIG.API_KEY,
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 5
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LocationIQ API error:', errorText);
      throw new Error(`LocationIQ API error: ${response.status}`);
    }
    
    const results = await response.json();
    console.log('Search results:', results); // Debug log
    displayResults(results, resultsContainer);
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `<div class="search-error">Search failed: ${error.message}</div>`;
  }
}

function displayResults(results, container) {
  if (!results.length) {
    container.innerHTML = '<div class="no-results">No results found</div>';
    return;
  }

  const resultsList = document.createElement('div');
  resultsList.className = 'search-results';

  results.forEach(result => {
    const resultItem = createResultItem(result);
    resultsList.appendChild(resultItem);
  });

  container.innerHTML = '';
  container.appendChild(resultsList);
}

function createResultItem(result) {
  const item = document.createElement('div');
  item.className = 'search-result-item';
  item.innerHTML = `<div class="result-name">${result.display_name}</div>`;
  
  item.addEventListener('click', () => {
    const position = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    if (setDestination(position)) {
      document.getElementById('address-results').innerHTML = '';
      document.getElementById('address-search').value = result.display_name;
    }
  });
  
  return item;
}