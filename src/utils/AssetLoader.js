// Asset Loader for Progressive Loading

export class AssetLoader {
    constructor() {
        this.loadedAssets = new Map();
        this.loadingPromises = new Map();
        this.loaders = {
            texture: new THREE.TextureLoader(),
            font: null // Will use CSS font loading
        };
    }

    async load(type, name, url) {
        // Return cached asset if already loaded
        if (this.loadedAssets.has(name)) {
            return this.loadedAssets.get(name);
        }

        // Return existing promise if currently loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const loadPromise = this.loadAsset(type, url);
        this.loadingPromises.set(name, loadPromise);

        try {
            const asset = await loadPromise;
            this.loadedAssets.set(name, asset);
            this.loadingPromises.delete(name);
            return asset;
        } catch (error) {
            this.loadingPromises.delete(name);
            throw error;
        }
    }

    async loadAsset(type, url) {
        switch (type) {
            case 'texture':
                return this.loadTexture(url);
            case 'font':
                return this.loadFont(url);
            default:
                throw new Error(`Unknown asset type: ${type}`);
        }
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.loaders.texture.load(
                url,
                texture => resolve(texture),
                progress => console.log(`Loading texture: ${Math.round(progress.loaded / progress.total * 100)}%`),
                error => reject(error)
            );
        });
    }

    async loadFont(url) {
        const font = new FontFace('Fira Code', `url(${url})`);
        await font.load();
        document.fonts.add(font);
        return font;
    }

    get(name) {
        return this.loadedAssets.get(name);
    }

    isLoaded(name) {
        return this.loadedAssets.has(name);
    }

    clear() {
        this.loadedAssets.clear();
        this.loadingPromises.clear();
    }
}
