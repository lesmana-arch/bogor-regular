const timers = new Map();

export function startTimer(id, duration, onTick) {
  if (timers.has(id)) {
    clearInterval(timers.get(id));
  }
  
  const endTime = Date.now() + duration;
  
  const timer = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      stopTimer(id);
      return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    onTick(timeString);
  }, 1000);
  
  timers.set(id, timer);
}

export function stopTimer(id) {
  if (timers.has(id)) {
    clearInterval(timers.get(id));
    timers.delete(id);
  }
}