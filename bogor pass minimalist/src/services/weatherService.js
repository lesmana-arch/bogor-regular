import { CONFIG } from '../config.js';

export async function updateWeather(latlng) {
  try {
    if (!latlng || !latlng.lat || !latlng.lng) {
      throw new Error('Invalid coordinates');
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latlng.lat}&lon=${latlng.lng}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.main || !data.weather || !data.weather[0]) {
      throw new Error('Invalid weather data format');
    }

    const temp = Math.round(data.main.temp);
    const weather = data.weather[0];
    const weatherDescription = weather.description;
    const iconCode = weather.icon;

    const weatherIconURL = `https://openweathermap.org/img/wn/${iconCode}.png`;
    const weatherInfo = `<img id="weather-icon" src="${weatherIconURL}" alt="${weatherDescription}" style="vertical-align: middle;"> ${temp}°C - ${weatherDescription}`;

    const weatherElement = document.getElementById('weather-info');
    if (weatherElement) {
      weatherElement.innerHTML = weatherInfo;
    }
  } catch (error) {
    console.error('Weather service error:', error.message);
    const weatherElement = document.getElementById('weather-info');
    if (weatherElement) {
      weatherElement.innerHTML = '<span style="color: #666;">Weather data unavailable</span>';
    }
  }
}