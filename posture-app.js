// PostureAI - Enhanced Posture Detection Application
class PostureAI {
    constructor() {
        this.model = null;
        this.webcam = null;
        this.ctx = null;
        this.maxPredictions = 0;
        this.sessionStartTime = null;
        this.goodPostureCount = 0;
        this.totalPredictions = 0;
        this.postureHistory = [];
        this.blinkCount = 0;
        this.lastBlinkTime = Date.now();
        this.monitoringInterval = null;
        this.isMonitoring = false;
        
        // Timer properties
        this.timerInterval = null;
        this.timerRunning = false;
        this.timerDuration = 20 * 60; // 20 minutes in seconds
        this.timerRemaining = this.timerDuration;
        this.selectedTimeOption = 20; // Default 20 minutes
        
        // Poor posture detection properties
        this.poorPostureStartTime = null;
        this.isPoorPostureAlertActive = false;
        this.poorPostureThreshold = 3000; // 3 seconds in milliseconds
        this.poorPostureConfidenceThreshold = 0.5; // 50% confidence
        this.poorPostureAlertCooldown = 10000; // 10 seconds cooldown between alerts
        this.lastPoorPostureAlertTime = 0;
        
        // Model URL - Replace with your Teachable Machine model URL
        this.MODEL_URL = "https://teachablemachine.withgoogle.com/models/M3_WSbmt4/";
        
        this.init();
    }

    async init() {
        this.initializeVantaBackground();
        this.setupEventListeners();
        this.setupTimerEventListeners();
        this.showNotification('PostureAI initialized successfully!', 'success');
    }

    showSystemAlert(title, message) {
        // System alert that blocks all browser activity until dismissed
        // This will be visible on every tab and requires user interaction
        alert(`🚨 ${title}\n\n${message}\n\nClick OK to continue.`);
        
        // Also show in-app notification
        this.showNotification(`🚨 ${title}`, 'error');
        
        console.log(`SYSTEM ALERT: ${title} - ${message}`);
    }

    showPoorPostureSystemAlert(confidence, duration) {
        const confidencePercent = (confidence * 100).toFixed(1);
        const durationSeconds = (duration / 1000).toFixed(1);
        
        const title = 'POOR POSTURE DETECTED!';
        const message = `Poor posture detected with ${confidencePercent}% confidence for ${durationSeconds} seconds.\n\nPlease sit up straight immediately!\n\nThis alert will appear every 10 seconds if poor posture continues.`;

        this.showSystemAlert(title, message);
    }

    showBreakTimerSystemAlert() {
        const title = 'BREAK TIME!';
        const message = '⏰ Time for a screen break!\n\nTake a moment to:\n• Stretch your body\n• Rest your eyes\n• Look away from the screen\n• Move around\n\nClick OK when you are ready to continue.';

        this.showSystemAlert(title, message);
    }

