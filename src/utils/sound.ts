
export const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5 note
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);

  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, 1000);

  // Safely check if Notification API is available before using it
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === "granted") {
      new Notification("זמן המשימה הסתיים!", {
        body: "הגיע הזמן לעבור למשימה הבאה",
        icon: "/favicon.ico"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("זמן המשימה הסתיים!", {
            body: "הגיע הזמן לעבור למשימה הבאה",
            icon: "/favicon.ico"
          });
        }
      });
    }
  }
};
