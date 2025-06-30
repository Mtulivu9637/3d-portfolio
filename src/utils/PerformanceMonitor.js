// Performance Monitor for Adaptive Quality

export class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = 0;
        this.isMonitoring = false;
        this.onPerformanceChange = null;
        this.qualityLevel = 'medium';
        this.performanceHistory = [];
    }

    start() {
        this.isMonitoring = true;
        this.lastTime = performance.now();
        console.log('Performance monitoring started');
    }

    stop() {
        this.isMonitoring = false;
        console.log('Performance monitoring stopped');
    }

    update() {
        if (!this.isMonitoring) return;

        const currentTime = performance.now();
        this.frameCount++;

        // Calculate FPS every second
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;

            this.analyzePerformance();
        }
    }

    analyzePerformance() {
        this.performanceHistory.push(this.fps);
        
        // Keep only last 10 measurements
        if (this.performanceHistory.length > 10) {
            this.performanceHistory.shift();
        }

        const averageFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
        let newQualityLevel = this.qualityLevel;

        if (averageFPS < 25 && this.qualityLevel !== 'low') {
            newQualityLevel = 'low';
        } else if (averageFPS > 45 && this.qualityLevel === 'low') {
            newQualityLevel = 'medium';
        } else if (averageFPS > 55 && this.qualityLevel === 'medium') {
            newQualityLevel = 'high';
        } else if (averageFPS < 35 && this.qualityLevel === 'high') {
            newQualityLevel = 'medium';
        }

        if (newQualityLevel !== this.qualityLevel) {
            this.qualityLevel = newQualityLevel;
            console.log(`Performance adjusted to: ${this.qualityLevel} (${Math.round(averageFPS)} FPS)`);
            
            if (this.onPerformanceChange) {
                this.onPerformanceChange(this.qualityLevel);
            }
        }
    }

    getCurrentFPS() {
        return this.fps;
    }

    getQualityLevel() {
        return this.qualityLevel;
    }
}
