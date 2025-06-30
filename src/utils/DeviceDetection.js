// Device Detection Utility for Performance Optimization

export class DeviceDetection {
    constructor() {
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = false;
        this.hasTouch = false;
        this.pixelRatio = 1;
        this.cores = 1;
        this.memory = 1;
        this.gpu = null;
        this.qualityLevel = 'medium';
        
        this.userAgent = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform.toLowerCase();
    }

    detect() {
        this.detectDeviceType();
        this.detectHardware();
        this.detectCapabilities();
        this.determineQualityLevel();
        
        console.log('Device detection complete:', {
            type: this.getDeviceType(),
            quality: this.qualityLevel,
            touch: this.hasTouch,
            cores: this.cores,
            memory: this.memory
        });
    }

    detectDeviceType() {
        // Mobile detection
        this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent) ||
                        (window.innerWidth <= 768 && window.innerHeight <= 1024);
        
        // Tablet detection
        this.isTablet = (/ipad/i.test(this.userAgent) || 
                        (/android/i.test(this.userAgent) && !/mobile/i.test(this.userAgent))) ||
                        (window.innerWidth > 768 && window.innerWidth <= 1024);
        
        // Desktop
        this.isDesktop = !this.isMobile && !this.isTablet;
        
        // Touch capability
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Pixel ratio
        this.pixelRatio = window.devicePixelRatio || 1;
    }

    detectHardware() {
        // CPU cores
        this.cores = navigator.hardwareConcurrency || 1;
        
        // Memory (if available)
        if (navigator.deviceMemory) {
            this.memory = navigator.deviceMemory;
        } else {
            // Estimate based on device type
            if (this.isMobile) {
                this.memory = 2; // Assume 2GB for mobile
            } else if (this.isTablet) {
                this.memory = 4; // Assume 4GB for tablet
            } else {
                this.memory = 8; // Assume 8GB for desktop
            }
        }
        
        // GPU detection
        this.detectGPU();
    }

    detectGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    this.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                } else {
                    this.gpu = gl.getParameter(gl.RENDERER);
                }
            }
        } catch (e) {
            console.warn('GPU detection failed:', e);
            this.gpu = 'Unknown';
        }
    }

    detectCapabilities() {
        // WebGL support
        this.webglSupported = this.hasWebGLSupport();
        
        // WebGL 2 support
        this.webgl2Supported = this.hasWebGL2Support();
        
        // High-performance GPU hints
        this.hasHighPerformanceGPU = this.checkHighPerformanceGPU();
        
        // Battery status (if available)
        this.checkBatteryStatus();
    }

    hasWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    hasWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }

    checkHighPerformanceGPU() {
        if (!this.gpu) return false;
        
        const highPerformanceIndicators = [
            'nvidia', 'geforce', 'gtx', 'rtx', 'quadro',
            'amd', 'radeon', 'rx ', 'vega', 'fury',
            'intel iris', 'intel uhd', 'intel hd'
        ];
        
        const gpuLower = this.gpu.toLowerCase();
        return highPerformanceIndicators.some(indicator => 
            gpuLower.includes(indicator)
        );
    }

    async checkBatteryStatus() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                this.batteryLevel = battery.level;
                this.isCharging = battery.charging;
            } catch (e) {
                console.warn('Battery status detection failed:', e);
            }
        }
    }

    determineQualityLevel() {
        let score = 0;
        
        // Device type scoring
        if (this.isDesktop) score += 30;
        else if (this.isTablet) score += 20;
        else score += 10; // mobile
        
        // Hardware scoring
        score += Math.min(this.cores * 5, 20); // Max 20 points for CPU
        score += Math.min(this.memory * 3, 15); // Max 15 points for memory
        
        // GPU scoring
        if (this.hasHighPerformanceGPU) score += 20;
        else if (this.webgl2Supported) score += 15;
        else if (this.webglSupported) score += 10;
        
        // Battery considerations
        if (this.batteryLevel !== undefined) {
            if (this.batteryLevel < 0.2 && !this.isCharging) {
                score -= 15; // Reduce quality on low battery
            }
        }
        
        // Pixel ratio considerations
        if (this.pixelRatio > 2) score -= 5; // High DPI can impact performance
        
        // Determine quality level
        if (score >= 70) {
            this.qualityLevel = 'high';
        } else if (score >= 45) {
            this.qualityLevel = 'medium';
        } else {
            this.qualityLevel = 'low';
        }
        
        console.log(`Quality score: ${score}, Level: ${this.qualityLevel}`);
    }

    getDeviceType() {
        if (this.isMobile) return 'mobile';
        if (this.isTablet) return 'tablet';
        return 'desktop';
    }

    getQualityLevel() {
        return this.qualityLevel;
    }

    getRecommendedParticleCount() {
        switch (this.qualityLevel) {
            case 'high': return this.isDesktop ? 10000 : 7500;
            case 'medium': return this.isDesktop ? 5000 : 3000;
            case 'low': return this.isMobile ? 1500 : 2500;
            default: return 5000;
        }
    }

    getRecommendedSettings() {
        const settings = {
            particles: this.getRecommendedParticleCount(),
            shadows: this.qualityLevel === 'high',
            antialiasing: this.qualityLevel !== 'low',
            postProcessing: this.qualityLevel === 'high',
            animationComplexity: this.qualityLevel,
            textureQuality: this.qualityLevel,
            pixelRatio: this.qualityLevel === 'high' ? Math.min(this.pixelRatio, 2) : 1
        };
        
        // Adjust for mobile
        if (this.isMobile) {
            settings.shadows = false;
            settings.postProcessing = false;
            settings.particles = Math.min(settings.particles, 2500);
        }
        
        // Adjust for touch devices
        if (this.hasTouch && !this.isDesktop) {
            settings.hoverEffects = false;
            settings.mouseCursor = false;
        }
        
        return settings;
    }

    // Monitor performance changes
    startPerformanceMonitoring() {
        // Monitor battery changes
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = battery.level;
                    if (battery.level < 0.2 && this.qualityLevel === 'high') {
                        console.log('Low battery detected, reducing quality');
                        this.qualityLevel = 'medium';
                    }
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.isCharging = battery.charging;
                });
            });
        }
        
        // Monitor window resize for device orientation changes
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.detectDeviceType();
            }, 100);
        });
    }

    // Get specific optimizations for different components
    getParticleSystemConfig() {
        return {
            count: this.getRecommendedParticleCount(),
            connections: this.qualityLevel !== 'low',
            mouseInteraction: !this.isMobile,
            animationComplexity: this.qualityLevel === 'high' ? 'full' : 'simple'
        };
    }

    getGlitchTextConfig() {
        return {
            intensity: this.qualityLevel === 'high' ? 1 : 0.6,
            frequency: this.qualityLevel === 'low' ? 0.5 : 1,
            layers: this.qualityLevel === 'high' ? 3 : 1
        };
    }

    getCodeBlockConfig() {
        return {
            resolution: this.qualityLevel === 'high' ? 1024 : 512,
            rotationSpeed: this.qualityLevel === 'low' ? 0.5 : 1,
            neonEffects: this.qualityLevel !== 'low'
        };
    }

    // Check if reduced motion is preferred
    respectsReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Get motion settings
    getMotionSettings() {
        const reducedMotion = this.respectsReducedMotion();
        
        return {
            enableParallax: !reducedMotion && this.qualityLevel !== 'low',
            enableAutoplay: !reducedMotion,
            animationDuration: reducedMotion ? 0.3 : 1,
            enableHoverEffects: !reducedMotion && !this.isMobile
        };
    }
}
