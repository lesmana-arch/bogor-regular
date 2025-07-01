export function formatTemperature(temp) {
  return Math.round(temp);
}

export function createWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}.png`;
}

export function validateWeatherData(data) {
  if (!data || !data.main || !data.weather || !data.weather[0]) {
    throw new Error('Invalid weather data format');
  }
  return true;
}

export function validateCoordinates(latlng) {
  if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') {
    throw new Error('Invalid coordinates');
  }
  return true;
}