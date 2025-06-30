// Glitch Text Component with Advanced Digital Effects

export class GlitchText {
    constructor(options = {}) {
        this.options = {
            intensity: options.intensity || 1,
            speed: options.speed || 1,
            colors: options.colors || ['#00ffff', '#ff00ff', '#00ff00'],
            glitchChance: options.glitchChance || 0.1,
            scrambleChance: options.scrambleChance || 0.05,
            ...options
        };

        this.elements = new Map();
        this.animationFrameId = null;
        this.isAnimating = false;
        this.time = 0;
        
        // Character sets for scrambling
        this.characterSets = {
            alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            binary: '01',
            matrix: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
            code: '{}[]()<>=+-*/&|^~!@#$%'
        };
        
        this.init();
    }

    init() {
        this.findGlitchElements();
        this.setupIntersectionObserver();
        this.bindEvents();
        
        console.log(`Glitch text initialized with ${this.elements.size} elements`);
    }

    findGlitchElements() {
        const glitchElements = document.querySelectorAll('.glitch-text');
        
        glitchElements.forEach(element => {
            const config = {
                originalText: element.textContent,
                dataText: element.getAttribute('data-text') || element.textContent,
                isVisible: false,
                glitchLevel: 0,
                scrambleTimer: 0,
                lastGlitch: 0,
                characterSet: this.determineCharacterSet(element),
                animationType: element.getAttribute('data-animation') || 'standard'
            };
            
            this.elements.set(element, config);
            this.prepareElement(element);
        });
    }

    prepareElement(element) {
        const config = this.elements.get(element);
        
        // Add CSS classes for styling
        element.classList.add('glitch-text-prepared');
        
        // Set up data attributes for CSS animations
        element.setAttribute('data-text', config.dataText);
        
        // Create additional layers for complex effects
        this.createGlitchLayers(element);
    }

    createGlitchLayers(element) {
        // Create container for glitch layers
        const container = document.createElement('div');
        container.className = 'glitch-container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        
        // Wrap the original element
        const parent = element.parentNode;
        parent.insertBefore(container, element);
        container.appendChild(element);
        
        // Create additional glitch layers
        for (let i = 0; i < 3; i++) {
            const layer = document.createElement('span');
            layer.className = `glitch-layer glitch-layer-${i}`;
            layer.textContent = element.textContent;
            layer.setAttribute('data-text', element.getAttribute('data-text'));
            layer.style.position = 'absolute';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.pointerEvents = 'none';
            layer.style.opacity = '0';
            
            container.appendChild(layer);
        }
    }

