// Website scheduler settings
export const SETTINGS = {
  openDays: [1, 2, 3, 4, 6, 7, 0], // jumat harusnya libur
  openTime: "08:00",
  closeTime: "18:00"
};

// Map configuration
export const CONFIG = {
  DEFAULT_ZOOM: 13,
  FIRST_KM_RATE: 8000, // Default rate for first kilometer
  NEXT_KM_RATE: 2000,  // Default rate for subsequent kilometers
  API_KEY: "pk.9acafd08e3a713792f86eb543d5c41c2",
  WEATHER_API_KEY: "5273980d01c5005aa4a4ab42d1f06356",
  WHATSAPP_NUMBER: "6285157142202",
  WEATHER_API_BASE_URL: "https://api.openweathermap.org/data/2.5",
  WEATHER_ICON_BASE_URL: "https://openweathermap.org/img/wn"
};

// API endpoints
export const API_ENDPOINTS = {
  WEATHER: `${CONFIG.WEATHER_API_BASE_URL}/weather`,
  GEOCODING: "https://us1.locationiq.com/v1/search.php"
};
