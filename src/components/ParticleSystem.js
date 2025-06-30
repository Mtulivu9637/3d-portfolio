// Particle System Component with Advanced 3D Effects

export class ParticleSystem {
    constructor(options = {}) {
        this.options = {
            particleCount: options.particleCount || 10000,
            quality: options.quality || 'high',
            mouseRadius: options.mouseRadius || 100,
            connectionDistance: options.connectionDistance || 80,
            speed: options.speed || 0.5,
            colors: options.colors || [0x00ffff, 0xff00ff, 0x00ff00],
            ...options
        };

        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.connections = null;
        
        // Particle data
        this.particlePositions = null;
        this.particleVelocities = null;
        this.particleColors = null;
        this.particleData = [];
        
        // Mouse interaction
        this.mouse = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };
        this.mouseInfluence = 1.0;
        
        // Performance
        this.frameCount = 0;
        this.lastPerformanceCheck = 0;
        this.performanceLevel = this.options.quality;
        
        // Animation
        this.time = 0;
        this.scrollProgress = 0;
        
        // Canvas containers for different sections
        this.canvasContainers = {
            hero: document.getElementById('hero-canvas'),
            about: document.getElementById('about-canvas'),
            projects: document.getElementById('projects-canvas'),
            skills: document.getElementById('skills-canvas'),
            contact: document.getElementById('contact-canvas')
        };
        
        this.currentContainer = this.canvasContainers.hero;
        this.activeScenes = new Map();
        