    determineCharacterSet(element) {
        const text = element.textContent.toLowerCase();
        
        if (text.includes('code') || text.includes('dev') || text.includes('{') || text.includes('[')) {
            return 'code';
        } else if (text.includes('0') || text.includes('1') || element.dataset.type === 'binary') {
            return 'binary';
        } else if (element.dataset.type === 'matrix') {
            return 'matrix';
        } else {
            return 'alphanumeric';
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const config = this.elements.get(entry.target);
                if (config) {
                    config.isVisible = entry.isIntersecting;
                    
                    if (entry.isIntersecting) {
                        this.startAnimation();
                    }
                }
            });
        }, { threshold: 0.1 });

        this.elements.forEach((config, element) => {
            observer.observe(element);
        });
    }

    animate(selector) {
        if (selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.elements.has(element)) {
                    this.triggerGlitch(element, 2000); // 2 second intense glitch
                }
            });
        } else {
            // Animate all visible elements
            this.elements.forEach((config, element) => {
                if (config.isVisible) {
                    this.triggerGlitch(element, 1000);
                }
            });
        }
    }

    triggerGlitch(element, duration = 1000, intensity = 1) {
        const config = this.elements.get(element);
        if (!config) return;

        const startTime = this.time;
        config.lastGlitch = startTime;

        // Animate glitch intensity
        anime({
            targets: { level: 0 },
            level: intensity,
            duration: duration * 0.2,
            easing: 'easeOutQuart',
            update: (anim) => {
                config.glitchLevel = anim.animatables[0].target.level;
            }
        });

        // Fade out glitch
        anime({
            targets: { level: intensity },
            level: 0,
            duration: duration * 0.8,
            delay: duration * 0.2,
            easing: 'easeOutQuart',
            update: (anim) => {
                config.glitchLevel = anim.animatables[0].target.level;
            }
        });

        // Trigger scramble effects
        this.scrambleText(element, duration);
        
        // Trigger visual glitches
        this.triggerVisualGlitch(element, duration);
    }

    scrambleText(element, duration) {
        const config = this.elements.get(element);
        if (!config) return;

        const originalText = config.originalText;
        const characters = this.characterSets[config.characterSet];
        let scrambleProgress = 0;
        const scrambleSpeed = 50; // ms between character changes

        const scrambleInterval = setInterval(() => {
            scrambleProgress += scrambleSpeed / duration;

            if (scrambleProgress >= 1) {
                element.textContent = originalText;
                clearInterval(scrambleInterval);
                return;
            }

            let scrambledText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < scrambleProgress) {
                    // Character is revealed
                    scrambledText += originalText[i];
                } else {
                    // Character is scrambled
                    if (originalText[i] === ' ') {
                        scrambledText += ' ';
                    } else {
                        scrambledText += characters[Math.floor(Math.random() * characters.length)];
                    }
                }
            }

            element.textContent = scrambledText;
        }, scrambleSpeed);
    }

    triggerVisualGlitch(element, duration) {
        const container = element.parentNode;
        if (!container || !container.classList.contains('glitch-container')) return;

        const layers = container.querySelectorAll('.glitch-layer');
        
        layers.forEach((layer, index) => {
            // Random glitch timing for each layer
            const delay = Math.random() * duration * 0.3;
            const layerDuration = duration * 0.7;
            
            setTimeout(() => {
                this.animateGlitchLayer(layer, layerDuration, index);
            }, delay);
        });
    }

    animateGlitchLayer(layer, duration, layerIndex) {
        const colors = this.options.colors;
        const color = colors[layerIndex % colors.length];
        
        // Set layer color
        layer.style.color = color;
        layer.style.textShadow = `0 0 10px ${color}`;
        
        // Animate layer with glitch effects
        anime({
            targets: layer,
            translateX: () => (Math.random() - 0.5) * 20,
            translateY: () => (Math.random() - 0.5) * 10,
            scaleX: () => 1 + (Math.random() - 0.5) * 0.1,
            scaleY: () => 1 + (Math.random() - 0.5) * 0.1,
            opacity: [0, 0.8, 0],
            duration: 200,
            easing: 'linear',
            loop: Math.floor(duration / 200),
            loopComplete: (anim) => {
                // Random position changes on each loop
                anim.animatables[0].target.style.transform = `
                    translateX(${(Math.random() - 0.5) * 20}px)
                    translateY(${(Math.random() - 0.5) * 10}px)
                    scaleX(${1 + (Math.random() - 0.5) * 0.1})
                    scaleY(${1 + (Math.random() - 0.5) * 0.1})
                `;
            },
            complete: () => {
                // Reset layer
                layer.style.opacity = '0';
                layer.style.transform = 'none';
            }
        });
    }

    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animationLoop();
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    animationLoop() {
        if (!this.isAnimating) return;

        this.time += 16; // Approximate 60fps

        // Update continuous glitch effects
        this.elements.forEach((config, element) => {
            if (!config.isVisible) return;

            // Random glitch trigger
            if (Math.random() < this.options.glitchChance * 0.001) {
                this.triggerGlitch(element, 500, 0.5);
            }

            // Continuous subtle effects
            this.updateContinuousEffects(element, config);
        });

        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }

    updateContinuousEffects(element, config) {
        // Subtle text shadow flicker
        const flickerIntensity = Math.sin(this.time * 0.01) * 0.5 + 0.5;
        const shadowColor = this.options.colors[0];
        const shadowBlur = flickerIntensity * 5;
        
        element.style.textShadow = `0 0 ${shadowBlur}px ${shadowColor}`;

        // Random character scramble
        config.scrambleTimer += 16;
        if (config.scrambleTimer > 2000 && Math.random() < this.options.scrambleChance * 0.01) {
            this.scrambleSingleCharacter(element, config);
            config.scrambleTimer = 0;
        }
    }

    scrambleSingleCharacter(element, config) {
        const text = element.textContent;
        const characters = this.characterSets[config.characterSet];
        const randomIndex = Math.floor(Math.random() * text.length);
        
        if (text[randomIndex] === ' ') return;

        const scrambledChar = characters[Math.floor(Math.random() * characters.length)];
        const newText = text.substring(0, randomIndex) + scrambledChar + text.substring(randomIndex + 1);
        
        element.textContent = newText;
        
        // Restore original character after short delay
        setTimeout(() => {
            element.textContent = config.originalText;
        }, 100);
    }

    // Typewriter effect for hero section
    typewrite(element, text, speed = 100) {
        if (!element) return;

        element.textContent = '';
        let i = 0;

        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                
                // Random glitch during typing
                if (Math.random() < 0.1) {
                    this.triggerGlitch(element, 200, 0.3);
                }
            } else {
                clearInterval(typeInterval);
                // Final glitch effect
                setTimeout(() => {
                    this.triggerGlitch(element, 1000, 1);
                }, 500);
            }
        }, speed);
    }

    // Matrix-style falling characters effect
    matrixRain(container, duration = 5000) {
        const characters = this.characterSets.matrix;
        const columnCount = Math.floor(container.offsetWidth / 20);
        
        for (let i = 0; i < columnCount; i++) {
            setTimeout(() => {
                this.createMatrixColumn(container, characters, i * 20);
            }, Math.random() * 1000);
        }
    }

    createMatrixColumn(container, characters, xPosition) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = `${xPosition}px`;
        column.style.top = '0';
        column.style.color = this.options.colors[2]; // Green
        column.style.fontSize = '14px';
        column.style.fontFamily = 'monospace';
        column.style.pointerEvents = 'none';
        column.style.zIndex = '1';
        
        container.appendChild(column);

        let yPosition = -20;
        const fallSpeed = 2 + Math.random() * 3;
        
        const fallInterval = setInterval(() => {
            yPosition += fallSpeed;
            column.style.top = `${yPosition}px`;
            
            // Add random character
            if (Math.random() < 0.3) {
                const char = document.createElement('div');
                char.textContent = characters[Math.floor(Math.random() * characters.length)];
                char.style.opacity = Math.random().toString();
                column.appendChild(char);
            }
            
            // Remove when off screen
            if (yPosition > container.offsetHeight + 100) {
                clearInterval(fallInterval);
                container.removeChild(column);
            }
            
            // Fade older characters
            Array.from(column.children).forEach((char, index) => {
                const opacity = Math.max(0, 1 - (index * 0.1));
                char.style.opacity = opacity.toString();
            });
        }, 50);
    }

    // Glitch text on hover
    setupHoverEffects() {
        this.elements.forEach((config, element) => {
            element.addEventListener('mouseenter', () => {
                this.triggerGlitch(element, 800, 0.7);
            });
            
            element.addEventListener('mouseleave', () => {
                element.textContent = config.originalText;
            });
        });
    }

    // Update element text while preserving glitch setup
    updateText(element, newText) {
        const config = this.elements.get(element);
        if (!config) return;

        config.originalText = newText;
        config.dataText = newText;
        element.setAttribute('data-text', newText);
        element.textContent = newText;
        
        // Update glitch layers
        const container = element.parentNode;
        if (container && container.classList.contains('glitch-container')) {
            const layers = container.querySelectorAll('.glitch-layer');
            layers.forEach(layer => {
                layer.textContent = newText;
                layer.setAttribute('data-text', newText);
            });
        }
    }

    bindEvents() {
        // Auto-start animation when elements become visible
        this.startAnimation();
        
        // Set up hover effects
        this.setupHoverEffects();
        
        // Handle reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.options.intensity *= 0.3;
            this.options.glitchChance *= 0.1;
        }
    }

    destroy() {
        this.stopAnimation();
        
        // Clean up DOM modifications
        this.elements.forEach((config, element) => {
            element.textContent = config.originalText;
            element.classList.remove('glitch-text-prepared');
            
            // Remove glitch container if it exists
            const container = element.parentNode;
            if (container && container.classList.contains('glitch-container')) {
                const parent = container.parentNode;
                parent.insertBefore(element, container);
                parent.removeChild(container);
            }
        });
        
        this.elements.clear();
        console.log('Glitch text destroyed');
    }
}
