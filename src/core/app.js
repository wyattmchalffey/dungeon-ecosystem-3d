/**
 * Application Entry Point
 * Bootstraps the Dungeon Ecosystem 3D Engine
 */

import { Engine } from './Engine.js';
import { Environment } from '../utils/environment.js';
import { DemoScene } from './DemoScene.js';
import { Keys, MouseButtons } from './InputManager.js';
import { runner as mathTestRunner } from '../../tests/math-tests.js';
import { DungeonScene } from '../generation/DungeonScene.js';

class DungeonEcosystemApp {
    constructor() {
        this.engine = null;
        this.demoScene = null;
        this.debugPanel = null;
        this.dungeonScene = null;
        this.currentMode = 'demo'; // 'demo' or 'dungeon'
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

            // After UI initialization, add dungeon controls
            this.initializeDungeonUI();

            // Log additional controls
            if (Environment.isDevelopment()) {
                console.log('🏰 Dungeon Controls:');
                console.log('  Ctrl+G: Generate new dungeon');
                console.log('  Use control panel for generation settings');
            }

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
            if (this.currentMode === 'dungeon' && this.dungeonScene) {
                this.dungeonScene.update(deltaTime);
            } else if (this.currentMode === 'demo' && this.demoScene) {
                this.demoScene.update(deltaTime);
            }
        };

        // Render callback is now simplified
        this.engine.onRender = (renderer, deltaTime) => {
            // The main scene rendering is handled by the Engine.
            // This callback can be used for things that render on top, like UI or debug info.
            if (this.engine.config.renderMode !== 'webgl' && this.currentMode === 'demo') {
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

        if (this.currentMode === 'demo') {
            // Recreate demo scene
            this.demoScene.dispose();
            this.demoScene.create();
        }

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

    // Add this method to initialize UI with dungeon controls
    initializeDungeonUI() {
        // Create dungeon control panel
        const controlPanel = document.createElement('div');
        controlPanel.id = 'dungeon-controls';
        controlPanel.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            z-index: 1000;
        `;

        controlPanel.innerHTML = `
            <h3 style="margin-top: 0;">Dungeon Generation</h3>
            <div style="margin-bottom: 10px;">
                <label>Seed: <input type="number" id="dungeonSeed" value="${Date.now()}" style="width: 120px;"></label>
            </div>
            <div style="margin-bottom: 10px;">
                <label>Rooms: <input type="range" id="roomCount" min="10" max="50" value="25" style="width: 100px;">
                <span id="roomCountDisplay">25</span></label>
            </div>
            <div style="margin-bottom: 10px;">
                <label>Max Depth: <input type="range" id="maxDepth" min="5" max="15" value="8" style="width: 100px;">
                <span id="maxDepthDisplay">8</span></label>
            </div>
            <div style="margin-bottom: 10px;">
                <label>Theme:
                    <select id="dungeonTheme">
                        <option value="mixed">Mixed</option>
                        <option value="natural">Natural Caves</option>
                        <option value="ruins">Ancient Ruins</option>
                    </select>
                </label>
            </div>
            <div style="margin-bottom: 10px;">
                <label><input type="checkbox" id="optimizeGeometry" checked> Optimize Geometry</label>
            </div>
            <button id="generateDungeonBtn" style="
                background: #4a9eff;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 3px;
                cursor: pointer;
                width: 100%;
                margin-bottom: 5px;
            ">Generate Dungeon</button>
            <button id="switchModeBtn" style="
                background: #666;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 3px;
                cursor: pointer;
                width: 100%;
            ">Switch to Dungeon</button>
            <div id="dungeonStats" style="margin-top: 10px; font-size: 12px; display: none;">
                <div>Rooms: <span id="statRooms">0</span></div>
                <div>Natural: <span id="statNatural">0</span></div>
                <div>Man-made: <span id="statManMade">0</span></div>
                <div>Water Bodies: <span id="statWater">0</span></div>
                <div>Light Sources: <span id="statLights">0</span></div>
                <div>Generation Time: <span id="statTime">0</span>ms</div>
            </div>
        `;

        document.getElementById('app').appendChild(controlPanel);

        // Add event listeners
        document.getElementById('roomCount').addEventListener('input', (e) => {
            document.getElementById('roomCountDisplay').textContent = e.target.value;
        });

        document.getElementById('maxDepth').addEventListener('input', (e) => {
            document.getElementById('maxDepthDisplay').textContent = e.target.value;
        });

        document.getElementById('generateDungeonBtn').addEventListener('click', () => {
            this.generateDungeon();
        });

        document.getElementById('switchModeBtn').addEventListener('click', () => {
            this.switchMode();
        });

        // Add keyboard shortcut
        this.engine.inputManager.onKeyDown(Keys.G, (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.generateDungeon();
            }
        });
    }

    // Add method to switch between demo and dungeon mode
    async switchMode() {
        if (this.currentMode === 'demo') {
            // Switch to dungeon mode
            this.currentMode = 'dungeon';

            // Dispose demo scene
            if (this.demoScene) {
                this.demoScene.dispose();
            }

            // Create dungeon scene
            if (!this.dungeonScene) {
                this.dungeonScene = new DungeonScene(this.engine);
            }

            // Generate initial dungeon
            await this.generateDungeon();

            // Update UI
            document.getElementById('switchModeBtn').textContent = 'Switch to Demo';
            document.getElementById('dungeon-controls').querySelector('h3').textContent = 'Dungeon Generation';

        } else {
            // Switch to demo mode
            this.currentMode = 'demo';

            // Dispose dungeon scene
            if (this.dungeonScene) {
                this.dungeonScene.dispose();
            }

            // Recreate demo scene
            if (this.demoScene) {
                this.demoScene.create();
            }

            // Update UI
            document.getElementById('switchModeBtn').textContent = 'Switch to Dungeon';
            document.getElementById('dungeonStats').style.display = 'none';
        }
    }

    // Add method to generate dungeon
    async generateDungeon() {
        if (this.currentMode !== 'dungeon') {
            await this.switchMode();
            return;
        }

        // Get configuration from UI
        const config = {
            seed: parseInt(document.getElementById('dungeonSeed').value) || Date.now(),
            maxRooms: parseInt(document.getElementById('roomCount').value),
            maxDepth: parseInt(document.getElementById('maxDepth').value),
            theme: document.getElementById('dungeonTheme').value,
            optimizeGeometry: document.getElementById('optimizeGeometry').checked
        };

        // Show loading indicator
        const generateBtn = document.getElementById('generateDungeonBtn');
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            // Generate dungeon
            await this.dungeonScene.generateDungeon(config);

            // Update stats
            const stats = this.dungeonScene.getStats();
            document.getElementById('statRooms').textContent = stats.rooms;
            document.getElementById('statNatural').textContent = stats.natural;
            document.getElementById('statManMade').textContent = stats.manMade;
            document.getElementById('statWater').textContent = stats.waterBodies;
            document.getElementById('statLights').textContent = stats.lightSources;
            document.getElementById('statTime').textContent = stats.generationTime;
            document.getElementById('dungeonStats').style.display = 'block';

        } catch (error) {
            console.error('Dungeon generation failed:', error);
            alert('Failed to generate dungeon. Check console for details.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Dungeon';
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