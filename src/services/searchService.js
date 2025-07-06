import { CONFIG } from '../config.js';
import { setDestination } from './mapService.js';

let searchTimeout;
let isSearching = false;
let currentFocusIndex = -1;
let searchResults = [];

export function initializeSearchListeners() {
  const searchInput = document.getElementById('address-search');
  const resultsContainer = document.getElementById('address-results');

  if (!searchInput || !resultsContainer) return;

  // Enhanced input event listener with better mobile support
  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    const query = event.target.value.trim();
    currentFocusIndex = -1; // Reset focus index

    if (query.length < 2) {
      hideResults(resultsContainer);
      return;
    }

    showLoadingState(resultsContainer);

    // Reduced timeout for better responsiveness on mobile
    searchTimeout = setTimeout(() => {
      performSearch(query, resultsContainer);
    }, 200);
  });

  // Enhanced focus handling for mobile
  searchInput.addEventListener('focus', () => {
    const query = searchInput.value.trim();
    if (query.length >= 2 && !isSearching) {
      performSearch(query, resultsContainer);
    }
  });

  // Better click outside handling
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
      hideResults(resultsContainer);
      currentFocusIndex = -1;
    }
  });

  // Touch event handling for mobile
  document.addEventListener('touchstart', (event) => {
    if (!event.target.closest('.search-container')) {
      hideResults(resultsContainer);
      currentFocusIndex = -1;
    }
  }, { passive: true });

  // Enhanced keyboard navigation
  searchInput.addEventListener('keydown', (event) => {
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (resultItems.length > 0) {
          currentFocusIndex = Math.min(currentFocusIndex + 1, resultItems.length - 1);
          updateFocus(resultItems);
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (resultItems.length > 0) {
          currentFocusIndex = Math.max(currentFocusIndex - 1, -1);
          updateFocus(resultItems);
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (currentFocusIndex >= 0 && resultItems[currentFocusIndex]) {
          resultItems[currentFocusIndex].click();
        } else if (resultItems.length > 0) {
          resultItems[0].click();
        }
        break;
        
      case 'Escape':
        hideResults(resultsContainer);
        currentFocusIndex = -1;
        searchInput.blur();
        break;
    }
  });
}

