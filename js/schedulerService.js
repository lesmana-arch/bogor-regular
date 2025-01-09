import { SETTINGS } from './config.js';

export class Scheduler {
  constructor() {
    this.countdownInterval = null;
    this.messageIndex = 0;
    this.messages = [
      "hai...kita sedang tutup coba nanti pagi yaa",
      "kita akan buka setelah countdown selesai :D"
    ];
  }

  isOpen() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    return (
      SETTINGS.openDays.includes(currentDay) &&
      currentTime >= SETTINGS.openTime &&
      currentTime < SETTINGS.closeTime
    );
  }

  startCountdown(onTick, onComplete) {
    if (this.countdownInterval) return;

    const updateCountdown = () => {
      const now = new Date();
      const nextOpenTime = this.getNextOpenTime();
      
      if (this.isOpen()) {
        this.stopCountdown();
        onComplete();
        return;
      }

      const timeLeft = this.calculateTimeDifference(nextOpenTime, now);
      if (!timeLeft) {
        this.stopCountdown();
        onComplete();
        return;
      }
      
      onTick(this.formatTime(timeLeft));
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  getNextOpenTime() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    let nextOpenTime = new Date();
    const [hours, minutes] = SETTINGS.openTime.split(':').map(Number);
    nextOpenTime.setHours(hours, minutes, 0, 0);

    if (!SETTINGS.openDays.includes(currentDay) || currentTime >= SETTINGS.closeTime) {
      do {
        nextOpenTime.setDate(nextOpenTime.getDate() + 1);
      } while (!SETTINGS.openDays.includes(nextOpenTime.getDay()));
    }

    return nextOpenTime;
  }

  calculateTimeDifference(target, now) {
    const diff = target - now;
    if (diff <= 0) return null;

    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  formatTime(time) {
    if (!time) return "00:00:00";
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  }

  switchMessage() {
    const messageElement = document.getElementById('message');
    messageElement.classList.remove('visible');
    
    setTimeout(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      messageElement.textContent = this.messages[this.messageIndex];
      messageElement.classList.add('visible');
    }, 500);
  }
}