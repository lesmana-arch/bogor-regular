// Calculate time difference between two dates
export function calculateTimeDifference(target, now) {
  const diff = target - now;
  
  if (diff <= 0) return null;

  return {
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

// Format time object to string
export function formatTime(time) {
  if (!time) return "00:00:00";
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
}

// Get next opening time based on current time and settings
export function getNextOpenTime(settings, currentDay, currentTime) {
  let nextOpenTime = new Date();
  const [hours, minutes] = settings.openTime.split(':').map(Number);
  nextOpenTime.setHours(hours, minutes, 0, 0);

  if (!settings.openDays.includes(currentDay) || currentTime >= settings.openTime) {
    do {
      nextOpenTime.setDate(nextOpenTime.getDate() + 1);
    } while (!settings.openDays.includes(nextOpenTime.getDay()));
  }

  return nextOpenTime;
}