function updateFocus(resultItems) {
  // Remove focus from all items
  resultItems.forEach((item, index) => {
    item.classList.remove('focused');
    if (index === currentFocusIndex) {
      item.classList.add('focused');
      // Scroll item into view if needed
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

function showLoadingState(container) {
  container.innerHTML = '<div class="search-loading">🔍 Mencari lokasi...</div>';
  container.classList.add('visible');
  currentFocusIndex = -1;
}

function hideResults(container) {
  container.classList.remove('visible');
  currentFocusIndex = -1;
  setTimeout(() => {
    container.innerHTML = '';
  }, 150);
}

async function performSearch(query, resultsContainer) {
  if (isSearching) return;
  
  isSearching = true;
  
  try {
    // Check if config is properly loaded
    if (!CONFIG || !CONFIG.API_KEY) {
      throw new Error('Configuration not properly loaded');
    }

    // Enhanced search with better parameters for Indonesian locations
    const url = 'https://us1.locationiq.com/v1/search.php';
    const params = new URLSearchParams({
      key: CONFIG.API_KEY,
      q: `${query}, Indonesia`,
      format: 'json',
      addressdetails: 1,
      limit: 8,
      countrycodes: 'id',
      bounded: 1,
      viewbox: '106.7,-6.6,107.1,-6.1' // Bogor area bounds
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BogorPass/1.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LocationIQ API error:', errorText);
      throw new Error(`LocationIQ API error: ${response.status}`);
    }
    
    const results = await response.json();
    console.log('Search results:', results);
    
    displayResults(results, resultsContainer, query);
  } catch (error) {
    console.error('Search error:', error);
    showErrorState(resultsContainer, error.message);
  } finally {
    isSearching = false;
  }
}

function displayResults(results, container, originalQuery) {
  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📍</div>
        <div class="no-results-text">Tidak ada hasil untuk "${originalQuery}"</div>
        <div class="no-results-suggestion">Coba kata kunci yang lebih spesifik</div>
      </div>
    `;
    container.classList.add('visible');
    currentFocusIndex = -1;
    
    // Scroll to results on mobile
    scrollToResults(container);
    return;
  }

  // Filter and sort results for better relevance
  const filteredResults = results
    .filter(result => result.display_name && result.lat && result.lon)
    .slice(0, 6); // Limit to 6 results for better mobile UX

  // Store results for keyboard navigation
  searchResults = filteredResults;

  const resultsList = document.createElement('div');
  resultsList.className = 'search-results';

  filteredResults.forEach((result, index) => {
    const resultItem = createResultItem(result, index);
    resultsList.appendChild(resultItem);
  });

  container.innerHTML = '';
  container.appendChild(resultsList);
  container.classList.add('visible');
  
  // Scroll to results on mobile when they appear
  scrollToResults(container);
  
  // Auto-focus first result after a short delay
  setTimeout(() => {
    const resultItems = container.querySelectorAll('.search-result-item');
    if (resultItems.length > 0) {
      currentFocusIndex = 0;
      updateFocus(resultItems);
    }
  }, 100);
}

function scrollToResults(container) {
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  
  if (isMobile) {
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      // Get the search container position
      const searchContainer = container.closest('.search-container');
      if (searchContainer) {
        // Calculate the position to scroll to
        const containerRect = searchContainer.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate target scroll position
        // We want to show the search input and results in the viewport
        const targetScrollY = currentScrollY + containerRect.top - 20; // 20px padding from top
        
        // Smooth scroll to the target position
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      }
    });
  }
}

function createResultItem(result, index) {
  const item = document.createElement('div');
  item.className = 'search-result-item';
  item.style.animationDelay = `${index * 50}ms`;
  item.setAttribute('tabindex', '0'); // Make focusable
  
  // Enhanced display with better formatting
  const displayName = formatDisplayName(result.display_name);
  const addressParts = result.address || {};
  
  item.innerHTML = `
    <div class="result-content">
      <div class="result-icon">📍</div>
      <div class="result-details">
        <div class="result-name">${displayName}</div>
        <div class="result-address">${formatAddress(addressParts)}</div>
      </div>
    </div>
  `;
  
  // Enhanced click handling with visual feedback
  const handleSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Visual feedback
    item.style.transform = 'scale(0.98)';
    item.style.backgroundColor = 'var(--primary-color)';
    item.style.color = 'white';
    
    setTimeout(() => {
      const position = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      
      if (setDestination(position)) {
        // Hide results and clear search input
        const resultsContainer = document.getElementById('address-results');
        const searchInput = document.getElementById('address-search');
        
        hideResults(resultsContainer);
        searchInput.value = displayName;
        
        // Show the ORDER button when destination is selected
        showOrderButton();
        
        // Force layout recalculation to ensure button returns to original position
        document.body.offsetHeight;
        
        // Success feedback
        showSuccessToast('Lokasi berhasil dipilih');
      } else {
        // Reset visual feedback on error
        item.style.transform = '';
        item.style.backgroundColor = '';
        item.style.color = '';
      }
    }, 150);
  };

  item.addEventListener('click', handleSelection);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelection(e);
    }
  });

  // Mouse hover handling for focus
  item.addEventListener('mouseenter', () => {
    const resultItems = document.querySelectorAll('.search-result-item');
    currentFocusIndex = Array.from(resultItems).indexOf(item);
    updateFocus(resultItems);
  });

  // Touch event handling for better mobile experience
  item.addEventListener('touchstart', (e) => {
    item.style.backgroundColor = 'var(--bg-tertiary)';
  }, { passive: true });

  item.addEventListener('touchend', (e) => {
    setTimeout(() => {
      if (item.style.backgroundColor !== 'var(--primary-color)') {
        item.style.backgroundColor = '';
      }
    }, 100);
  }, { passive: true });
  
  return item;
}

function showOrderButton() {
  const orderButton = document.getElementById('order-button');
  if (orderButton) {
    orderButton.classList.add('show');
  }
}

function formatDisplayName(displayName) {
  // Clean up display name for better readability
  const parts = displayName.split(',');
  if (parts.length > 3) {
    return parts.slice(0, 3).join(', ');
  }
  return displayName;
}

function formatAddress(address) {
  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.suburb) parts.push(address.suburb);
  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }
  return parts.join(', ') || 'Alamat tidak tersedia';
}

function showErrorState(container, errorMessage) {
  container.innerHTML = `
    <div class="search-error">
      <div class="error-icon">⚠️</div>
      <div class="error-text">Pencarian gagal</div>
      <div class="error-detail">${errorMessage}</div>
      <button class="retry-search" onclick="this.parentElement.parentElement.previousElementSibling.focus()">
        Coba Lagi
      </button>
    </div>
  `;
  container.classList.add('visible');
  currentFocusIndex = -1;
  
  // Scroll to results on mobile even for errors
  scrollToResults(container);
}

function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✅</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}