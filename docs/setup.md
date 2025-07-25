# 🛠️ Development Environment Setup

This guide will get you up and running with the Dungeon Ecosystem 3D Engine development environment.

## 📋 Prerequisites

### Required Software
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Modern Browser** with WebGL2 support:
  - Chrome 56+ (recommended)
  - Firefox 51+
  - Safari 15+
  - Edge 79+

### Recommended Tools
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git GUI Client** (optional):
  - [GitHub Desktop](https://desktop.github.com/)
  - [GitKraken](https://www.gitkraken.com/)
  - [Sourcetree](https://www.sourcetreeapp.com/)

## 🚀 Quick Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/your-org/dungeon-ecosystem-3d.git
cd dungeon-ecosystem-3d

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

You should see the ecosystem simulation running with basic math tests passing.

## 🏗️ Detailed Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/your-org/dungeon-ecosystem-3d.git
cd dungeon-ecosystem-3d

# Verify you're in the right place
ls -la
# Should show: src/, assets/, tools/, tests/, docs/, package.json
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected Dependencies:**
- `webpack` - Module bundling
- `babel` - JavaScript compilation
- `jest` - Testing framework
- `eslint` - Code linting
- `gl-matrix` - WebGL math utilities
- `stats.js` - Performance monitoring

### 3. Verify WebGL2 Support
Open your browser and visit: `chrome://gpu/` (Chrome) or `about:support` (Firefox)

Look for:
- **WebGL 2**: Available ✅
- **Hardware Acceleration**: Enabled ✅

If WebGL2 is not available, the engine will fall back to WebGL1 with reduced features.

### 4. Run Initial Tests
```bash
# Run all tests
npm test

# Should see output like:
# ✅ Vector3 - Basic Operations
# ✅ Matrix4 - Identity and Basic Operations  
# ✅ Quaternion - Axis-Angle Construction
# ✅ MathUtils - Basic Functions
# Results: 24 passed, 0 failed
```

### 5. Start Development Server
```bash
npm run dev

# Server starts at http://localhost:3000
# Webpack will watch for changes and auto-reload
```

## 🔧 VS Code Setup

### Required Extensions
Install these VS Code extensions for the best development experience:

```bash
# Install via command line
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-glsl
code --install-extension ritwickdey.liveserver
```

**Manual Installation:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search and install:
   - **ESLint** - JavaScript linting
   - **GLSL Literal** - Shader syntax highlighting
   - **WebGL GLSL Editor** - Advanced shader support
   - **Live Server** - Local development server
   - **GitLens** - Advanced Git integration

### VS Code Settings
Create `.vscode/settings.json` in project root:
```json
{
  "eslint.enable": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.vert": "glsl",
    "*.frag": "glsl",
    "*.comp": "glsl"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Recommended VS Code Layout
```
├── Explorer (Ctrl+Shift+E)
├── Search (Ctrl+Shift+F)  
├── Source Control (Ctrl+Shift+G)
├── Run and Debug (Ctrl+Shift+D)
├── Extensions (Ctrl+Shift+X)
└── Terminal (Ctrl+`)
```

## 📁 Project Structure Understanding

### Key Directories
```
src/
├── math/           # ✅ Complete - Core mathematics
├── rendering/      # 🔧 In Progress - WebGL pipeline
├── simulation/     # 📅 Planned - Ecosystem logic
├── entities/       # 📅 Planned - Creatures and objects
├── behaviors/      # 📅 Planned - AI systems
├── generation/     # 📅 Planned - Procedural content
└── workers/        # 📅 Planned - Background processing

assets/
├── shaders/        # GLSL shader files
├── models/         # 3D creature and environment models
├── textures/       # Texture atlases and materials
├── audio/          # Spatial audio files
└── data/           # Species definitions and configs

tools/
├── asset-pipeline/ # Asset processing scripts
├── editors/        # Web-based parameter editors
└── debugging/      # Performance and debugging tools
```

### File Naming Conventions
- **Classes**: `PascalCase.js` (e.g., `Vector3.js`, `EcosystemManager.js`)
- **Utilities**: `camelCase.js` (e.g., `mathUtils.js`, `debugHelpers.js`)
- **Tests**: `*.test.js` (e.g., `Vector3.test.js`)
- **Shaders**: `descriptive-name.vert/frag/comp`
- **Assets**: `kebab-case` (e.g., `cave-spider-diffuse.png`, `beetle-model.obj`)

## 🧪 Development Workflow

### Daily Development Cycle
```bash
# 1. Start your day - pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development server
npm run dev

# 4. Run tests in watch mode (separate terminal)
npm run test:watch

# 5. Make changes, tests automatically run
# 6. Commit when tests pass
git add .
git commit -m "feat: implement creature flocking behavior"

# 7. Push and create PR
git push origin feature/your-feature-name
```

### Testing Workflow
```bash
# Run all tests
npm test

# Run specific test file
npm test Vector3.test.js

# Run tests with coverage report
npm run test:coverage

# Run performance benchmarks
npm run test:performance

# Debug specific test
npm run test:debug -- Vector3.test.js
```

### Build Workflow
```bash
# Development build (fast, unoptimized)
npm run build:dev

# Production build (optimized, minified)
npm run build:prod

# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

## 🎯 Environment Configuration

### Development Environment Variables
Create `.env.development` file:
```bash
# Development settings
NODE_ENV=development
WEBPACK_DEV_SERVER_PORT=3000
ENABLE_HOT_RELOAD=true
ENABLE_SOURCE_MAPS=true

# Debug flags
DEBUG_RENDERING=true
DEBUG_SIMULATION=false
DEBUG_PERFORMANCE=true
LOG_LEVEL=debug

# Feature flags
ENABLE_WEBGL2=true
ENABLE_AUDIO=true
ENABLE_VR_SUPPORT=false

# Simulation settings
MAX_CREATURES_PER_ROOM=1000
SIMULATION_SPEED_MULTIPLIER=1.0
ENABLE_GENETIC_ALGORITHMS=true
```

### Production Environment Variables
Create `.env.production` file:
```bash
NODE_ENV=production
WEBPACK_DEV_SERVER_PORT=8080
ENABLE_HOT_RELOAD=false
ENABLE_SOURCE_MAPS=false

DEBUG_RENDERING=false
DEBUG_SIMULATION=false
DEBUG_PERFORMANCE=false
LOG_LEVEL=warn

ENABLE_WEBGL2=true
ENABLE_AUDIO=true
ENABLE_VR_SUPPORT=true

MAX_CREATURES_PER_ROOM=5000
SIMULATION_SPEED_MULTIPLIER=1.0
ENABLE_GENETIC_ALGORITHMS=true
```

## 🔍 Debugging Setup

### Browser DevTools Configuration

#### Chrome DevTools
1. Open DevTools (F12)
2. Go to Settings (F1)
3. Enable:
   - **Console** → "Preserve log upon navigation"
   - **Network** → "Disable cache (while DevTools is open)"
   - **Rendering** → "Paint flashing" (for performance debugging)
   - **Performance** → "Web vitals" overlay

#### WebGL Debugging
Install browser extensions:
- **WebGL Inspector** - [Chrome](https://chrome.google.com/webstore/detail/webgl-inspector/ogkcjmbhnfmlnielkjhedpcjomeaghda)
- **Spector.js** - [Chrome](https://chrome.google.com/webstore/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk)

### VS Code Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Webpack Dev Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/webpack-dev-server",
      "args": ["--config", "webpack.config.js"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Performance Profiling Setup
Add to your `index.html`:
```html
<!-- Performance monitoring -->
<script src="https://unpkg.com/stats.js@0.17.0/build/stats.min.js"></script>
<script>
  // FPS counter
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb
  document.body.appendChild(stats.dom);
  
  function animate() {
    stats.begin();
    // Your rendering code here
    stats.end();
    requestAnimationFrame(animate);
  }
  animate();
</script>
```

## 🔧 Build System Configuration

### Webpack Configuration
Our `webpack.config.js` handles:
- **ES6 Module Bundling** - Combines all source files
- **Babel Transpilation** - Ensures browser compatibility
- **Shader Loading** - Imports GLSL files as strings
- **Asset Processing** - Optimizes images and models
- **Hot Module Replacement** - Live code updates during development

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "webpack serve --mode=development",
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "build:analyze": "webpack-bundle-analyzer dist/bundle.js",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:performance": "jest --testPathPattern=performance",
    
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write src/**/*.js",
    
    "clean": "rimraf dist/",
    "precommit": "npm run lint && npm run test"
  }
}
```

## 🌐 Browser Compatibility

### Supported Browsers
| Browser | Version | WebGL2 | Features |
|---------|---------|--------|----------|
| Chrome | 56+ | ✅ | Full support |
| Firefox | 51+ | ✅ | Full support |
| Safari | 15+ | ✅ | Full support |
| Edge | 79+ | ✅ | Full support |
| Mobile Chrome | 56+ | ✅ | Limited performance |
| Mobile Safari | 15+ | ✅ | Limited performance |

### Fallback Strategy
```javascript
// Browser capability detection
const capabilities = {
  webgl2: !!document.createElement('canvas').getContext('webgl2'),
  webgl1: !!document.createElement('canvas').getContext('webgl'),
  webworkers: typeof Worker !== 'undefined',
  wasm: typeof WebAssembly !== 'undefined'
};

// Automatic fallback selection
if (capabilities.webgl2) {
  initializeWebGL2Renderer();
} else if (capabilities.webgl1) {
  initializeWebGL1Renderer();
} else {
  initializeCanvasRenderer();
}
```

## 🚨 Common Setup Issues & Solutions

### Issue 1: WebGL2 Not Available
**Symptoms**: Console error "WebGL2 not supported"
**Solutions**:
1. Update graphics drivers
2. Enable hardware acceleration in browser
3. Try different browser
4. Use WebGL1 fallback mode

### Issue 2: npm install Fails
**Symptoms**: Package installation errors
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use different registry if needed
npm install --registry https://registry.npmjs.org/
```

### Issue 3: Tests Fail on Setup
**Symptoms**: Math tests failing immediately
**Solutions**:
1. Verify Node.js version: `node --version` (should be 16+)
2. Check for conflicting global packages
3. Run tests in isolation: `npm test -- --no-cache`

### Issue 4: Development Server Won't Start
**Symptoms**: Port 3000 already in use
**Solutions**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Issue 5: Hot Reload Not Working
**Symptoms**: Changes not reflecting in browser
**Solutions**:
1. Check webpack dev server is running
2. Disable browser cache (F12 → Network → Disable cache)
3. Restart dev server
4. Clear browser cache completely

## 📊 Performance Monitoring Setup

### Development Performance Tracking
```javascript
// Add to your main.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      activeCreatures: 0,
      drawCalls: 0
    };
    this.updateInterval = 1000; // Update every second
  }
  
  update() {
    this.metrics.memoryUsage = performance.memory?.usedJSHeapSize || 0;
    // Update other metrics...
    
    // Log warnings for performance issues
    if (this.metrics.fps < 30) {
      console.warn(`Low FPS detected: ${this.metrics.fps}`);
    }
    if (this.metrics.memoryUsage > 500 * 1024 * 1024) { // 500MB
      console.warn(`High memory usage: ${this.metrics.memoryUsage / (1024*1024)}MB`);
    }
  }
}
```

### Automated Performance Testing
```javascript
// performance.test.js
describe('Performance Tests', () => {
  test('Math operations should complete within time limit', () => {
    const start = performance.now();
    
    // Run 10000 vector operations
    for (let i = 0; i < 10000; i++) {
      const v1 = new Vector3(Math.random(), Math.random(), Math.random());
      const v2 = new Vector3(Math.random(), Math.random(), Math.random());
      v1.add(v2).normalize();
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
  });
});
```

## 🎯 Development Goals & Metrics

### Code Quality Targets
- **Test Coverage**: > 90%
- **ESLint Violations**: 0
- **Bundle Size**: < 2MB gzipped
- **Performance**: 60fps with 1000+ creatures

### Development Velocity Metrics
- **Feature Completion**: Track against roadmap milestones
- **Bug Resolution Time**: < 24 hours for critical issues
- **Code Review Time**: < 2 hours for PRs
- **Build Time**: < 30 seconds for development builds

## 🤝 Getting Help

### When You're Stuck
1. **Check Documentation**: Look in `/docs` folder first
2. **Search Issues**: GitHub issues may have solutions
3. **Run Diagnostics**: `npm run diagnose` (when implemented)
4. **Ask for Help**: Create detailed GitHub issue with:
   - Operating system and browser version
   - Console error messages
   - Steps to reproduce
   - Expected vs actual behavior

### Development Resources
- **Project Wiki**: [GitHub Wiki Link]
- **Discord Channel**: [Discord Invite]
- **Weekly Standups**: Fridays 2PM EST
- **Code Review Guidelines**: [CONTRIBUTING.md]

---

## ✅ Setup Verification Checklist

Before starting development, verify:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Git configured with your credentials
- [ ] VS Code with recommended extensions installed
- [ ] Project cloned and dependencies installed
- [ ] All tests passing (`npm test`)
- [ ] Development server starts (`npm run dev`)
- [ ] Browser shows ecosystem simulation
- [ ] WebGL2 support confirmed
- [ ] Hot reload working (make a small change and see it update)

**Estimated setup time**: 15-30 minutes for first-time setup

Once you've completed this checklist, you're ready to start contributing to the Dungeon Ecosystem 3D Engine! 🎉