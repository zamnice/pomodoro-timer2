document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const alarmSound = document.getElementById('alarm-sound');
    
    // Timer variables
    let timer;
    let totalSeconds = 25 * 60; // Default pomodoro time
    let remainingSeconds = totalSeconds;
    let isRunning = false;
    let currentMode = 'pomodoro';
    
    // Timer settings
    let settings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 10
    };
    
    // Load settings from localStorage if available
    if (localStorage.getItem('pomodoroSettings')) {
        settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    }
    
    // Initialize timer
    updateDisplay();
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTheme(btn.dataset.theme));
    });
    
    settingsBtn.addEventListener('click', openSettings);
    closeBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Timer functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTimer, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetTimer() {
        pauseTimer();
        remainingSeconds = totalSeconds;
        updateDisplay();
    }
    
    function updateTimer() {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
        } else {
            timerComplete();
        }
    }
    
    function updateDisplay() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }
    
    function timerComplete() {
        pauseTimer();
        alarmSound.play();
        
        // Notify user
        if (Notification.permission === 'granted') {
            new Notification('Timer Completed!', {
                body: `Your ${currentMode} timer has finished!`,
                icon: 'assets/images/icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Timer Completed!', {
                        body: `Your ${currentMode} timer has finished!`,
                        icon: 'assets/images/icon.png'
                    });
                }
            });
        }
        
        // Auto-switch mode if pomodoro completes
        if (currentMode === 'pomodoro') {
            // You can add logic here to count pomodoros and switch to long break after 4
            setTimeout(() => {
                switchMode('short-break');
                startTimer();
            }, 1000);
        }
    }
    
    function switchMode(mode) {
        currentMode = mode;
        
        // Update active button
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Set timer based on mode
        switch (mode) {
            case 'pomodoro':
                totalSeconds = settings.pomodoro * 60;
                break;
            case 'short-break':
                totalSeconds = settings.shortBreak * 60;
                break;
            case 'long-break':
                totalSeconds = settings.longBreak * 60;
                break;
        }
        
        resetTimer();
    }
    
    function switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    // Settings functions
    function openSettings() {
        document.getElementById('pomodoro-time').value = settings.pomodoro;
        document.getElementById('short-break-time').value = settings.shortBreak;
        document.getElementById('long-break-time').value = settings.longBreak;
        settingsModal.style.display = 'block';
    }
    
    function closeSettings() {
        settingsModal.style.display = 'none';
    }
    
    function saveSettings() {
        settings.pomodoro = parseInt(document.getElementById('pomodoro-time').value);
        settings.shortBreak = parseInt(document.getElementById('short-break-time').value);
        settings.longBreak = parseInt(document.getElementById('long-break-time').value);
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Update current timer if settings changed for current mode
        switch (currentMode) {
            case 'pomodoro':
                totalSeconds = settings.pomodoro * 60;
                break;
            case 'short-break':
                totalSeconds = settings.shortBreak * 60;
                break;
            case 'long-break':
                totalSeconds = settings.longBreak * 60;
                break;
        }
        
        resetTimer();
        closeSettings();
    }

    // Auto-show bubble text setelah 5 detik
setTimeout(() => {
  const bubble = document.querySelector('.whatsapp-bubble');
  bubble.classList.add('show-text');
}, 5000);

// Inisialisasi favicon dengan nilai dari timer
function initFavicon() {
  if (!document.getElementById('dynamic-favicon')) {
    const link = document.createElement('link');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  const initialMinutes = Math.floor(totalSeconds / 60);
  updateFavicon(initialMinutes, 0);
}

// Update favicon sesuai mode
function updateFavicon(minutes, seconds) {
  const isBreak = currentMode !== 'pomodoro';
  const color = isBreak ? '#4CAF50' : '#ff6b6b';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="${color}"/>
      <text x="50" y="68" font-size="50" text-anchor="middle" fill="white">
        ${minutes}:${seconds.toString().padStart(2, '0').slice(0,2)}
      </text>
    </svg>
  `;
  
  document.getElementById('dynamic-favicon').href = 
    `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Cek localStorage saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('hideNote') === 'true') {
    document.querySelector('.sticky-note')?.remove();
  }
});

// Saat tombol close diklik
document.querySelector('.close-btn')?.addEventListener('click', function() {
  const note = document.querySelector('.sticky-note');
  
  note.style.opacity = '0';
  note.style.transform = 'translateY(20px) rotate(5deg)';
  
  setTimeout(() => {
    note.remove();
    localStorage.setItem('hideNote', 'true');
  }, 300);
});

// Modifikasi switchMode
function switchMode(mode) {
  currentMode = mode;
  modeBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  // Update timer settings
  switch(mode) {
    case 'pomodoro': totalSeconds = 25 * 60; break;
    case 'short-break': totalSeconds = 5 * 60; break;
    case 'long-break': totalSeconds = 10 * 60; break;
  }

  resetTimer();
  updateFavicon(Math.floor(totalSeconds / 60), 0); // Update favicon
}
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettings();
        }
    });
    
    // Request notification permission on page load
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});
