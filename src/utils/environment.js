/**
 * Environment Detection Utilities
 * Safe environment checks that work in both browser and Node.js
 */
export class Environment {
  
  /**
   * Check if running in development mode
   * @returns {boolean} True if in development
   */
  static isDevelopment() {
    // Node.js environment check
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    
    // Browser environment - multiple detection methods
    if (typeof window !== 'undefined') {
      // Check for development server indicators
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '0.0.0.0';
      
      const isDevPort = window.location.port === '3000' || 
                       window.location.port === '8080' ||
                       window.location.port === '5000';
      
      const hasDebugFlag = window.location.search.includes('debug=true') ||
                          window.location.search.includes('dev=true') ||
                          window.location.hash.includes('debug');
      
      // Check for webpack dev server
      const hasWebpackDevServer = window.__webpack_dev_server__ || 
                                 document.querySelector('[data-webpack]');
      
      return isLocalhost || isDevPort || hasDebugFlag || hasWebpackDevServer;
    }
    
    return false;
  }
  
  /**
   * Check if running in production mode
   * @returns {boolean} True if in production
   */
  static isProduction() {
    // Node.js environment check
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'production';
    }
    
    // Browser environment - assume production if not development
    if (typeof window !== 'undefined') {
      return !this.isDevelopment();
    }
    
    return true; // Default to production for safety
  }
  
  /**
   * Check if running in a browser environment
   * @returns {boolean} True if in browser
   */
  static isBrowser() {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' &&
           typeof navigator !== 'undefined';
  }
  
  /**
   * Check if running in Node.js environment
   * @returns {boolean} True if in Node.js
   */
  static isNode() {
    return typeof process !== 'undefined' && 
           process.versions && 
           process.versions.node;
  }
  
  /**
   * Check if running in a Web Worker
   * @returns {boolean} True if in Web Worker
   */
  static isWebWorker() {
    return typeof importScripts === 'function' && 
           typeof WorkerGlobalScope !== 'undefined';
  }
  
  /**
   * Check if running in test environment
   * @returns {boolean} True if in test
   */
  static isTest() {
    // Node.js test environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'test' || 
             process.env.JEST_WORKER_ID !== undefined ||
             typeof global !== 'undefined' && global.__coverage__;
    }
    
    // Browser test environment
    if (typeof window !== 'undefined') {
      return window.__karma__ !== undefined ||
             window.jasmine !== undefined ||
             window.mocha !== undefined ||
             window.__coverage__ !== undefined;
    }
    
    return false;
  }
  
  /**
   * Get detailed environment information
   * @returns {Object} Environment details
   */
  static getEnvironmentInfo() {
    const info = {
      // Basic environment flags
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      isBrowser: this.isBrowser(),
      isNode: this.isNode(),
      isWebWorker: this.isWebWorker(),
      isTest: this.isTest(),
      
      // Platform information
      platform: this.isBrowser() ? 'browser' : (this.isNode() ? 'node' : 'unknown'),
      timestamp: new Date().toISOString()
    };
    
    // Add browser-specific info
    if (this.isBrowser()) {
      info.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        url: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host
      };
      
      // Performance information
      if (performance && performance.memory) {
        info.performance = {
          memoryUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          memoryTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          memoryLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
      }
    }
    
    // Add Node.js specific info
    if (this.isNode()) {
      info.node = {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        argv: process.argv
      };
      
      if (process.env) {
        info.nodeEnv = process.env.NODE_ENV;
      }
    }
    
    return info;
  }
  
  /**
   * Get WebGL capabilities (browser only)
   * @returns {Object|null} WebGL info or null
   */
    static getWebGLInfo() {
        if (!this.isBrowser()) return null;

        try {
            const canvas = document.createElement('canvas');

            // Test WebGL 2 first
            let gl2 = null;
            try {
                gl2 = canvas.getContext('webgl2', {
                    failIfMajorPerformanceCaveat: false // Allow software rendering
                });
            } catch (e) {
                console.log('WebGL2 context creation failed:', e.message);
            }

            // Test WebGL 1 as fallback
            let gl1 = null;
            try {
                gl1 = canvas.getContext('webgl', {
                    failIfMajorPerformanceCaveat: false
                }) || canvas.getContext('experimental-webgl', {
                    failIfMajorPerformanceCaveat: false
                });
            } catch (e) {
                console.log('WebGL1 context creation failed:', e.message);
            }

            // Get the best available context
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

                const result = {
                    webgl2Available: !!gl2,
                    webgl1Available: !!gl1,
                    webglVersion: gl2 ? 2 : (gl1 ? 1 : 0),
                    renderer: renderer,
                    vendor: vendor
                };

                console.log('🔍 WebGL Detection Result:', result);
                return result;
            }

            console.log('❌ No WebGL context could be created');
            return {
                webgl2Available: false,
                webgl1Available: false,
                webglVersion: 0,
                renderer: 'None',
                vendor: 'None',
                error: 'No WebGL context available'
            };

        } catch (error) {
            console.error('❌ WebGL detection error:', error);
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
   * Set debug flags based on URL parameters (browser only)
   * @returns {Object} Debug flags
   */
  static getDebugFlags() {
    if (!this.isBrowser()) return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    return {
      debug: urlParams.get('debug') === 'true' || hashParams.get('debug') === 'true',
      verbose: urlParams.get('verbose') === 'true' || hashParams.get('verbose') === 'true',
      performance: urlParams.get('perf') === 'true' || hashParams.get('perf') === 'true',
      simulation: urlParams.get('sim') === 'true' || hashParams.get('sim') === 'true',
      rendering: urlParams.get('render') === 'true' || hashParams.get('render') === 'true',
      logLevel: urlParams.get('log') || hashParams.get('log') || 'info'
    };
  }
  
  /**
   * Initialize environment and log information
   * Call this early in your application startup
   */
  static initialize() {
    const info = this.getEnvironmentInfo();
    const webgl = this.getWebGLInfo();
    const debug = this.getDebugFlags();
    
    // Log basic environment info
    console.log('🌍 Environment initialized:', {
      mode: info.isDevelopment ? 'development' : 'production',
      platform: info.platform,
      webgl: webgl?.webglVersion || 'unavailable'
    });
    
    // Log detailed info in development
    if (info.isDevelopment) {
      console.log('🔧 Development mode - detailed environment info:', info);
      
      if (webgl) {
        console.log('🎮 WebGL capabilities:', webgl);
      }
      
      if (Object.values(debug).some(Boolean)) {
        console.log('🐛 Debug flags enabled:', debug);
      }
    }
    
    // Store environment info globally for debugging
    if (this.isBrowser()) {
      window.ECOSYSTEM_ENV = { info, webgl, debug };
    }
    
    return { info, webgl, debug };
  }
}