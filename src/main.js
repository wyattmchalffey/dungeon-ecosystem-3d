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

// Import environment utility
import { Environment } from './utils/environment.js';

// Import rendering components (Phase 2)
import { WebGLRenderer } from './rendering/WebGLRenderer.js';
import { Camera } from './rendering/Camera.js';

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
    this.renderMode = 'canvas2d'; // Default to safe mode
    
    // Rendering components
    this.renderer = null;
    this.camera = null;
    
    // Demo scene
    this.cubeRotation = 0;
    
    // Performance monitoring
    this.performanceStats = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      drawCalls: 0,
      activeCreatures: 0
    };
    
    // Initialize environment and get debug flags
    const { info, webgl, debug } = Environment.initialize();
    this.environment = info;
    this.webglInfo = webgl;
    this.debugFlags = debug;
    
    // Set debug mode based on environment
    this.debugMode = debug.debug || info.isDevelopment;
    this.showPerformanceStats = debug.performance || debug.verbose;
    
    console.log('🦇 Dungeon Ecosystem 3D Engine - Initializing...');
  }
  
  /**
   * Initialize the entire engine
   */
  async initialize() {
    try {
      console.log('🔧 Starting engine initialization...');
      
      // Phase 1: Check WebGL support - FIXED LOGIC
      console.log('🔍 Checking WebGL support...');
      console.log('WebGL Info from Environment:', this.webglInfo);

      // Simple, correct WebGL detection
      if (this.webglInfo && this.webglInfo.webglVersion > 0) {
        // WebGL is available!
        this.renderMode = 'webgl';
        console.log(`✅ WebGL ${this.webglInfo.webglVersion} detected and enabled`);
        console.log(`🖥️ Renderer: ${this.webglInfo.renderer}`);
        console.log(`🏭 Vendor: ${this.webglInfo.vendor}`);
      } else {
        // Try manual detection as last resort
        console.warn('⚠️ Environment WebGL check failed, trying manual detection...');
        
        const manualWebGLCheck = this.checkWebGLManually();
        console.log('Manual WebGL check result:', manualWebGLCheck);
        
        if (manualWebGLCheck.webglVersion > 0) {
          this.webglInfo = manualWebGLCheck;
          this.renderMode = 'webgl';
          console.log(`✅ Manual WebGL ${manualWebGLCheck.webglVersion} detection successful`);
        } else {
          console.warn('🎨 Falling back to Canvas 2D mode - WebGL not available');
          this.webglInfo = manualWebGLCheck;
          this.renderMode = 'canvas2d';
        }
      }

      // Log final decision
      console.log(`🎯 Final render mode: ${this.renderMode}`);
      
      // Phase 2: Initialize canvas and rendering context
      await this.initializeCanvas();
      
      // Phase 3: Run math library tests in development
      if (Environment.isDevelopment()) {
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
   * Manual WebGL detection with detailed error reporting
   * @returns {Object} WebGL capabilities
   */
  checkWebGLManually() {
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      
      console.log('🧪 Testing WebGL contexts manually...');
      
      // Test WebGL 2
      let gl2 = null;
      try {
        gl2 = testCanvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
        console.log('Manual WebGL 2 test:', gl2 ? 'SUCCESS' : 'FAILED');
      } catch (e) {
        console.log('Manual WebGL 2 error:', e.message);
      }
      
      // Test WebGL 1
      let gl1 = null;
      try {
        gl1 = testCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) || 
              testCanvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: false });
        console.log('Manual WebGL 1 test:', gl1 ? 'SUCCESS' : 'FAILED');
      } catch (e) {
        console.log('Manual WebGL 1 error:', e.message);
      }
      
      const gl = gl2 || gl1;
      
      if (gl) {
        let renderer = 'Unknown';
        let vendor = 'Unknown';
        
        try {
          renderer = gl.getParameter(gl.RENDERER) || 'Unknown';
          vendor = gl.getParameter(gl.VENDOR) || 'Unknown';
        } catch (e) {
          console.warn('Could not get WebGL parameters:', e.message);
        }
        
        return {
          webgl2Available: !!gl2,
          webgl1Available: !!gl1,
          webglVersion: gl2 ? 2 : (gl1 ? 1 : 0),
          renderer: renderer,
          vendor: vendor,
          context: gl
        };
      }
      
      return {
        webgl2Available: false,
        webgl1Available: false,
        webglVersion: 0,
        renderer: 'None',
        vendor: 'None',
        error: 'No WebGL context available'
      };
      
    } catch (error) {
      console.error('❌ Manual WebGL detection failed:', error);
      return {
        webgl2Available: false,
        webgl1Available: false,
        webglVersion: 0,
        renderer: 'Error',
        vendor: 'Error',
        error: error.message
      };
    }
  }
  
  /**
   * Initialize the main canvas and rendering context
   */
    async initializeCanvas() {
        window.AppUtils.updateLoadingText('Initializing Canvas...', 'Setting up rendering context and viewport');

        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Set canvas size to full viewport
        this.resizeCanvas();

        // Add resize listener
        window.addEventListener('resize', () => this.resizeCanvas());

        console.log(`📺 Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);

        // Initialize rendering based on mode
        if (this.renderMode === 'webgl' && this.webglInfo.webglVersion > 0) {
            try {
                console.log('🎮 Initializing WebGL renderer...');

                // IMPORTANT: For WebGL, we need a clean canvas without any existing context
                // Create a fresh canvas element or ensure this one is clean
                const hasExistingContext = this.canvas.getContext('2d', { willReadFrequently: false }) !== null;

                if (hasExistingContext) {
                    console.log('🧹 Canvas has existing 2D context, creating fresh canvas for WebGL...');

                    // Create a new canvas element for WebGL
                    const webglCanvas = document.createElement('canvas');
                    webglCanvas.width = this.canvas.width;
                    webglCanvas.height = this.canvas.height;
                    webglCanvas.style.cssText = this.canvas.style.cssText;

                    // Replace the existing canvas
                    this.canvas.parentNode.replaceChild(webglCanvas, this.canvas);
                    this.canvas = webglCanvas;

                    console.log('✅ Fresh canvas created for WebGL');
                }

                // Initialize WebGL renderer with clean canvas
                this.renderer = new WebGLRenderer(this.canvas);
                await this.renderer.initialize();

                // Initialize camera
                this.camera = new Camera(this.canvas);

                // Set camera in renderer
                this.renderer.setCamera(this.camera.getViewMatrix(), this.camera.getProjectionMatrix());

                console.log(`✅ WebGL ${this.webglInfo.webglVersion} renderer active`);
                console.log('🎮 Camera controls: Mouse drag to rotate, wheel to zoom');

                // Store WebGL version globally for other modules
                window.WEBGL_VERSION = this.webglInfo.webglVersion;

            } catch (error) {
                console.error('❌ WebGL renderer initialization failed:', error);
                console.warn('🎨 Falling back to Canvas 2D mode');
                this.renderMode = 'canvas2d';
                window.WEBGL_VERSION = 0;
            }
        } else {
            console.log('🎨 Using Canvas 2D fallback mode');
            window.WEBGL_VERSION = 0;
        }
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
    
    // Report current rendering system
    if (this.renderMode === 'webgl') {
      console.log('✅ WebGL Renderer: Active (Phase 2)');
    } else {
      console.log('📋 Canvas 2D Renderer: Active (Fallback Mode)');
    }
    
    // Placeholder for Phase 3: Procedural Generation
    console.log('📋 Dungeon Generator: Not yet implemented (Phase 3)');
    
    // Placeholder for Phase 4: Ecosystem Simulation
    console.log('📋 Ecosystem Simulation: Not yet implemented (Phase 4)');
    
    // Create a simple demo scene to show progress
    this.createDemoScene();
  }
  
  /**
   * Create a simple demo scene showing capabilities
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

        // Store demo data
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

        // DON'T render immediately - wait for the main loop to start
        // This prevents creating a 2D context before WebGL initialization
        console.log('📋 Demo scene ready - waiting for main loop to start rendering');
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
        case 'KeyE':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            console.log('🌍 Current Environment:', Environment.getEnvironmentInfo());
          }
          break;
        case 'KeyP':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            console.log('📊 Performance Stats:', this.getStats());
          }
          break;
        case 'KeyW':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            console.log('🎮 WebGL Info:', this.webglInfo);
            console.log('🎨 Render Mode:', this.renderMode);
          }
          break;
        case 'KeyC':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (this.camera) {
              console.log('📷 Camera Info:', this.camera.getInfo());
            }
          }
          break;
        case 'KeyV':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (this.camera) {
              this.camera.setView('isometric');
              console.log('📷 Camera set to isometric view');
            }
          }
          break;
      }
    });
    
    console.log('🎮 Event listeners set up');
    
    // Log shortcuts in development
    if (Environment.isDevelopment()) {
      console.log('⌨️  Keyboard shortcuts:');
      console.log('   Space: Play/Pause');
      console.log('   Ctrl+R: Reset');
      console.log('   Ctrl+D: Toggle Debug Panel');
      console.log('   Ctrl+W: Show WebGL Info');
      console.log('   Ctrl+C: Show Camera Info');
      console.log('   Ctrl+V: Set Isometric View');
      
      if (this.renderMode === 'webgl') {
        console.log('🎮 3D Controls:');
        console.log('   Mouse Drag: Rotate camera');
        console.log('   Mouse Wheel: Zoom in/out');
      }
    }
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

        // Update canvas style size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Update WebGL renderer if active
        if (this.renderer && this.renderMode === 'webgl') {
            this.renderer.resize();
            if (this.camera) {
                this.camera.resize();
                this.renderer.setCamera(this.camera.getViewMatrix(), this.camera.getProjectionMatrix());
            }
        }
        // Note: Canvas 2D scaling will be handled in the render method when needed
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
    this.cubeRotation = 0;
    
    if (this.camera) {
      this.camera.reset();
    }
    
    this.createDemoScene();
    document.getElementById('playPauseBtn').textContent = '▶ Start';
  }
  
  /**
   * Main application loop
   */
  mainLoop() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    this.updatePerformanceStats(deltaTime);
    this.update(deltaTime);
    this.render(deltaTime);
    
    requestAnimationFrame(() => this.mainLoop());
  }
  
  /**
   * Update all engine systems
   */
  update(deltaTime) {
    this.frameCount++;
  }
  
  /**
   * Render the current frame
   */
  render(deltaTime) {
    if (this.renderMode === 'webgl' && this.renderer) {
      this.renderWebGL(deltaTime);
    } else {
      this.renderCanvas2D(deltaTime);
    }
  }
  
  /**
   * Render using WebGL
   */
  renderWebGL(deltaTime) {
    this.cubeRotation += deltaTime * 0.5;
    
    this.renderer.beginFrame();
    this.renderer.setCamera(this.camera.getViewMatrix(), this.camera.getProjectionMatrix());
    
    // Render multiple cubes
    const orbitingCube = new Vector3(
      Math.sin(this.cubeRotation) * 0.5,
      Math.cos(this.cubeRotation * 0.7) * 0.3,
      0
    );
    
    this.renderer.renderCube(orbitingCube, [0.2, 0.6, 1.0]);
    this.renderer.renderCube(new Vector3(-2, 0, 0), [1.0, 0.2, 0.2]);
    this.renderer.renderCube(new Vector3(2, 0, 0), [0.2, 1.0, 0.2]);
    this.renderer.renderCube(new Vector3(0, 2, 0), [1.0, 1.0, 0.2]);
    this.renderer.renderCube(new Vector3(0, -2, 0), [1.0, 0.2, 1.0]);
    
    const stats = this.renderer.getStats();
    this.performanceStats.drawCalls = stats.drawCalls;
  }
  
  /**
   * Render using Canvas 2D
   */
  renderCanvas2D(deltaTime) {
    this.cubeRotation += deltaTime * 0.5;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.fillStyle = '#4a9eff';
    ctx.font = '24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('Dungeon Ecosystem 3D Engine', this.canvas.width / 2, 60);
    
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px "Segoe UI"';
    ctx.fillText('Phase 1: Core Math Library ✅ Complete', this.canvas.width / 2, 100);
    ctx.fillText('Phase 2: WebGL Rendering 🔧 In Progress', this.canvas.width / 2, 130);
    
    const renderModeText = this.renderMode === 'webgl' 
      ? `WebGL ${this.webglInfo.webglVersion} Available ✅`
      : 'Canvas 2D Fallback Mode ⚠️';
    
    ctx.fillStyle = this.renderMode === 'webgl' ? '#4a9eff' : '#ff9a4a';
    ctx.fillText(renderModeText, this.canvas.width / 2, 160);
    
    // Demo info
    ctx.fillStyle = '#888';
    ctx.font = '14px "Courier New"';
    ctx.textAlign = 'left';
    const demoText = [
      'Math Library Demo:',
      `• Vector3: ${new Vector3(1, 2, 3).toString()}`,
      `• Performance: ${this.performanceStats.fps.toFixed(1)} FPS`,
      `• Render Mode: ${this.renderMode}`,
      `• Graphics: ${this.webglInfo.renderer || 'Canvas 2D'}`,
      '',
      'Phase 2 Features:',
      '• WebGL renderer with 3D cubes',
      '• Camera controls (mouse + wheel)',
      '• Basic lighting system'
    ];
    
    demoText.forEach((line, index) => {
      ctx.fillText(line, 50, 200 + index * 20);
    });
    
    // Animated element
    const time = this.cubeRotation;
    const x = this.canvas.width / 2 + Math.cos(time) * 100;
    const y = this.canvas.height / 2 + Math.sin(time) * 50;
    
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Update performance statistics
   */
  updatePerformanceStats(deltaTime) {
    this.fps = 1 / deltaTime;
    this.performanceStats.fps = this.fps;
    this.performanceStats.frameTime = deltaTime * 1000;
    
    const fpsElement = document.getElementById('debugFPS');
    const frameTimeElement = document.getElementById('debugFrameTime');
    const drawCallsElement = document.getElementById('debugDrawCalls');
    
    if (fpsElement) fpsElement.textContent = this.fps.toFixed(1);
    if (frameTimeElement) frameTimeElement.textContent = this.performanceStats.frameTime.toFixed(2) + ' ms';
    if (drawCallsElement) drawCallsElement.textContent = this.renderMode === 'webgl' ? this.performanceStats.drawCalls.toString() : '1 (Canvas 2D)';
  }
  
  /**
   * Get current engine statistics
   */
  getStats() {
    return {
      ...this.performanceStats,
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      frameCount: this.frameCount,
      environment: this.environment,
      webgl: this.webglInfo,
      debugFlags: this.debugFlags,
      renderMode: this.renderMode
    };
  }
}

/**
 * Application entry point
 */
async function main() {
  try {
    const engine = new DungeonEcosystemEngine();
    await engine.initialize();
    
    window.ENGINE = engine;
    
    if (Environment.isDevelopment()) {
      setTimeout(() => {
        engine.start();
      }, 1000);
    }
    
    console.log('🎉 Dungeon Ecosystem 3D Engine ready!');
    console.log('💡 Use window.ENGINE to access the engine from console');
    
  } catch (error) {
    console.error('💥 Failed to start engine:', error);
    window.AppUtils.showError(
      'Startup Failed',
      'The Dungeon Ecosystem Engine failed to start.',
      error.stack
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export { DungeonEcosystemEngine };