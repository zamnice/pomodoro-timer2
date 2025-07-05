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
    const closeBtn = settingsModal.querySelector('.close-btn'); // More specific selector
    const saveSettingsBtn = document.getElementById('save-settings');
    const alarmSound = document.getElementById('alarm-sound');
    const timerDisplay = document.querySelector('.timer-display'); // For pulsating effect
    
    // Timer variables
    let timer;
    let totalSeconds; // Will be set based on currentMode and settings
    let remainingSeconds;
    let isRunning = false;
    let currentMode = 'pomodoro'; // Default mode
    
    // Timer settings (default values)
    let settings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 10
    };
    
    // Load settings from localStorage if available
    if (localStorage.getItem('pomodoroSettings')) {
        settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        // Ensure the correct theme button is highlighted if needed, but not critical for functionality
    } else {
        // Set a default theme if none is saved
        document.body.setAttribute('data-theme', 'nature');
    }

    // Initialize timer with default or saved mode
    switchMode(currentMode, false); // Initialize without resetting settings just yet
    updateDisplay();
    initFavicon(); // Initialize favicon

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

    // --- Timer functions ---
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTimer, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            timerDisplay.classList.add('pulsate'); // Add pulsating effect
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        timerDisplay.classList.remove('pulsate'); // Remove pulsating effect
    }
    
    function resetTimer() {
        pauseTimer();
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
        remainingSeconds = totalSeconds;
        updateDisplay();
        updateFavicon(Math.floor(remainingSeconds / 60), remainingSeconds % 60);
    }
    
    function updateTimer() {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
            updateFavicon(Math.floor(remainingSeconds / 60), remainingSeconds % 60);
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
                body: `Your ${currentMode.replace('-', ' ')} timer has finished!`,
                icon: 'assets/images/icon.png' // Ensure you have an icon in this path
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Timer Completed!', {
                        body: `Your ${currentMode.replace('-', ' ')} timer has finished!`,
                        icon: 'assets/images/icon.png'
                    });
                }
            });
        }
        
        // Auto-switch mode
        if (currentMode === 'pomodoro') {
            // Basic auto-switch to short break
            setTimeout(() => {
                switchMode('short-break');
                // You might want to auto-start the next timer here, or let the user decide
                // startTimer(); 
            }, 1000);
        } else {
            // After a break, switch back to pomodoro
            setTimeout(() => {
                switchMode('pomodoro');
                // startTimer(); 
            }, 1000);
        }
    }
    
    function switchMode(mode, resetCurrentSettings = true) {
        currentMode = mode;
        
        // Update active button
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Set timer based on mode
        if (resetCurrentSettings) {
            resetTimer(); // Resets timer and updates totalSeconds based on new mode
        } else {
            // Initial load, just set totalSeconds
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
            remainingSeconds = totalSeconds; // Ensure remainingSeconds is also set
        }
        updateDisplay();
        updateFavicon(Math.floor(totalSeconds / 60), 0); // Update favicon on mode switch
    }
    
    function switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
    }
    
    // --- Settings functions ---
    function openSettings() {
        document.getElementById('pomodoro-time').value = settings.pomodoro;
        document.getElementById('short-break-time').value = settings.shortBreak;
        document.getElementById('long-break-time').value = settings.longBreak;
        settingsModal.style.display = 'flex'; // Use flex for centering
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
        // This will ensure the timer reflects new settings immediately
        resetTimer(); 
        closeSettings();
    }

    // --- Favicon related functions ---
    function initFavicon() {
        if (!document.getElementById('dynamic-favicon')) {
            const link = document.createElement('link');
            link.id = 'dynamic-favicon';
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }
        // Initialize with current timer state
        updateFavicon(Math.floor(remainingSeconds / 60), remainingSeconds % 60);
    }

    function updateFavicon(minutes, seconds) {
        const isBreak = currentMode !== 'pomodoro';
        // Get color from the current theme's primary color, or a default if not found
        const themePrimaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
        const color = isBreak ? '#4CAF50' : themePrimaryColor; // Green for break, theme's primary for pomodoro

        // Ensure seconds are always two digits
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="${color}"/>
                <text x="50%" y="68%" font-family="Poppins, sans-serif" font-size="50" text-anchor="middle" dominant-baseline="middle" fill="white">
                    ${minutes}:${formattedSeconds}
                </text>
            </svg>
        `;
        
        document.getElementById('dynamic-favicon').href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
});

        
