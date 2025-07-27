/**
 * Application Entry Point
 * Bootstraps the Dungeon Ecosystem 3D Engine
 */

import { Engine } from './Engine.js';
import { Environment } from '../utils/environment.js';
import { DemoScene } from './DemoScene.js';
import { Keys, MouseButtons } from './InputManager.js';
import { runner as mathTestRunner } from '../../tests/math-tests.js';

class DungeonEcosystemApp {
    constructor() {
        this.engine = null;
        this.demoScene = null;
        this.debugPanel = null;
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🦇 Dungeon Ecosystem 3D Engine - Starting...');
            
            // Initialize environment
            Environment.initialize();
            
            // Show loading screen
            this.updateLoadingStatus('Initializing Engine...', 0);
            
            // Get canvas
            const canvas = document.getElementById('canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Create and initialize engine
            this.engine = new Engine();
            await this.engine.initialize(canvas, {
                debugMode: Environment.isDevelopment()
            });
            
            // Update loading progress
            this.updateLoadingStatus('Loading Assets...', 30);
            
            // Run tests in development
            if (Environment.isDevelopment()) {
                await this.runTests();
            }
            
            // Create demo scene
            this.updateLoadingStatus('Creating Demo Scene...', 60);
            this.demoScene = new DemoScene(this.engine);
            this.demoScene.create();
            
            // Set up engine callbacks
            this.setupEngineCallbacks();
            
            // Set up controls
            this.updateLoadingStatus('Setting Up Controls...', 80);
            this.setupControls();
            
            // Initialize UI
            this.updateLoadingStatus('Initializing UI...', 90);
            this.initializeUI();
            
            // Hide loading screen
            this.updateLoadingStatus('Ready!', 100);
            setTimeout(() => this.hideLoadingScreen(), 500);
            
            // Start engine in development
            if (Environment.isDevelopment()) {
                setTimeout(() => this.engine.start(), 1000);
            }
            
            console.log('✅ Application initialized successfully');
            
            // Expose to window for debugging
            window.APP = this;
            window.ENGINE = this.engine;
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showError('Initialization Failed', error.message);
            throw error;
        }
    }
    
    /**
     * Set up engine callbacks
     */
    setupEngineCallbacks() {
        // Update callback
        this.engine.onUpdate = (deltaTime) => {
            this.demoScene.update(deltaTime);
        };
        
        // Render callback for WebGL
        this.engine.onRender = (renderer, deltaTime) => {
            if (this.engine.config.renderMode === 'webgl') {
                // WebGL rendering is handled by the engine
                // Just render the demo cubes for now
                const cubes = this.demoScene.cubes;
                cubes.forEach(cube => {
                    const pos = cube.getWorldPosition();
                    const mesh = cube.getComponent('mesh');
                    if (mesh && mesh.material) {
                        renderer.renderCube(pos, mesh.material.color);
                    }
                });
            } else {
                // Canvas2D rendering
                this.demoScene.renderCanvas2D(renderer, this.engine.canvas);
            }
        };
        
        // Resize callback
        this.engine.onResize = (width, height) => {
            console.log(`📐 Canvas resized to ${width}x${height}`);
        };
    }
    
