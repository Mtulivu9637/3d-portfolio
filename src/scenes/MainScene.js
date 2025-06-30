// Main Scene Manager

export class MainScene {
    constructor(options = {}) {
        this.particleSystem = options.particleSystem;
        this.codeBlocks = options.codeBlocks;
        this.projectShowcase = options.projectShowcase;
        this.currentSection = 'hero';
        this.quality = 'medium';
    }

    async init() {
        console.log('Main scene initialized');
        return Promise.resolve();
    }

    focusSection(sectionName) {
        this.currentSection = sectionName;
        console.log(`Scene focused on: ${sectionName}`);
    }

    render() {
        // Render all active 3D elements
        if (this.particleSystem) {
            this.particleSystem.render();
        }
    }

    setQuality(level) {
        this.quality = level;
        console.log(`Scene quality set to: ${level}`);
    }

    resize() {
        // Handle resize for all scene elements
        if (this.particleSystem) {
            this.particleSystem.resize();
        }
        if (this.codeBlocks) {
            this.codeBlocks.resize();
        }
    }

    destroy() {
        console.log('Main scene destroyed');
    }
}
