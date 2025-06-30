// 3D Rotating Code Block Component with Neon Effects

export class CodeBlock3D {
    constructor(options = {}) {
        this.options = {
            codeSamples: options.codeSamples || [],
            quality: options.quality || 'high',
            rotationSpeed: options.rotationSpeed || 0.01,
            neonColors: options.neonColors || ['#00ff00', '#ff00ff', '#00ffff'],
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.codeBlocks = [];
        this.rotationY = 0;

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createCodeBlocks();

        console.log('3D code blocks initialized');
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createCamera() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        this.camera.position.z = 200;
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('code-blocks-canvas').appendChild(this.renderer.domElement);
    }

    createCodeBlocks() {
        this.options.codeSamples.forEach((sample, index) => {
            const block = this.createCodeBlock(sample, index);
            this.codeBlocks.push(block);
            this.scene.add(block);
        });
    }

    createCodeBlock(sample, index) {
        const geometry = new THREE.BoxGeometry(100, 50, 1);
        const texture = this.createCodeTexture(sample);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        material.transparent = true;

        material.emissive = new THREE.Color(this.options.neonColors[index % this.options.neonColors.length]);
        material.emissiveIntensity = 0.5;

        const block = new THREE.Mesh(geometry, material);
        block.position.x = (index % 3) * 120 - 120;
        block.position.y = Math.floor(index / 3) * 80 - 40;

        return block;
    }

    createCodeTexture(code) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = 512;
        canvas.height = 256;

        context.fillStyle = '#0a0a0a';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = '16px Fira Code';
        context.fillStyle = '#00ff00';
        context.fillText(code, 10, 40);

        return new THREE.CanvasTexture(canvas);
    }

    update(deltaTime) {
        this.rotationY += this.options.rotationSpeed * deltaTime;
        this.codeBlocks.forEach(block => {
            block.rotation.y = this.rotationY;
        });

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    setQuality(level) {
        console.log(`Code block quality set to ${level}`);
        // Quality adjustments can be implemented here, e.g., changing texture resolution or block detail.
    }

    destroy() {
        this.codeBlocks.forEach(block => {
            block.geometry.dispose();
            block.material.dispose();
        });
        this.renderer.dispose();

        const canvas = document.getElementById('code-blocks-canvas');
        if (canvas) {
            canvas.removeChild(this.renderer.domElement);
        }
        console.log('3D code blocks destroyed');
    }
}