    /**
     * Set up input controls
     */
    setupControls() {
        const input = this.engine.inputManager;
        
        // Play/Pause
        input.onKeyDown(Keys.SPACE, () => {
            const isPaused = this.engine.togglePause();
            this.updatePlayPauseButton(!isPaused);
            console.log(isPaused ? '⏸️ Paused' : '▶️ Resumed');
        });
        
        // Debug panel toggle
        input.onKeyDown(Keys.D, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.toggleDebugPanel();
            }
        });
        
        // Performance stats
        input.onKeyDown(Keys.P, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.engine.performanceMonitor.logReport();
            }
        });
        
        // Camera views
        input.onKeyDown(Keys.V, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (this.engine.camera) {
                    this.engine.camera.setView('isometric');
                    console.log('📷 Switched to isometric view');
                }
            }
        });
        
        // Camera info
        input.onKeyDown(Keys.C, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (this.engine.camera) {
                    console.log('📷 Camera Info:', this.engine.camera.getInfo());
                }
            }
        });
        
        // Reset
        input.onKeyDown(Keys.R, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.reset();
            }
        });
        
        // Demo-specific controls
        this.demoScene.setupInput();
        
        // Log controls in development
        if (Environment.isDevelopment()) {
            console.log('🎮 Controls:');
            console.log('  Space: Play/Pause');
            console.log('  Ctrl+D: Toggle Debug Panel');
            console.log('  Ctrl+P: Log Performance Report');
            console.log('  Ctrl+V: Isometric View');
            console.log('  Ctrl+C: Camera Info');
            console.log('  Ctrl+R: Reset');
            console.log('  1-6: Focus on specific cube');
            console.log('  R: Randomize cube colors');
            console.log('  Mouse: Drag to rotate, wheel to zoom');
        }
    }
    
    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Play/Pause button
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.addEventListener('click', () => {
            if (this.engine.isRunning) {
                this.engine.togglePause();
                this.updatePlayPauseButton(!this.engine.isPaused);
            } else {
                this.engine.start();
                this.updatePlayPauseButton(true);
            }
        });
        
        // Debug toggle button
        const debugToggleBtn = document.getElementById('debugToggleBtn');
        debugToggleBtn.addEventListener('click', () => {
            this.toggleDebugPanel();
        });
        
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        // Create debug panel
        this.createDebugPanel();
        
        // Start performance monitoring UI updates
        this.startUIUpdates();
    }
    
    /**
     * Create debug panel
     */
    createDebugPanel() {
        this.debugPanel = document.getElementById('debugPanel');
        
        // Create performance overlay if in development
        if (Environment.isDevelopment()) {
            const overlay = this.engine.performanceMonitor.createOverlay(document.getElementById('app'));
            overlay.style.display = 'none';
            this.performanceOverlay = overlay;
        }
    }
    
    /**
     * Toggle debug panel visibility
     */
    toggleDebugPanel() {
        this.debugPanel.classList.toggle('visible');
        
        if (this.performanceOverlay) {
            this.performanceOverlay.style.display = 
                this.performanceOverlay.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Start UI update loop
     */
    startUIUpdates() {
        setInterval(() => {
            if (this.debugPanel.classList.contains('visible')) {
                const stats = this.engine.getStats();
                
                document.getElementById('debugFPS').textContent = Math.round(stats.fps);
                document.getElementById('debugFrameTime').textContent = stats.frameTime.toFixed(2) + ' ms';
                
                if (stats.memoryUsed) {
                    document.getElementById('debugMemory').textContent = stats.memoryUsed + ' MB';
                }
            }
        }, 100);
    }
    
    /**
     * Update play/pause button
     */
    updatePlayPauseButton(isPlaying) {
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    }
    
    /**
     * Reset application
     */
    reset() {
        console.log('🔄 Resetting application...');
        
        // Reset camera
        if (this.engine.camera) {
            this.engine.camera.reset();
        }
        
        // Recreate demo scene
        this.demoScene.dispose();
        this.demoScene.create();
        
        // Reset performance stats
        this.engine.performanceMonitor.reset();
        
        // Update UI
        this.updatePlayPauseButton(this.engine.isRunning && !this.engine.isPaused);
    }
    
    /**
     * Run math tests
     */
    async runTests() {
        console.log('🧪 Running math library tests...');
        const success = mathTestRunner.run();
        
        if (!success) {
            console.warn('⚠️ Some math tests failed');
        } else {
            console.log('✅ All math tests passed');
        }
    }
    
    /**
     * Update loading screen
     */
    updateLoadingStatus(message, progress) {
        if (window.AppUtils?.updateLoadingText) {
            window.AppUtils.updateLoadingText(message, `${progress}% complete`);
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (window.AppUtils?.hideLoadingScreen) {
            window.AppUtils.hideLoadingScreen();
        }
    }
    
    /**
     * Show error message
     */
    showError(title, message) {
        if (window.AppUtils?.showError) {
            window.AppUtils.showError(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Application entry point
async function main() {
    const app = new DungeonEcosystemApp();
    await app.initialize();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

export { DungeonEcosystemApp };