        this.init();
    }

    init() {
        this.createScenes();
        this.createParticles();
        this.createConnections();
        this.setupEventListeners();
        
        console.log(`Particle system initialized with ${this.options.particleCount} particles`);
    }

    createScenes() {
        // Create scenes for each section
        Object.keys(this.canvasContainers).forEach(sectionName => {
            const container = this.canvasContainers[sectionName];
            if (!container) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                alpha: true, 
                antialias: this.performanceLevel === 'high' 
            });
            
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0);
            
            // Enable advanced features for high quality
            if (this.performanceLevel === 'high') {
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.outputEncoding = THREE.sRGBEncoding;
            }
            
            camera.position.z = 300;
            container.appendChild(renderer.domElement);
            
            this.activeScenes.set(sectionName, {
                scene,
                camera,
                renderer,
                container,
                particles: null,
                connections: null
            });
        });

        // Set primary scene (hero) as main reference
        const heroScene = this.activeScenes.get('hero');
        if (heroScene) {
            this.scene = heroScene.scene;
            this.camera = heroScene.camera;
            this.renderer = heroScene.renderer;
        }
    }

    createParticles() {
        const particleCount = this.getAdjustedParticleCount();
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        
        // Position arrays
        this.particlePositions = new Float32Array(particleCount * 3);
        this.particleVelocities = new Float32Array(particleCount * 3);
        this.particleColors = new Float32Array(particleCount * 3);
        
        // Initialize particle data
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in 3D space
            this.particlePositions[i3] = (Math.random() - 0.5) * 800;
            this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 600;
            this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 400;
            
            // Random velocities
            this.particleVelocities[i3] = (Math.random() - 0.5) * 2;
            this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 2;
            this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 2;
            
            // Random colors from palette
            const colorIndex = Math.floor(Math.random() * this.options.colors.length);
            const color = new THREE.Color(this.options.colors[colorIndex]);
            this.particleColors[i3] = color.r;
            this.particleColors[i3 + 1] = color.g;
            this.particleColors[i3 + 2] = color.b;
            
            // Store additional particle data
            this.particleData.push({
                originalPosition: {
                    x: this.particlePositions[i3],
                    y: this.particlePositions[i3 + 1],
                    z: this.particlePositions[i3 + 2]
                },
                phase: Math.random() * Math.PI * 2,
                amplitude: Math.random() * 20 + 10,
                frequency: Math.random() * 0.02 + 0.01
            });
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
        
        // Create particle material
        const material = this.createParticleMaterial();
        
        // Create particle system
        const particles = new THREE.Points(geometry, material);
        
        // Add to all scenes
        this.activeScenes.forEach(sceneData => {
            const clonedParticles = particles.clone();
            sceneData.scene.add(clonedParticles);
            sceneData.particles = clonedParticles;
        });
        
        this.particles = particles;
    }

    createParticleMaterial() {
        // Vertex shader for particle animation
        const vertexShader = `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;
            varying float vAlpha;
            
            uniform float time;
            uniform vec2 mouse;
            uniform float mouseInfluence;
            
            void main() {
                vColor = customColor;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Mouse interaction
                vec2 mousePos = mouse * 100.0;
                float distanceToMouse = distance(mvPosition.xy, mousePos);
                float mouseEffect = smoothstep(100.0, 0.0, distanceToMouse) * mouseInfluence;
                
                // Wave animation
                float wave = sin(time * 0.01 + position.x * 0.01) * 10.0;
                mvPosition.y += wave;
                
                // Mouse repulsion/attraction
                if (mouseEffect > 0.0) {
                    vec2 direction = normalize(mvPosition.xy - mousePos);
                    mvPosition.xy += direction * mouseEffect * 20.0;
                }
                
                gl_Position = projectionMatrix * mvPosition;
                
                // Particle size based on distance and effects
                float particleSize = 2.0 + mouseEffect * 3.0;
                gl_PointSize = particleSize * (300.0 / -mvPosition.z);
                
                // Alpha based on depth and mouse interaction
                vAlpha = 0.6 + mouseEffect * 0.4;
            }
        `;

        // Fragment shader for particle appearance
        const fragmentShader = `
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                // Create circular particle
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if (dist > 0.5) discard;
                
                // Soft edges
                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
                
                // Glow effect
                float glow = 1.0 - smoothstep(0.0, 0.3, dist);
                vec3 finalColor = vColor + vColor * glow * 0.5;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mouse: { value: new THREE.Vector2() },
                mouseInfluence: { value: this.mouseInfluence }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        return material;
    }

    createConnections() {
        if (this.performanceLevel === 'low') return; // Skip connections on low performance
        
        const maxConnections = 500;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(maxConnections * 6); // 2 vertices per line
        const colors = new Float32Array(maxConnections * 6); // 2 colors per line
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const connections = new THREE.LineSegments(geometry, material);
        
        // Add to all scenes
        this.activeScenes.forEach(sceneData => {
            const clonedConnections = connections.clone();
            sceneData.scene.add(clonedConnections);
            sceneData.connections = clonedConnections;
        });
        
        this.connections = connections;
    }

    update(deltaTime, mouseData) {
        this.time += deltaTime;
        this.frameCount++;
        
        // Update mouse data
        if (mouseData) {
            this.mouse = mouseData;
        }
        
        // Performance monitoring
        if (this.time - this.lastPerformanceCheck > 1000) { // Check every second
            this.checkPerformance();
            this.lastPerformanceCheck = this.time;
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update connections
        if (this.connections && this.performanceLevel !== 'low') {
            this.updateConnections();
        }
        
        // Update shader uniforms
        this.updateShaderUniforms();
    }

    updateParticles(deltaTime) {
        const positions = this.particles.geometry.attributes.position.array;
        const particleCount = positions.length / 3;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const data = this.particleData[i];
            
            // Apply wave motion
            const waveX = Math.sin(this.time * 0.001 + data.phase) * data.amplitude;
            const waveY = Math.cos(this.time * 0.001 + data.phase + 1) * data.amplitude;
            const waveZ = Math.sin(this.time * 0.0005 + data.phase + 2) * data.amplitude * 0.5;
            
            // Update positions with wave motion
            positions[i3] = data.originalPosition.x + waveX;
            positions[i3 + 1] = data.originalPosition.y + waveY;
            positions[i3 + 2] = data.originalPosition.z + waveZ;
            
            // Mouse interaction
            if (this.mouse.normalizedX !== undefined) {
                const mouseX = this.mouse.normalizedX * 400;
                const mouseY = -this.mouse.normalizedY * 300;
                
                const dx = positions[i3] - mouseX;
                const dy = positions[i3 + 1] - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.mouseRadius) {
                    const force = (this.options.mouseRadius - distance) / this.options.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    
                    positions[i3] += Math.cos(angle) * force * 20;
                    positions[i3 + 1] += Math.sin(angle) * force * 20;
                }
            }
            
            // Boundary check and wrapping
            if (positions[i3] > 400) positions[i3] = -400;
            if (positions[i3] < -400) positions[i3] = 400;
            if (positions[i3 + 1] > 300) positions[i3 + 1] = -300;
            if (positions[i3 + 1] < -300) positions[i3 + 1] = 300;
        }
        
        // Update all particle systems
        this.activeScenes.forEach(sceneData => {
            if (sceneData.particles) {
                sceneData.particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    updateConnections() {
        if (!this.connections) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;
        const particleCount = positions.length / 3;
        
        const connectionPositions = this.connections.geometry.attributes.position.array;
        const connectionColors = this.connections.geometry.attributes.color.array;
        
        let connectionIndex = 0;
        const maxConnections = connectionPositions.length / 6;
        
        // Find nearby particles and create connections
        for (let i = 0; i < particleCount && connectionIndex < maxConnections; i++) {
            const i3 = i * 3;
            const x1 = positions[i3];
            const y1 = positions[i3 + 1];
            const z1 = positions[i3 + 2];
            
            for (let j = i + 1; j < particleCount && connectionIndex < maxConnections; j++) {
                const j3 = j * 3;
                const x2 = positions[j3];
                const y2 = positions[j3 + 1];
                const z2 = positions[j3 + 2];
                
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dz = z2 - z1;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < this.options.connectionDistance) {
                    const connectionIndex6 = connectionIndex * 6;
                    
                    // Set line positions
                    connectionPositions[connectionIndex6] = x1;
                    connectionPositions[connectionIndex6 + 1] = y1;
                    connectionPositions[connectionIndex6 + 2] = z1;
                    connectionPositions[connectionIndex6 + 3] = x2;
                    connectionPositions[connectionIndex6 + 4] = y2;
                    connectionPositions[connectionIndex6 + 5] = z2;
                    
                    // Set line colors (blend of particle colors)
                    const alpha = 1 - (distance / this.options.connectionDistance);
                    connectionColors[connectionIndex6] = colors[i3] * alpha;
                    connectionColors[connectionIndex6 + 1] = colors[i3 + 1] * alpha;
                    connectionColors[connectionIndex6 + 2] = colors[i3 + 2] * alpha;
                    connectionColors[connectionIndex6 + 3] = colors[j3] * alpha;
                    connectionColors[connectionIndex6 + 4] = colors[j3 + 1] * alpha;
                    connectionColors[connectionIndex6 + 5] = colors[j3 + 2] * alpha;
                    
                    connectionIndex++;
                }
            }
        }
        
        // Hide unused connections
        for (let i = connectionIndex; i < maxConnections; i++) {
            const i6 = i * 6;
            for (let j = 0; j < 6; j++) {
                connectionPositions[i6 + j] = 0;
                connectionColors[i6 + j] = 0;
            }
        }
        
        // Update all connection systems
        this.activeScenes.forEach(sceneData => {
            if (sceneData.connections) {
                sceneData.connections.geometry.attributes.position.needsUpdate = true;
                sceneData.connections.geometry.attributes.color.needsUpdate = true;
            }
        });
    }

    updateShaderUniforms() {
        const uniforms = this.particles.material.uniforms;
        uniforms.time.value = this.time;
        uniforms.mouse.value.set(this.mouse.normalizedX || 0, this.mouse.normalizedY || 0);
        uniforms.mouseInfluence.value = this.mouseInfluence;
    }

    render() {
        this.activeScenes.forEach((sceneData, sectionName) => {
            if (this.isSceneVisible(sceneData.container)) {
                sceneData.renderer.render(sceneData.scene, sceneData.camera);
            }
        });
    }

    isSceneVisible(container) {
        const rect = container.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= window.innerHeight;
    }

    setScrollProgress(progress) {
        this.scrollProgress = progress;
        
        // Adjust particle behavior based on scroll
        this.mouseInfluence = 1.0 + progress * 0.5;
        
        // Update camera positions based on scroll
        this.activeScenes.forEach((sceneData, sectionName) => {
            const offset = progress * 100;
            sceneData.camera.position.z = 300 + offset;
        });
    }

    setQuality(level) {
        this.performanceLevel = level;
        
        // Adjust particle count
        const newParticleCount = this.getAdjustedParticleCount();
        if (newParticleCount !== this.options.particleCount) {
            this.options.particleCount = newParticleCount;
            this.recreateParticles();
        }
        
        // Adjust rendering quality
        this.activeScenes.forEach(sceneData => {
            const pixelRatio = level === 'high' ? Math.min(window.devicePixelRatio, 2) : 1;
            sceneData.renderer.setPixelRatio(pixelRatio);
            
            // Toggle antialias (requires recreating renderer for full effect)
            sceneData.renderer.antialias = level === 'high';
        });
    }

    getAdjustedParticleCount() {
        switch (this.performanceLevel) {
            case 'high': return this.options.particleCount;
            case 'medium': return Math.floor(this.options.particleCount * 0.6);
            case 'low': return Math.floor(this.options.particleCount * 0.3);
            default: return this.options.particleCount;
        }
    }

    recreateParticles() {
        // Remove old particles
        this.activeScenes.forEach(sceneData => {
            if (sceneData.particles) {
                sceneData.scene.remove(sceneData.particles);
            }
        });
        
        // Clear data
        this.particleData = [];
        
        // Create new particles
        this.createParticles();
    }

    checkPerformance() {
        const fps = this.frameCount;
        this.frameCount = 0;
        
        // Adjust quality based on performance
        if (fps < 30 && this.performanceLevel !== 'low') {
            console.log('Performance low, reducing quality');
            this.setQuality('low');
        } else if (fps > 50 && this.performanceLevel !== 'high') {
            console.log('Performance good, increasing quality');
            this.setQuality('medium');
        }
    }

    resize() {
        this.activeScenes.forEach(sceneData => {
            const container = sceneData.container;
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            
            sceneData.camera.aspect = width / height;
            sceneData.camera.updateProjectionMatrix();
            sceneData.renderer.setSize(width, height);
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    destroy() {
        // Clean up Three.js objects
        this.activeScenes.forEach(sceneData => {
            if (sceneData.particles) {
                sceneData.particles.geometry.dispose();
                sceneData.particles.material.dispose();
            }
            if (sceneData.connections) {
                sceneData.connections.geometry.dispose();
                sceneData.connections.material.dispose();
            }
            if (sceneData.renderer) {
                sceneData.renderer.dispose();
                sceneData.container.removeChild(sceneData.renderer.domElement);
            }
        });
        
        // Clear data
        this.activeScenes.clear();
        this.particleData = [];
        
        // Remove event listeners
        window.removeEventListener('resize', this.resize);
        
        console.log('Particle system destroyed');
    }
}
