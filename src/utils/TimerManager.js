export class TimerManager {
  constructor() {
    this.timers = new Map();
  }

  startTimer(id, duration, onTick) {
    this.stopTimer(id);
    
    const endTime = Date.now() + duration;
    
    const timer = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        this.stopTimer(id);
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      onTick(timeString);
    }, 1000);
    
    this.timers.set(id, timer);
  }

  stopTimer(id) {
    if (this.timers.has(id)) {
      clearInterval(this.timers.get(id));
      this.timers.delete(id);
    }
  }

  stopAllTimers() {
    for (const id of this.timers.keys()) {
      this.stopTimer(id);
    }
  }
}