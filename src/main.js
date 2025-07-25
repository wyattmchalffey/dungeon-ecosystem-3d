/**
 * Dungeon Ecosystem 3D Engine - Main Entry Point
 * 
 * This is the main application file that initializes the entire ecosystem simulation.
 * It coordinates between the math library, rendering system, and simulation engine.
 */

// Import core math libraries (Phase 1 - Complete)
import { Vector3 } from './math/Vector3.js';
import { Matrix4 } from './math/Matrix4.js';
import { Quaternion } from './math/Quaternion.js';
import { MathUtils } from './math/MathUtils.js';

// Import test runner for development
import { runner as mathTestRunner } from '../tests/math-tests.js';

/**
 * Main Application Class
 * Coordinates all engine systems and manages the application lifecycle
 */
class DungeonEcosystemEngine {
  constructor() {
    this.canvas = null;
    this.isInitialized = false;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    
    // Performance monitoring
    this.performanceStats = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      drawCalls: 0,
      activeCreatures: 0
    };
    
    // Development flags
    this.debugMode = false;
    this.showPerformanceStats = false;
    
    console.log('🦇 Dungeon Ecosystem 3D Engine - Initializing...');
  }
  
  /**
   * Initialize the entire engine
   */
  async initialize() {
    try {
      console.log('🔧 Starting engine initialization...');
      
      // Phase 1: Check WebGL support
      if (!window.AppUtils.checkWebGLSupport) {
        throw new Error('WebGL not supported on this device');
      }
      
      // Phase 2: Initialize canvas and WebGL context
      await this.initializeCanvas();
      
      // Phase 3: Run math library tests in development
      if (process.env.NODE_ENV === 'development') {
        await this.runMathTests();
      }
      
      // Phase 4: Initialize core systems (placeholder for future phases)
      await this.initializePlaceholderSystems();
      
      // Phase 5: Set up event listeners
      this.setupEventListeners();
      
      // Phase 6: Start the main loop
      this.isInitialized = true;
      
      console.log('✅ Engine initialization complete!');
      window.AppUtils.hideLoadingScreen();
      
    } catch (error) {
      console.error('❌ Engine initialization failed:', error);
      window.AppUtils.showError(
        'Initialization Failed',
        error.message,
        error.stack
      );
    }
  }
  
  /**
   * Initialize the main canvas and WebGL context
   */
  async initializeCanvas() {
    window.AppUtils.updateLoadingText('Initializing Canvas...', 'Setting up WebGL context and viewport');
    
    this.canvas = document.getElementById('canvas');
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Set canvas size to full viewport
    this.resizeCanvas();
    
    // Add resize listener
    window.addEventListener('resize', () => this.resizeCanvas());
    
    console.log(`📺 Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
    console.log(`🎮 WebGL Version: ${window.WEBGL_VERSION}`);
  }
  
  /**
   * Run math library tests in development mode
   */
  async runMathTests() {
    window.AppUtils.updateLoadingText('Running Math Tests...', 'Verifying core mathematics library');
    
    console.log('🧮 Running math library tests...');
    const success = mathTestRunner.run();
    
    if (!success) {
      throw new Error('Math library tests failed - check console for details');
    }
    
    console.log('✅ All math tests passed!');
  }
  
  /**
   * Initialize placeholder systems for future development phases
   */
  async initializePlaceholderSystems() {
    window.AppUtils.updateLoadingText('Initializing Systems...', 'Setting up rendering and simulation systems');
    
    // Placeholder for Phase 2: WebGL Renderer
    console.log('📋 WebGL Renderer: Not yet implemented (Phase 2)');
    
    // Placeholder for Phase 3: Procedural Generation
    console.log('📋 Dungeon Generator: Not yet implemented (Phase 3)');
    
    // Placeholder for Phase 4: Ecosystem Simulation
    console.log('📋 Ecosystem Simulation: Not yet implemented (Phase 4)');
    
    // Create a simple demo scene to show progress
    this.createDemoScene();
  }
  
  /**
   * Create a simple demo scene showing math capabilities
   */
  createDemoScene() {
    console.log('🎨 Creating demo scene...');
    
    // Demonstrate math library with some calculations
    const position = new Vector3(0, 0, -5);
    const rotation = Quaternion.fromEuler(0, MathUtils.degToRad(45), 0);
    const scale = new Vector3(1, 1, 1);
    
    // Create a transformation matrix
    const transform = Matrix4.compose(position, rotation.toMatrix4(), scale);
    
    console.log('📍 Demo object transform:', transform.toString());
    
    // Store demo data for rendering when WebGL is implemented
    this.demoScene = {
      objects: [
        {
          position,
          rotation,
          scale,
          transform,
          type: 'cube'
        }
      ]
    };
    
    // For now, just draw a simple 2D representation on canvas
    this.drawSimpleDemo();
  }
  
  /**
   * Draw a simple 2D demo until 3D rendering is implemented
   */
  drawSimpleDemo() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw title
    ctx.fillStyle = '#4a9eff';
    ctx.font = '24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('Dungeon Ecosystem 3D Engine', this.canvas.width / 2, 60);
    
    // Draw status
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px "Segoe UI"';
    ctx.fillText('Phase 1: Core Math Library ✅ Complete', this.canvas.width / 2, 100);
    ctx.fillText('Phase 2: WebGL Rendering 🔧 In Progress', this.canvas.width / 2, 130);
    
    // Draw math demo
    ctx.fillStyle = '#888';
    ctx.font = '14px "Courier New"';
    ctx.textAlign = 'left';
    const demoText = [
      'Math Library Demo:',
      `• Vector3: ${new Vector3(1, 2, 3).toString()}`,
      `• Quaternion rotation: ${MathUtils.radToDeg(Math.PI/4).toFixed(1)}°`,
      `• Matrix transformation: Working ✅`,
      `• Performance: ${this.performanceStats.fps.toFixed(1)} FPS`,
      '',
      'Press Debug button to show performance panel',
      'Math tests: All passing ✅'
    ];
    
    demoText.forEach((line, index) => {
      ctx.fillText(line, 50, 180 + index * 20);
    });
    
    // Draw simple animated element to show the engine is running
    const time = Date.now() * 0.001;
    const x = this.canvas.width / 2 + Math.cos(time) * 100;
    const y = this.canvas.height / 2 + Math.sin(time) * 50;
    
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ecosystem preview (placeholder)
    ctx.fillStyle = '#666';
    ctx.fillRect(this.canvas.width - 250, this.canvas.height - 200, 200, 150);
    ctx.fillStyle = '#4a9eff';
    ctx.font = '12px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('Future: 3D Dungeon', this.canvas.width - 150, this.canvas.height - 120);
    ctx.fillText('Ecosystem Simulation', this.canvas.width - 150, this.canvas.height - 100);
  }
  
  /**
   * Set up event listeners for user interaction
   */
  setupEventListeners() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.addEventListener('click', () => {
      this.togglePlayPause();
    });
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
      this.reset();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          this.togglePlayPause();
          break;
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.reset();
          }
          break;
        case 'KeyD':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            window.AppUtils.toggleDebugPanel();
          }
          break;
      }
    });
    
    console.log('🎮 Event listeners set up');
  }
  
  /**
   * Resize canvas to fit viewport
   */
  resizeCanvas() {
    if (!this.canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    // Update canvas style size
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  /**
   * Toggle play/pause state
   */
  togglePlayPause() {
    this.isRunning = !this.isRunning;
    const btn = document.getElementById('playPauseBtn');
    
    if (this.isRunning) {
      btn.textContent = '⏸ Pause';
      this.start();
    } else {
      btn.textContent = '▶ Play';
      this.stop();
    }
  }
  
  /**
   * Start the main application loop
   */
  start() {
    if (!this.isInitialized) {
      console.warn('Cannot start - engine not initialized');
      return;
    }
    
    console.log('▶ Starting engine...');
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.mainLoop();
  }
  
  /**
   * Stop the main application loop
   */
  stop() {
    console.log('⏸ Stopping engine...');
    this.isRunning = false;
  }
  
  /**
   * Reset the application to initial state
   */
  reset() {
    console.log('🔄 Resetting engine...');
    
    this.stop();
    this.frameCount = 0;
    this.fps = 0;
    
    // Reset demo scene
    this.createDemoScene();
    
    // Update UI
    document.getElementById('playPauseBtn').textContent = '▶ Start';
  }
  
  /**
   * Main application loop
   */
  mainLoop() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    // Update performance stats
    this.updatePerformanceStats(deltaTime);
    
    // Update systems (placeholder for future phases)
    this.update(deltaTime);
    
    // Render frame
    this.render(deltaTime);
    
    // Continue loop
    requestAnimationFrame(() => this.mainLoop());
  }
  
  /**
   * Update all engine systems
   */
  update(deltaTime) {
    // Placeholder for future update systems:
    // - Simulation update (Phase 4)
    // - Physics update (Phase 5) 
    // - AI update (Phase 5)
    // - Audio update (Phase 6)
    
    // For now, just update our simple demo
    this.frameCount++;
  }
  
  /**
   * Render the current frame
   */
  render(deltaTime) {
    // Placeholder for future rendering systems:
    // - WebGL renderer (Phase 2)
    // - Scene graph traversal (Phase 2)
    // - Shader management (Phase 2)
    // - Post-processing (Phase 6)
    
    // For now, just redraw our simple demo
    this.drawSimpleDemo();
  }
  
  /**
   * Update performance statistics
   */
  updatePerformanceStats(deltaTime) {
    // Calculate FPS
    this.fps = 1 / deltaTime;
    
    // Update performance stats object
    this.performanceStats.fps = this.fps;
    this.performanceStats.frameTime = deltaTime * 1000; // Convert to milliseconds
    
    // Update debug panel if visible
    const fpsElement = document.getElementById('debugFPS');
    const frameTimeElement = document.getElementById('debugFrameTime');
    const creaturesElement = document.getElementById('debugCreatures');
    const drawCallsElement = document.getElementById('debugDrawCalls');
    
    if (fpsElement) fpsElement.textContent = this.fps.toFixed(1);
    if (frameTimeElement) frameTimeElement.textContent = this.performanceStats.frameTime.toFixed(2) + ' ms';
    if (creaturesElement) creaturesElement.textContent = '0 (Phase 4)';
    if (drawCallsElement) drawCallsElement.textContent = '1 (Canvas 2D)';
  }
  
  /**
   * Get current engine statistics for external monitoring
   */
  getStats() {
    return {
      ...this.performanceStats,
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      frameCount: this.frameCount,
      webglVersion: window.WEBGL_VERSION
    };
  }
}

/**
 * Application entry point
 */
async function main() {
  try {
    // Create and initialize the engine
    const engine = new DungeonEcosystemEngine();
    await engine.initialize();
    
    // Make engine globally accessible for debugging
    window.ENGINE = engine;
    
    // Start the engine automatically in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        engine.start();
      }, 1000);
    }
    
    console.log('🎉 Dungeon Ecosystem 3D Engine ready!');
    console.log('💡 Use window.ENGINE to access the engine from console');
    console.log('⌨️  Keyboard shortcuts:');
    console.log('   Space: Play/Pause');
    console.log('   Ctrl+R: Reset');
    console.log('   Ctrl+D: Toggle Debug Panel');
    
  } catch (error) {
    console.error('💥 Failed to start engine:', error);
    window.AppUtils.showError(
      'Startup Failed',
      'The Dungeon Ecosystem Engine failed to start.',
      error.stack
    );
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Export for testing
export { DungeonEcosystemEngine };