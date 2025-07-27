/**
 * AssetLoader - Centralized asset loading and caching
 * Handles textures, models, shaders, and data files
 */

export class AssetLoader {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
        this.basePath = '/assets/';
        
        // Type-specific loaders
        this.loaders = {
            'texture': (url) => this.loadTexture(url),
            'json': (url) => this.loadJSON(url),
            'text': (url) => this.loadText(url),
            'shader': (url) => this.loadText(url),
            'obj': (url) => this.loadOBJ(url),
            'audio': (url) => this.loadAudio(url)
        };
    }
    
    /**
     * Load asset with caching
     */
    async load(url, type = 'auto') {
        // Check cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        // Check if already loading
        if (this.loading.has(url)) {
            return this.loading.get(url);
        }
        
        // Auto-detect type from extension
        if (type === 'auto') {
            type = this.detectType(url);
        }
        
        // Start loading
        const loader = this.loaders[type];
        if (!loader) {
            throw new Error(`Unknown asset type: ${type}`);
        }
        
        const loadPromise = loader.call(this, url)
            .then(asset => {
                this.cache.set(url, asset);
                this.loading.delete(url);
                return asset;
            })
            .catch(error => {
                this.loading.delete(url);
                throw error;
            });
        
        this.loading.set(url, loadPromise);
        return loadPromise;
    }
    
    /**
     * Load multiple assets
     */
    async loadAll(assets) {
        const promises = assets.map(asset => {
            if (typeof asset === 'string') {
                return this.load(asset);
            } else {
                return this.load(asset.url, asset.type);
            }
        });
        
        return Promise.all(promises);
    }
    
    /**
     * Detect asset type from URL
     */
    detectType(url) {
        const ext = url.split('.').pop().toLowerCase();
        const typeMap = {
            'png': 'texture',
            'jpg': 'texture',
            'jpeg': 'texture',
            'json': 'json',
            'txt': 'text',
            'vert': 'shader',
            'frag': 'shader',
            'glsl': 'shader',
            'obj': 'obj',
            'ogg': 'audio',
            'mp3': 'audio',
            'wav': 'audio'
        };
        
        return typeMap[ext] || 'text';
    }
    
    /**
     * Load texture for WebGL
     */
    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            
            image.onload = () => {
                resolve({
                    type: 'texture',
                    url: url,
                    image: image,
                    width: image.width,
                    height: image.height
                });
            };
            
            image.onerror = () => {
                reject(new Error(`Failed to load texture: ${url}`));
            };
            
            // Handle relative URLs
            image.src = url.startsWith('http') ? url : this.basePath + url;
        });
    }
    
    /**
     * Load JSON data
     */
    async loadJSON(url) {
        const response = await fetch(this.basePath + url);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${url}`);
        }
        
        const data = await response.json();
        return {
            type: 'json',
            url: url,
            data: data
        };
    }
    
    /**
     * Load text file
     */
    async loadText(url) {
        const response = await fetch(this.basePath + url);
        if (!response.ok) {
            throw new Error(`Failed to load text: ${url}`);
        }
        
        const text = await response.text();
        return {
            type: 'text',
            url: url,
            text: text
        };
    }
    
    /**
     * Load OBJ model (basic parser)
     */
    async loadOBJ(url) {
        const textAsset = await this.loadText(url);
        const objData = this.parseOBJ(textAsset.text);
        
        return {
            type: 'model',
            url: url,
            format: 'obj',
            ...objData
        };
    }
    
    /**
     * Basic OBJ parser
     */
    parseOBJ(text) {
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const faces = [];
        
        const lines = text.split('\n');
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const type = parts[0];
            
            switch (type) {
                case 'v':
                    vertices.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                    
                case 'vn':
                    normals.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                    
                case 'vt':
                    texCoords.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2])
                    );
                    break;
                    
                case 'f':
                    // Simple triangulation for quads
                    const faceVerts = [];
                    for (let i = 1; i < parts.length; i++) {
                        const indices = parts[i].split('/').map(s => parseInt(s) - 1);
                        faceVerts.push(indices);
                    }
                    
                    // Convert to triangles
                    for (let i = 1; i < faceVerts.length - 1; i++) {
                        faces.push([
                            faceVerts[0],
                            faceVerts[i],
                            faceVerts[i + 1]
                        ]);
                    }
                    break;
            }
        }
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            faces: faces,
            vertexCount: vertices.length / 3
        };
    }
    
    /**
     * Load audio file
     */
    async loadAudio(url) {
        const response = await fetch(this.basePath + url);
        if (!response.ok) {
            throw new Error(`Failed to load audio: ${url}`);
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        return {
            type: 'audio',
            url: url,
            buffer: audioBuffer,
            context: audioContext
        };
    }
    
    /**
     * Preload essential assets with progress callback
     */
    async preload(assetList, onProgress) {
        const total = assetList.length;
        let loaded = 0;
        
        const promises = assetList.map(async (asset) => {
            const result = await this.load(asset.url || asset, asset.type);
            loaded++;
            
            if (onProgress) {
                onProgress({
                    loaded: loaded,
                    total: total,
                    progress: loaded / total,
                    current: asset.url || asset
                });
            }
            
            return result;
        });
        
        return Promise.all(promises);
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Get cached asset
     */
    getCached(url) {
        return this.cache.get(url);
    }
    
    /**
     * Check if asset is cached
     */
    isCached(url) {
        return this.cache.has(url);
    }
}

/**
 * Global asset loader instance
 */
export const assetLoader = new AssetLoader();

/**
 * Asset manifest for Phase 3 dungeon generation
 */
export const dungeonAssets = {
    textures: [
        { url: 'textures/stone-wall.png', type: 'texture' },
        { url: 'textures/stone-floor.png', type: 'texture' },
        { url: 'textures/water.png', type: 'texture' },
        { url: 'textures/moss.png', type: 'texture' }
    ],
    
    shaders: [
        { url: 'shaders/dungeon.vert', type: 'shader' },
        { url: 'shaders/dungeon.frag', type: 'shader' },
        { url: 'shaders/water.vert', type: 'shader' },
        { url: 'shaders/water.frag', type: 'shader' }
    ],
    
    models: [
        { url: 'models/rock-formation.obj', type: 'obj' },
        { url: 'models/stalactite.obj', type: 'obj' },
        { url: 'models/mushroom.obj', type: 'obj' }
    ],
    
    data: [
        { url: 'data/room-templates.json', type: 'json' },
        { url: 'data/species-definitions.json', type: 'json' },
        { url: 'data/environmental-zones.json', type: 'json' }
    ],
    
    audio: [
        { url: 'audio/water-drip.ogg', type: 'audio' },
        { url: 'audio/cave-ambience.ogg', type: 'audio' }
    ]
};