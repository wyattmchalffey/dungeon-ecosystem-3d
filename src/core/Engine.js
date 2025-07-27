/**
 * Engine - Core Engine Class
 * Manages the main game loop and coordinates all systems
 */

import { Environment } from '../utils/environment.js';
import { WebGLRenderer } from '../rendering/WebGLRenderer.js';
import { Camera } from '../rendering/Camera.js';
import { Scene } from '../rendering/Scene.js';
import { assetLoader } from './AssetLoader.js';
import { InputManager } from './InputManager.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';

export class Engine {
    constructor() {
        this.canvas = null;
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        
        // Core systems
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.inputManager = null;
        this.performanceMonitor = null;
        
        // Timing
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.frameCount = 0;
        
        // Configuration
        this.config = {
            targetFPS: 60,
            maxDeltaTime: 1 / 30, // Cap at 30fps minimum
            renderMode: 'webgl',
            debugMode: false
        };
        
        // Callbacks
        this.onUpdate = null;
        this.onRender = null;
        this.onResize = null;
        
        // Environment info
        this.environment = Environment.getEnvironmentInfo();
        this.webglInfo = Environment.getWebGLInfo();
    }
    
    /**
     * Initialize the engine with a canvas element
     */
    async initialize(canvas, config = {}) {
        if (this.isInitialized) {
            console.warn('Engine already initialized');
            return;
        }
        
        console.log('🚀 Initializing Engine...');
        
        this.canvas = canvas;
        this.config = { ...this.config, ...config };
        
        try {
            // Initialize performance monitoring
            this.performanceMonitor = new PerformanceMonitor();
            
            // Initialize input system
            this.inputManager = new InputManager(this.canvas);
            
            // Initialize rendering
            await this.initializeRenderer();
            
            // Initialize scene
            this.scene = new Scene();
            
            // Set up resize handling
            this.setupResizeHandling();
            
            this.isInitialized = true;
            console.log('✅ Engine initialized successfully');
            
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize the renderer based on capabilities
     */
    async initializeRenderer() {
        // Determine render mode
        if (this.webglInfo && this.webglInfo.webglVersion > 0) {
            this.config.renderMode = 'webgl';
            
            try {
                this.renderer = new WebGLRenderer(this.canvas);
                await this.renderer.initialize();
                
                this.camera = new Camera(this.canvas);
                this.renderer.setCamera(
                    this.camera.getViewMatrix(),
                    this.camera.getProjectionMatrix()
                );
                
                console.log(`✅ WebGL ${this.webglInfo.webglVersion} renderer initialized`);
                
            } catch (error) {
                console.error('WebGL initialization failed, falling back to Canvas2D:', error);
                this.config.renderMode = 'canvas2d';
            }
        } else {
            this.config.renderMode = 'canvas2d';
            console.log('📋 Using Canvas2D renderer');
        }
    }
    
    /**
     * Start the engine
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Engine not initialized. Call initialize() first.');
        }
        
        if (this.isRunning) {
            console.warn('Engine already running');
            return;
        }
        
        console.log('▶️ Starting engine...');
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * Stop the engine
     */
    stop() {
        console.log('⏹️ Stopping engine...');
        this.isRunning = false;
    }
    
    /**
     * Pause/unpause the engine
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused) {
            this.lastFrameTime = performance.now();
        }
        
        return this.isPaused;
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const rawDeltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(rawDeltaTime, this.config.maxDeltaTime);
        
        if (!this.isPaused) {
            this.elapsedTime += this.deltaTime;
            this.frameCount++;
            
            this.performanceMonitor.beginFrame();
            
            // Update phase
            this.update(this.deltaTime);
            
            // Render phase
            this.render(this.deltaTime);
            
            this.performanceMonitor.endFrame();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update all systems
     */
    update(deltaTime) {
        // Update input
        this.inputManager.update();
        
        // Update camera if needed
        if (this.camera) {
            this.camera.update?.(deltaTime);
        }
        
        // Update scene
        if (this.scene) {
            this.scene.update(deltaTime);
        }
        
        // Custom update callback
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
    }
    
    /**
     * Render the frame
     */
    render(deltaTime) {
        if (this.config.renderMode === 'webgl' && this.renderer) {
            // Prepare scene for rendering
            this.scene.prepareRender();
            
            // Begin frame
            this.renderer.beginFrame();
            
            // Update camera matrices
            this.renderer.setCamera(
                this.camera.getViewMatrix(),
                this.camera.getProjectionMatrix()
            );
            
            // Render scene
            this.renderScene();
            
            // Custom render callback
            if (this.onRender) {
                this.onRender(this.renderer, deltaTime);
            }
        } else {
            // Canvas2D fallback
            this.renderCanvas2D(deltaTime);
        }
    }
    
    /**
     * Render scene objects
     */
    renderScene() {
        // This will be expanded to render all scene objects
        // For now, it's a placeholder for the demo
        for (const node of this.scene.renderableNodes) {
            const mesh = node.getComponent('mesh');
            if (mesh && mesh.geometry && mesh.material) {
                // Render the mesh
                // This will be implemented based on your renderer API
            }
        }
    }
    
    /**
     * Canvas2D fallback rendering
     */
    renderCanvas2D(deltaTime) {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fallback message
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Canvas2D Fallback Mode', this.canvas.width / 2, this.canvas.height / 2);
        
        // Custom render callback
        if (this.onRender) {
            this.onRender(ctx, deltaTime);
        }
    }
    
    /**
     * Handle window resize
     */
    setupResizeHandling() {
        const resizeHandler = () => {
            this.handleResize();
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Initial resize
        this.handleResize();
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        if (!this.canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        if (this.renderer && this.config.renderMode === 'webgl') {
            this.renderer.resize();
        }
        
        if (this.camera) {
            this.camera.resize();
        }
        
        if (this.onResize) {
            this.onResize(this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Get engine statistics
     */
    getStats() {
        const stats = this.performanceMonitor.getStats();
        
        return {
            ...stats,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            frameCount: this.frameCount,
            elapsedTime: this.elapsedTime,
            renderMode: this.config.renderMode,
            canvasSize: {
                width: this.canvas?.width || 0,
                height: this.canvas?.height || 0
            }
        };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.inputManager) {
            this.inputManager.dispose();
        }
        
        this.scene = null;
        this.camera = null;
        this.canvas = null;
        
        this.isInitialized = false;
        
        console.log('🧹 Engine disposed');
    }
}