    initializeVantaBackground() {
        VANTA.BIRDS({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0x1a1a2e,
            color1: 0x667eea,
            color2: 0x764ba2,
            birdSize: 1.20,
            wingSpan: 25.00,
            speedLimit: 3.00,
            separation: 20.00,
            alignment: 20.00,
            cohesion: 20.00,
            quantity: 3.00
        });
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startMonitoring());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopMonitoring());
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                this.isMonitoring ? this.stopMonitoring() : this.startMonitoring();
            }
        });
    }

    setupTimerEventListeners() {
        // Time option selection
        document.querySelectorAll('.time-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTimeOption(e.target);
            });
        });

        // Timer control buttons
        document.getElementById('timer-start-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('timer-stop-btn').addEventListener('click', () => this.stopTimer());
    }

    selectTimeOption(option) {
        // Remove active class from all options
        document.querySelectorAll('.time-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Add active class to selected option
        option.classList.add('active');
        
        // Update timer duration
        this.selectedTimeOption = parseInt(option.dataset.minutes);
        this.timerDuration = this.selectedTimeOption * 60;
        this.timerRemaining = this.timerDuration;
        
        // Update display
        this.updateTimerDisplay();
        
        // Update progress bar
        this.updateTimerProgress();
        
        // Update next break text
        this.updateNextBreakText();
    }

    startTimer() {
        if (this.timerRunning) return;
        
        this.timerRunning = true;
        this.timerRemaining = this.timerDuration;
        
        // Update UI
        document.getElementById('timer-start-btn').disabled = true;
        document.getElementById('timer-stop-btn').disabled = false;
        document.querySelectorAll('.time-option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.style.opacity = '0.6';
        });
        
        // Start timer interval
        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            
            this.updateTimerDisplay();
            this.updateTimerProgress();
            
            // Check if timer reached zero
            if (this.timerRemaining <= 0) {
                this.timerComplete();
            }
        }, 1000);
        
        this.showNotification(`Break timer started for ${this.selectedTimeOption} minutes`, 'success');
    }

    stopTimer() {
        if (!this.timerRunning) return;
        
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        
        // Reset timer
        this.timerRemaining = this.timerDuration;
        
        // Update UI
        document.getElementById('timer-start-btn').disabled = false;
        document.getElementById('timer-stop-btn').disabled = true;
        document.querySelectorAll('.time-option').forEach(opt => {
            opt.style.pointerEvents = 'auto';
            opt.style.opacity = '1';
        });
        
        this.updateTimerDisplay();
        this.updateTimerProgress();
        
        this.showNotification('Break timer stopped', 'warning');
    }

    timerComplete() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        
        // Reset UI
        document.getElementById('timer-start-btn').disabled = false;
        document.getElementById('timer-stop-btn').disabled = true;
        document.querySelectorAll('.time-option').forEach(opt => {
            opt.style.pointerEvents = 'auto';
            opt.style.opacity = '1';
        });
        
        // Show completion alert
        this.showTimerCompletionAlert();
        
        // Reset timer
        this.timerRemaining = this.timerDuration;
        this.updateTimerDisplay();
        this.updateTimerProgress();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerRemaining / 60);
        const seconds = this.timerRemaining % 60;
        const display = document.getElementById('timer-display');
        
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Add alert animation when less than 1 minute remaining
        if (this.timerRemaining <= 60 && this.timerRunning) {
            display.classList.add('timer-alert');
        } else {
            display.classList.remove('timer-alert');
        }
    }

    updateTimerProgress() {
        const progressFill = document.getElementById('timer-progress-fill');
        const progressPercentage = ((this.timerDuration - this.timerRemaining) / this.timerDuration) * 100;
        
        progressFill.style.width = `${progressPercentage}%`;
        
        // Change color based on remaining time
        if (this.timerRemaining <= 60) { // Less than 1 minute
            progressFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (this.timerRemaining <= 300) { // Less than 5 minutes
            progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #eab308)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
        }
    }

    updateNextBreakText() {
        const nextBreakText = document.getElementById('next-break-text');
        if (this.timerRunning) {
            const minutes = Math.floor(this.timerRemaining / 60);
            const seconds = this.timerRemaining % 60;
            nextBreakText.textContent = `Next break in ${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            nextBreakText.textContent = `Set ${this.selectedTimeOption}min break for better focus`;
        }
    }

    showTimerCompletionAlert() {
        // Show in-app notification
        this.showNotification('🕒 Break Time! Take a moment to stretch and rest your eyes.', 'warning');
        
        // Show system alert
        this.showBreakTimerSystemAlert();
    }

    async startMonitoring() {
        if (this.isMonitoring) return;
        
        try {
            this.showNotification('Starting posture monitoring...', 'success');
            
            const modelURL = this.MODEL_URL + "model.json";
            const metadataURL = this.MODEL_URL + "metadata.json";

            // Load the model
            this.model = await tmPose.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();

            // Setup webcam
            const size = 400;
            const flip = true;
            this.webcam = new tmPose.Webcam(size, size, flip);
            await this.webcam.setup();
            await this.webcam.play();

            // Start the monitoring loop
            this.isMonitoring = true;
            window.requestAnimationFrame(() => this.loop());

            // Setup canvas
            const canvas = document.getElementById("canvas");
            canvas.width = size;
            canvas.height = size;
            this.ctx = canvas.getContext("2d");

            // Initialize session tracking
            this.sessionStartTime = Date.now();
            this.goodPostureCount = 0;
            this.totalPredictions = 0;
            this.postureHistory = [];
            
            // Reset poor posture tracking
            this.poorPostureStartTime = null;
            this.isPoorPostureAlertActive = false;
            
            // Start session timer
            this.monitoringInterval = setInterval(() => this.updateSessionTimer(), 1000);
            
            // Update UI
            this.updateUI();
            this.showNotification('Posture monitoring started successfully!', 'success');
            
        } catch (error) {
            console.error("Error starting monitoring:", error);
            this.showNotification('Error starting monitoring. Please check your camera and model URL.', 'error');
        }
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.webcam) {
            this.webcam.stop();
        }
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Clear canvas
        const canvas = document.getElementById("canvas");
        if (canvas && this.ctx) {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset poor posture tracking
        this.poorPostureStartTime = null;
        this.isPoorPostureAlertActive = false;
        
        this.updateUI();
        this.showNotification('Posture monitoring stopped.', 'warning');
    }

    async loop() {
        if (!this.isMonitoring || !this.webcam) return;
        
        this.webcam.update();
        await this.predict();
        window.requestAnimationFrame(() => this.loop());
    }

    async predict() {
        if (!this.model || !this.webcam) return;

        // Estimate pose
        const { pose, posenetOutput } = await this.model.estimatePose(this.webcam.canvas);
        
        // Get predictions
        const prediction = await this.model.predict(posenetOutput);
        
        // Process prediction and update all metrics
        this.processPrediction(prediction);
        
        // Check for poor posture
        this.checkPoorPosture(prediction);
        
        // Simulate blink detection
        this.simulateBlinkDetection();
        
        // Draw pose
        this.drawPose(pose);
    }

    processPrediction(prediction) {
        const container = document.getElementById('predictions-container');
        container.innerHTML = '';
        
        let highestProb = 0;
        let postureLabel = "Unknown";
        let currentPostureValue = 0; // -1 bad, 0 neutral, 1 good
        
        // Debug: Log actual class names from your model
        console.log('Model predictions:', prediction.map(p => ({ className: p.className, probability: p.probability })));
        
        prediction.forEach((pred, i) => {
            const probability = pred.probability * 100;
            
            // Track highest probability
            if (pred.probability > highestProb) {
                highestProb = pred.probability;
                postureLabel = pred.className;
            }
            
            // Create prediction item
            const item = document.createElement('div');
            item.className = 'bg-white/10 rounded-lg p-4 text-white';
            item.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${pred.className}</span>
                    <span class="text-sm font-mono">${probability.toFixed(1)}%</span>
                </div>
                <div class="prediction-bar">
                    <div class="prediction-fill" style="width: ${probability}%; background: ${this.getPredictionColor(probability)}"></div>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Determine current posture quality based on your actual class names
        const className = postureLabel.toLowerCase();
        
        // Check for healthy/good posture classes
        if (className.includes('healthy') || 
            className.includes('good') || 
            className.includes('proper') || 
            className.includes('correct')) {
            currentPostureValue = 1;
            this.goodPostureCount++;
        } 
        // Check for unhealthy/poor posture classes
        else if (className.includes('unhealthy') || 
                 className.includes('bad') || 
                 className.includes('poor') || 
                 className.includes('slouch') || 
                 className.includes('hunched') ||
                 className.includes('incorrect')) {
            currentPostureValue = -1;
        }
        // If neither, it's neutral/unknown
        else {
            currentPostureValue = 0;
        }
        
        this.totalPredictions++;
        
        // Update all metrics from the same data source
        this.updatePostureChart(currentPostureValue);
        
        // Store for consistency
        this.currentPostureValue = currentPostureValue;
        this.currentPostureLabel = postureLabel;
        this.currentPostureConfidence = highestProb;
    }

    checkPoorPosture(prediction) {
        const now = Date.now();
        let poorPostureDetected = false;
        let poorPostureConfidence = 0;

        // Check if any unhealthy posture class has confidence > 50%
        prediction.forEach(pred => {
            const className = pred.className.toLowerCase();
            
            // Updated to look for actual unhealthy posture class names
            if ((className.includes('unhealthy') || 
                 className.includes('bad') || 
                 className.includes('poor') || 
                 className.includes('slouch') || 
                 className.includes('hunched') ||
                 className.includes('incorrect')) && 
                pred.probability > this.poorPostureConfidenceThreshold) {
                poorPostureDetected = true;
                poorPostureConfidence = Math.max(poorPostureConfidence, pred.probability);
            }
        });

        if (poorPostureDetected) {
            // Start or continue poor posture timer
            if (!this.poorPostureStartTime) {
                this.poorPostureStartTime = now;
                console.log(`Poor posture detected with ${(poorPostureConfidence * 100).toFixed(1)}% confidence. Starting timer...`);
            } else {
                const poorPostureDuration = now - this.poorPostureStartTime;
                
                // Check if poor posture has persisted for more than 3 seconds
                if (poorPostureDuration >= this.poorPostureThreshold) {
                    // Check cooldown to avoid spam
                    if (now - this.lastPoorPostureAlertTime >= this.poorPostureAlertCooldown) {
                        console.log(`🚨 Triggering alert! Poor posture for ${poorPostureDuration}ms`);
                        this.triggerPoorPostureAlert(poorPostureConfidence, poorPostureDuration);
                        this.lastPoorPostureAlertTime = now;
                    }
                } else {
                    // Show countdown in console for debugging
                    const remaining = this.poorPostureThreshold - poorPostureDuration;
                    if (remaining % 1000 < 50) {
                        console.log(`Poor posture: ${(poorPostureDuration/1000).toFixed(1)}s/${this.poorPostureThreshold/1000}s`);
                    }
                }
            }
        } else {
            // Reset poor posture timer if good posture detected
            if (this.poorPostureStartTime) {
                console.log('Good posture detected. Resetting poor posture timer.');
                this.poorPostureStartTime = null;
                this.isPoorPostureAlertActive = false;
            }
        }
    }

    triggerPoorPostureAlert(confidence, duration) {
        if (this.isPoorPostureAlertActive) return;
        
        this.isPoorPostureAlertActive = true;
        
        const confidencePercent = (confidence * 100).toFixed(1);
        const durationSeconds = (duration / 1000).toFixed(1);
        
        console.log(`🚨 POOR POSTURE ALERT! ${confidencePercent}% confidence for ${durationSeconds} seconds`);
        
        // Show system alert - this will block the browser until user clicks OK
        this.showPoorPostureSystemAlert(confidence, duration);
        
        // Visual feedback on the interface
        this.showPoorPostureVisualAlert();
        
        // Reset the timer after alert
        setTimeout(() => {
            this.poorPostureStartTime = null;
            this.isPoorPostureAlertActive = false;
        }, 2000);
    }

    showPoorPostureVisualAlert() {
        // Add visual feedback to the predictions container
        const container = document.getElementById('predictions-container');
        if (container) {
            container.style.border = '2px solid #ef4444';
            container.style.boxShadow = '0 0 20px #ef4444';
            
            // Remove visual feedback after 3 seconds
            setTimeout(() => {
                container.style.border = '';
                container.style.boxShadow = '';
            }, 3000);
        }
    }

    getPredictionColor(probability) {
        if (probability >= 80) return '#10b981'; // Green
        if (probability >= 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    }

    updatePostureChart(postureValue) {
        this.postureHistory.push(postureValue);
        if (this.postureHistory.length > 20) {
            this.postureHistory.shift();
        }
        
        // Update chart visualization
        const chart = document.getElementById('posture-chart');
        chart.innerHTML = '';
        
        this.postureHistory.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = value === 1 ? '80%' : value === -1 ? '20%' : '50%';
            bar.style.background = value === 1 ? '#10b981' : value === -1 ? '#ef4444' : '#f59e0b';
            bar.title = `Reading ${index + 1}: ${value === 1 ? 'Good' : value === -1 ? 'Poor' : 'Fair'}`;
            chart.appendChild(bar);
        });
    }

    simulateBlinkDetection() {
        // Simulate blink detection
        if (Math.random() < 0.03) { // 3% chance each frame
            this.blinkCount++;
            this.lastBlinkTime = Date.now();
        }
        
        // Update eye strain risk
        const timeSinceLastBlink = Date.now() - this.lastBlinkTime;
        const eyeStatusElement = document.getElementById('eye-status');
        const eyeIndicatorElement = document.getElementById('eye-indicator');
        
        eyeIndicatorElement.className = 'status-indicator';
        
        if (timeSinceLastBlink < 5000) { // 5 seconds
            eyeStatusElement.textContent = 'Low';
            eyeIndicatorElement.classList.add('status-good');
        } else if (timeSinceLastBlink < 15000) { // 15 seconds
            eyeStatusElement.textContent = 'Medium';
            eyeIndicatorElement.classList.add('status-warning');
        } else {
            eyeStatusElement.textContent = 'High';
            eyeIndicatorElement.classList.add('status-bad');
        }
    }

    drawPose(pose) {
        if (this.webcam.canvas && this.ctx) {
            this.ctx.drawImage(this.webcam.canvas, 0, 0);
            
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, this.ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, this.ctx);
            }
        }
    }

    updateSessionTimer() {
        if (this.sessionStartTime) {
            const now = Date.now();
            const diff = Math.floor((now - this.sessionStartTime) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const sessionTimeElements = document.querySelectorAll('#session-time');
            sessionTimeElements.forEach(el => el.textContent = timeString);
        }
        
        // Update next break text if timer is running
        if (this.timerRunning) {
            this.updateNextBreakText();
        }
    }

    updateUI() {
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (this.isMonitoring) {
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50');
            stopBtn.disabled = false;
            stopBtn.classList.remove('opacity-50');
        } else {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-50');
            stopBtn.disabled = true;
            stopBtn.classList.add('opacity-50');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postureAI = new PostureAI();
});

// Add some utility functions for enhanced UX
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + F for fullscreen
        if (e.key === 'f' && e.ctrlKey) {
            e.preventDefault();
            document.getElementById('fullscreen-btn').click();
        }
        
        // Escape to stop monitoring
        if (e.key === 'Escape') {
            if (window.postureAI && window.postureAI.isMonitoring) {
                window.postureAI.stopMonitoring();
            }
        }
        
        // Space to start/stop timer
        if (e.key === ' ' && !e.ctrlKey) {
            e.preventDefault();
            if (window.postureAI) {
                if (window.postureAI.timerRunning) {
                    window.postureAI.stopTimer();
                } else {
                    window.postureAI.startTimer();
                }
            }
        }
    });
}

// Initialize keyboard shortcuts
document.addEventListener('DOMContentLoaded', addKeyboardShortcuts);
