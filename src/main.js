// 3D Portfolio - Main JavaScript Entry Point

import { ParticleSystem } from './components/ParticleSystem.js';
import { GlitchText } from './components/GlitchText.js';
import { CodeBlock3D } from './components/CodeBlock3D.js';
import { Navigation } from './components/Navigation.js';
import { ProjectShowcase } from './components/ProjectShowcase.js';
import { MainScene } from './scenes/MainScene.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import { DeviceDetection } from './utils/DeviceDetection.js';

class Portfolio3D {
    constructor() {
        this.isInitialized = false;
        this.scenes = {};
        this.components = {};
        this.loaders = {};
        
        // Performance monitoring
        this.performanceMonitor = new PerformanceMonitor();
        this.deviceDetection = new DeviceDetection();
        
        // Mouse tracking for interactive elements
        this.mouse = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        
        // Animation frame management
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Scene management
        this.currentSection = 'hero';
        this.sections = ['hero', 'about', 'projects', 'skills', 'contact'];
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize device detection and performance settings
            this.deviceDetection.detect();
            this.performanceMonitor.start();
            
            // Initialize asset loader
            this.loaders.assetLoader = new AssetLoader();
            
            // Load critical assets
            await this.loadCriticalAssets();
            
            // Initialize core systems
            this.initializeEventListeners();
            this.initializeMouseTracking();
            this.initializeScrollTracking();
            
            // Initialize components
            await this.initializeComponents();
            
            // Initialize scenes
            await this.initializeScenes();
            
            // Start render loop
            this.startRenderLoop();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Portfolio 3D initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Portfolio 3D:', error);
            this.showErrorMessage('Failed to load 3D portfolio. Please refresh the page.');
        }
    }

    async loadCriticalAssets() {
        const assets = [
            { type: 'texture', name: 'particle', url: 'assets/textures/particle.png' },
            { type: 'texture', name: 'grid', url: 'assets/textures/grid.png' },
            { type: 'font', name: 'firaCode', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;700&display=swap' }
        ];

        let loadedCount = 0;
        const totalCount = assets.length;

        for (const asset of assets) {
            try {
                await this.loaders.assetLoader.load(asset.type, asset.name, asset.url);
                loadedCount++;
                this.updateLoadingProgress((loadedCount / totalCount) * 50); // 50% for assets
            } catch (error) {
                console.warn(`Failed to load asset: ${asset.name}`, error);
            }
        }
    }

    async initializeComponents() {
        try {
            // Initialize Navigation
            this.components.navigation = new Navigation();
            this.updateLoadingProgress(60);

            // Initialize Glitch Text
            this.components.glitchText = new GlitchText();
            this.updateLoadingProgress(70);

            // Initialize Particle System
            this.components.particleSystem = new ParticleSystem({
                particleCount: this.deviceDetection.isMobile ? 5000 : 10000,
                quality: this.deviceDetection.getQualityLevel()
            });
            this.updateLoadingProgress(80);

            // Initialize Code Blocks
            this.components.codeBlocks = new CodeBlock3D();
            this.updateLoadingProgress(85);

            // Initialize Project Showcase
            this.components.projectShowcase = new ProjectShowcase();
            this.updateLoadingProgress(90);

        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw error;
        }
    }

    async initializeScenes() {
        try {
            // Initialize main scene manager
            this.scenes.main = new MainScene({
                particleSystem: this.components.particleSystem,
                codeBlocks: this.components.codeBlocks,
                projectShowcase: this.components.projectShowcase
            });

            await this.scenes.main.init();
            this.updateLoadingProgress(95);

        } catch (error) {
            console.error('Failed to initialize scenes:', error);
            throw error;
        }
    }

    initializeEventListeners() {
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Visibility change for performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Touch events for mobile
        if (this.deviceDetection.isMobile) {
            this.initializeTouchEvents();
        }
        
        // Performance monitoring
        this.performanceMonitor.onPerformanceChange = (level) => {
            this.adjustQuality(level);
        };
    }

    initializeMouseTracking() {
        let mouseMoveHandler = (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.mouse.normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.normalizedY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.isMouseMoving = true;
            
            // Update custom cursor
            this.updateCustomCursor(event.clientX, event.clientY);
            
            // Clear timeout
            if (this.mouseTimeout) {
                clearTimeout(this.mouseTimeout);
            }
            
            // Set timeout to detect when mouse stops moving
            this.mouseTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 100);
        };

        // Throttle mouse move events for performance
        let throttledMouseMove = this.throttle(mouseMoveHandler, 16); // ~60fps
        document.addEventListener('mousemove', throttledMouseMove);
    }

    initializeScrollTracking() {
        let scrollHandler = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Determine current section
            const sectionHeight = windowHeight;
            const currentSectionIndex = Math.floor(scrollY / sectionHeight);
            const newSection = this.sections[Math.min(currentSectionIndex, this.sections.length - 1)];
            
            if (newSection !== this.currentSection) {
                this.currentSection = newSection;
                this.onSectionChange(newSection);
            }
            
            // Update scroll progress
            const scrollProgress = scrollY / (documentHeight - windowHeight);
            this.onScrollProgress(scrollProgress);
        };

        // Throttle scroll events
        let throttledScroll = this.throttle(scrollHandler, 16); // ~60fps
        window.addEventListener('scroll', throttledScroll);
    }

    initializeTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        });

        document.addEventListener('touchmove', (event) => {
            // Prevent default scrolling for better performance
            if (Math.abs(event.touches[0].clientX - touchStartX) > 10) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    startRenderLoop() {
        const render = (currentTime) => {
            // Calculate delta time
            this.deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            // Update performance monitor
            this.performanceMonitor.update();

            // Update components
            if (this.components.particleSystem) {
                this.components.particleSystem.update(this.deltaTime, this.mouse);
            }

            if (this.components.codeBlocks) {
                this.components.codeBlocks.update(this.deltaTime);
            }

            if (this.components.projectShowcase) {
                this.components.projectShowcase.update(this.deltaTime);
            }

            // Render scenes
            if (this.scenes.main) {
                this.scenes.main.render();
            }

            this.animationFrameId = requestAnimationFrame(render);
        };

        this.animationFrameId = requestAnimationFrame(render);
    }

    onSectionChange(section) {
        console.log(`Section changed to: ${section}`);
        
        // Update navigation active state
        if (this.components.navigation) {
            this.components.navigation.setActiveSection(section);
        }

        // Update scene focus
        if (this.scenes.main) {
            this.scenes.main.focusSection(section);
        }

        // Trigger section-specific animations
        this.triggerSectionAnimations(section);
    }

    triggerSectionAnimations(section) {
        switch (section) {
            case 'hero':
                this.components.glitchText.animate('.hero-title .glitch-text');
                break;
            case 'about':
                this.animateTimeline();
                break;
            case 'projects':
                this.components.projectShowcase.animateEntry();
                break;
            case 'skills':
                this.animateSkillBars();
                break;
            case 'contact':
                this.animateContactForm();
                break;
        }
    }

    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            anime({
                targets: item,
                translateX: [50, 0],
                opacity: [0, 1],
                delay: index * 200,
                duration: 800,
                easing: 'easeOutQuart'
            });
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            const progress = bar.getAttribute('data-progress');
            anime({
                targets: bar,
                width: `${progress}%`,
                delay: index * 100,
                duration: 1000,
                easing: 'easeOutQuart'
            });
        });
    }

    animateContactForm() {
        const formGroups = document.querySelectorAll('.form-group');
        anime({
            targets: formGroups,
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }

    onScrollProgress(progress) {
        // Update any scroll-based animations
        if (this.components.particleSystem) {
            this.components.particleSystem.setScrollProgress(progress);
        }
    }

    updateCustomCursor(x, y) {
        document.documentElement.style.setProperty('--cursor-x', `${x}px`);
        document.documentElement.style.setProperty('--cursor-y', `${y}px`);
    }

    adjustQuality(level) {
        console.log(`Adjusting quality to level: ${level}`);
        
        if (this.components.particleSystem) {
            this.components.particleSystem.setQuality(level);
        }

        if (this.components.codeBlocks) {
            this.components.codeBlocks.setQuality(level);
        }

        if (this.scenes.main) {
            this.scenes.main.setQuality(level);
        }
    }

    handleResize() {
        if (this.scenes.main) {
            this.scenes.main.resize();
        }

        if (this.components.particleSystem) {
            this.components.particleSystem.resize();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
        } else {
            // Resume animations when tab becomes visible
            this.startRenderLoop();
        }
    }

    handleKeyDown(event) {
        // Keyboard shortcuts for navigation
        switch (event.key) {
            case '1':
                this.scrollToSection('hero');
                break;
            case '2':
                this.scrollToSection('about');
                break;
            case '3':
                this.scrollToSection('projects');
                break;
            case '4':
                this.scrollToSection('skills');
                break;
            case '5':
                this.scrollToSection('contact');
                break;
            case 'Escape':
                // Close any modals or overlays
                break;
        }
    }

    scrollToSection(section) {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            anime({
                targets: loadingScreen,
                opacity: 0,
                duration: 500,
                easing: 'easeOutQuart',
                complete: () => {
                    loadingScreen.style.display = 'none';
                }
            });
        }
        this.updateLoadingProgress(100);
    }

    updateLoadingProgress(percentage) {
        const progressBar = document.querySelector('.loading-progress');
        const percentageText = document.querySelector('.loading-percentage');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (percentageText) {
            percentageText.textContent = `${Math.round(percentage)}%`;
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="neon-button primary">Reload Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    destroy() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleKeyDown);

        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Destroy scenes
        Object.values(this.scenes).forEach(scene => {
            if (scene && typeof scene.destroy === 'function') {
                scene.destroy();
            }
        });

        // Stop performance monitoring
        if (this.performanceMonitor) {
            this.performanceMonitor.stop();
        }

        console.log('Portfolio 3D destroyed');
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio3D = new Portfolio3D();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.portfolio3D) {
        window.portfolio3D.destroy();
    }
});

export default Portfolio3D;
