import { CONFIG, API_ENDPOINTS } from '../config.js';

export async function fetchWeatherData(lat, lng) {
  const response = await fetch(
    `${API_ENDPOINTS.WEATHER}?lat=${lat}&lon=${lng}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
  );
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchGeocodingData(query) {
  const response = await fetch(
    `${API_ENDPOINTS.GEOCODING}?key=${CONFIG.API_KEY}&q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  );
  
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  
  return response.json();
}