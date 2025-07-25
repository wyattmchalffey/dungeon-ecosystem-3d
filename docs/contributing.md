# 🤝 Contributing to Dungeon Ecosystem 3D Engine

Thank you for your interest in contributing! This project aims to create the most scientifically accurate and visually stunning ecosystem simulation possible, and we need help from developers, artists, scientists, and enthusiasts.

## 🎯 Ways to Contribute

### 🔬 For Scientists & Researchers
- **Ecological Models**: Implement realistic population dynamics, predator-prey relationships
- **Environmental Systems**: Temperature/humidity diffusion, nutrient cycling, seasonal changes
- **Genetic Algorithms**: Evolution, mutation, adaptation mechanisms
- **Disease Models**: Epidemic spread, immunity, population health

### 💻 For Developers
- **3D Graphics**: WebGL shaders, rendering optimization, visual effects
- **Performance**: Memory management, spatial optimization, multi-threading
- **User Interface**: Debug panels, ecosystem visualization, interaction tools
- **Architecture**: System design, API development, testing frameworks

### 🎨 For Artists & Designers
- **3D Models**: Creature meshes, environmental objects, dungeon architecture
- **Textures**: Surface materials, creature skins, environmental details
- **Animations**: Creature movement, behavioral states, environmental effects
- **UI Design**: User interface layouts, data visualization, iconography

### 📝 For Writers & Educators
- **Documentation**: Tutorials, API docs, scientific explanations
- **Educational Content**: Ecology primers, 3D graphics guides, simulation theory
- **Community**: Blog posts, social media, conference presentations
- **Accessibility**: Making complex concepts understandable

## 🚀 Getting Started

### 1. Choose Your Contribution Type

#### 🐛 Bug Fixes (Great for beginners)
- Look for issues labeled `good first issue` or `bug`
- Small, focused changes with clear success criteria
- Usually involves fixing existing functionality

#### ✨ New Features (Intermediate)
- Pick from roadmap items or propose new features
- Requires understanding of project architecture
- Should align with overall project goals

#### 🔧 Performance Improvements (Advanced)
- Profile code and identify bottlenecks
- Optimize algorithms or rendering pipeline
- Requires deep system knowledge

#### 📚 Documentation (All levels)
- Improve existing docs or create new content
- No coding required for many documentation tasks
- Helps entire community understand the project

### 2. Set Up Development Environment
Follow the [Setup Guide](SETUP.md) to get your development environment ready.

### 3. Understand the Architecture
Read the [Architecture Guide](docs/ARCHITECTURE.md) to understand how systems interact.

## 📋 Contribution Process

### Step 1: Plan Your Contribution
```bash
# 1. Check existing issues
# Browse GitHub issues to see if someone's already working on it

# 2. Create/comment on issue
# If no issue exists, create one describing your planned contribution

# 3. Get feedback
# Wait for maintainer feedback before starting work
# This prevents duplicate effort and ensures alignment
```

### Step 2: Implement Your Changes
```bash
# 1. Fork the repository
# Click "Fork" on GitHub to create your copy

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/dungeon-ecosystem-3d.git
cd dungeon-ecosystem-3d

# 3. Create feature branch
git checkout -b feature/descriptive-name

# 4. Make your changes
# Follow coding standards and write tests

# 5. Test thoroughly
npm test
npm run test:performance
npm run lint
```

### Step 3: Submit Your Contribution
```bash
# 1. Commit with good messages
git add .
git commit -m "feat: add flocking behavior for creatures

- Implement boids algorithm for group movement
- Add configurable separation, alignment, cohesion
- Update creature AI to use flocking when in groups
- Add tests for flocking calculations

Fixes #123"

# 2. Push to your fork
git push origin feature/descriptive-name

# 3. Create Pull Request
# Go to GitHub and click "Create Pull Request"
# Fill out the PR template completely
```

## 📝 Code Standards

### JavaScript Style Guide
```javascript
// ✅ Good: Clear, descriptive names
class CreatureBehaviorManager {
  calculateFlockingForce(creature, neighbors, config) {
    const separationForce = this.calculateSeparation(creature, neighbors);
    const alignmentForce = this.calculateAlignment(creature, neighbors);
    const cohesionForce = this.calculateCohesion(creature, neighbors);
    
    return separationForce
      .multiply(config.separationWeight)
      .add(alignmentForce.multiply(config.alignmentWeight))
      .add(cohesionForce.multiply(config.cohesionWeight));
  }
}

// ❌ Bad: Unclear, abbreviated names
class CBM {
  calcFF(c, n, cfg) {
    const sF = this.calcS(c, n);
    const aF = this.calcA(c, n);
    const cF = this.calcC(c, n);
    return sF.mul(cfg.sW).add(aF.mul(cfg.aW)).add(cF.mul(cfg.cW));
  }
}
```

### Coding Conventions
- **Variables**: `camelCase` (`creatureCount`, `environmentalFactor`)
- **Classes**: `PascalCase` (`Vector3`, `EcosystemManager`)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_POPULATION`, `GRAVITY_CONSTANT`)
- **Files**: `PascalCase.js` for classes, `camelCase.js` for utilities
- **Private methods**: Prefix with underscore (`_calculateInternalState`)

### Performance Guidelines
```javascript
// ✅ Good: Reuse objects to avoid garbage collection
class ParticleSystem {
  constructor() {
    this.tempVector = new Vector3(); // Reusable temp object
  }
  
  updateParticle(particle, deltaTime) {
    // Reuse temp vector instead of creating new ones
    this.tempVector.copy(particle.velocity);
    this.tempVector.multiplyInPlace(deltaTime);
    particle.position.addInPlace(this.tempVector);
  }
}

// ❌ Bad: Creates new objects every frame
class ParticleSystem {
  updateParticle(particle, deltaTime) {
    // Creates garbage every frame
    const deltaPosition = particle.velocity.multiply(deltaTime);
    particle.position = particle.position.add(deltaPosition);
  }
}
```

### Documentation Standards
```javascript
/**
 * Calculates predation pressure on prey population
 * 
 * Uses Lotka-Volterra equations modified with environmental carrying capacity
 * and realistic hunting success rates based on predator/prey density ratios.
 * 
 * @param {number} predatorCount - Number of predators in area
 * @param {number} preyCount - Number of prey in area  
 * @param {number} huntingEfficiency - Success rate per predator (0-1)
 * @param {number} carryingCapacity - Maximum sustainable prey population
 * @returns {number} Predation rate (prey consumed per time unit)
 * 
 * @example
 * // 10 spiders hunting 100 beetles with 15% efficiency
 * const predation = calculatePredationPressure(10, 100, 0.15, 150);
 * console.log(`${predation} beetles consumed per hour`);
 */
function calculatePredationPressure(predatorCount, preyCount, huntingEfficiency, carryingCapacity) {
  // Implementation here...
}
```

## 🧪 Testing Requirements

### Test Coverage Requirements
- **New features**: Must have ≥90% test coverage
- **Bug fixes**: Must include regression test
- **Performance improvements**: Must include benchmark test
- **Refactoring**: All existing tests must pass

### Types of Tests Required

#### Unit Tests
```javascript
// Example unit test
describe('Vector3', () => {
  test('cross product of perpendicular vectors', () => {
    const v1 = new Vector3(1, 0, 0);
    const v2 = new Vector3(0, 1, 0);
    const result = v1.cross(v2);
    
    expect(result.equals(new Vector3(0, 0, 1))).toBe(true);
  });
});
```

#### Integration Tests
```javascript
// Example integration test
describe('Ecosystem Integration', () => {
  test('predator increase should decrease prey population', async () => {
    const ecosystem = new EcosystemManager();
    ecosystem.addSpecies('beetle', 100);
    ecosystem.addSpecies('spider', 5);
    
    // Run simulation for 10 time steps
    for (let i = 0; i < 10; i++) {
      await ecosystem.update(1.0);
    }
    
    expect(ecosystem.getPopulation('beetle')).toBeLessThan(100);
  });
});
```

#### Performance Tests
```javascript
// Example performance test
describe('Performance', () => {
  test('1000 creatures should maintain 60fps', () => {
    const startTime = performance.now();
    const ecosystem = new EcosystemManager();
    
    // Add 1000 creatures
    for (let i = 0; i < 1000; i++) {
      ecosystem.addCreature('beetle', randomPosition());
    }
    
    // Single update should complete in <16ms (60fps)
    ecosystem.update(0.016);
    const elapsed = performance.now() - startTime;
    
    expect(elapsed).toBeLessThan(16);
  });
});
```

## 🎨 Asset Contribution Guidelines

### 3D Models
- **Format**: OBJ or GLTF 2.0
- **Polycount**: <2000 triangles for creatures, <5000 for environments
- **Textures**: 512x512 or 1024x1024 maximum
- **UV Mapping**: Clean, efficient UV layouts
- **Naming**: Descriptive names matching species/object types

### Textures
- **Format**: PNG for transparency, JPG for opaque surfaces
- **Resolution**: Power-of-2 dimensions (256, 512, 1024)
- **Optimization**: Use texture atlases when possible
- **Naming**: `object-type-map.extension` (e.g., `beetle-diffuse.png`)

### Audio
- **Format**: OGG Vorbis (primary), MP3 (fallback)
- **Quality**: 44.1kHz, 16-bit, mono for effects, stereo for ambient
- **Length**: <5 seconds for creature sounds, <30 seconds for ambient
- **Processing**: Normalized to -6dB peak, no clipping

## 🔬 Scientific Accuracy Standards

### Ecological Models
All ecosystem simulations must be based on peer-reviewed research:

```javascript
// ✅ Good: Based on real ecological principles
function calculateCarryingCapacity(environment, species) {
  // Based on Verhulst logistic growth model
  const baseCapacity = environment.resources / species.resourceNeeds;
  const temperatureFactor = species.temperatureTolerance(environment.temperature);
  const competitionFactor = calculateInterspecificCompetition(species, environment);
  
  return baseCapacity * temperatureFactor * competitionFactor;
}

// ❌ Bad: Arbitrary game logic
function calculateCarryingCapacity(environment, species) {
  return Math.random() * 100; // Not based on real ecology
}
```

### Required Citations
For any ecological model implementation, include citations:
```javascript
/**
 * Lotka-Volterra predator-prey dynamics with environmental carrying capacity
 * 
 * Based on:
 * - Lotka, A.J. (1925). Elements of Physical Biology
 * - Volterra, V. (1926). Fluctuations in the abundance of a species
 * - Begon, M. et al. (2006). Ecology: From Individuals to Ecosystems
 * 
 * @param {Object} predator - Predator population data
 * @param {Object} prey - Prey population data
 * @param {Object} environment - Environmental parameters
 * @returns {Object} Population change rates
 */
```

## 📊 Performance Standards

### Frame Rate Requirements
- **Development**: 30fps minimum with debug tools enabled
- **Production**: 60fps target with 1000+ creatures
- **Stress Test**: Graceful degradation with 10,000+ creatures

### Memory Usage
- **Startup**: <100MB initial load
- **Runtime**: <500MB with typical ecosystem
- **Garbage Collection**: <5ms pause time for GC events

### Code Performance
```javascript
// ✅ Good: O(log n) spatial queries using octree
function findNearbyCreatures(position, radius) {
  return this.spatialIndex.queryRange(position, radius);
}

// ❌ Bad: O(n) brute force search
function findNearbyCreatures(position, radius) {
  return this.allCreatures.filter(creature => 
    creature.position.distance(position) < radius
  );
}
```

## 🚨 Review Process

### Automated Checks
Your PR will automatically run:
- **Linting**: ESLint for code quality
- **Tests**: Full test suite including performance tests
- **Bundle Analysis**: Check for size increases
- **Accessibility**: Basic accessibility compliance

### Manual Review Criteria
Reviewers will check for:

#### Code Quality
- [ ] Follows established patterns and conventions
- [ ] Includes comprehensive documentation
- [ ] Has appropriate test coverage
- [ ] Handles edge cases and errors gracefully

#### Scientific Accuracy
- [ ] Ecological models based on real research
- [ ] Includes proper citations where applicable
- [ ] Parameters within realistic ranges
- [ ] Behavior matches observed natural phenomena

#### Performance Impact
- [ ] No significant performance regressions
- [ ] Memory usage remains reasonable
- [ ] Algorithms scale appropriately
- [ ] GPU/CPU usage optimized

#### User Experience
- [ ] Changes enhance rather than complicate the experience
- [ ] Debug tools and visualizations are helpful
- [ ] Error messages are clear and actionable
- [ ] Documentation is user-friendly

### Review Timeline
- **Small changes** (bug fixes, documentation): 1-2 days
- **Medium changes** (new features, optimizations): 3-5 days  
- **Large changes** (architectural, major features): 1-2 weeks

## 🏆 Recognition

### Contribution Levels
- **🌱 Contributor**: First merged PR
- **🌿 Regular Contributor**: 5+ merged PRs
- **🌳 Core Contributor**: 20+ merged PRs + architectural contributions
- **🦋 Ecosystem Expert**: Major ecological model contributions
- **🎨 Visual Artist**: Significant asset contributions
- **📚 Documentation Master**: Major documentation contributions

### Hall of Fame
Outstanding contributors will be featured in:
- Project README credits section
- Conference presentations about the project
- Academic papers describing the simulation
- Special recognition in the application itself

## ❓ Getting Help

### Before Asking for Help
1. **Search existing issues** - Someone may have already solved your problem
2. **Check documentation** - Look in `/docs` folder and code comments
3. **Read error messages carefully** - They often contain the solution
4. **Try the debugging tools** - Use browser DevTools and our debug panels

### How to Ask Good Questions
```markdown
## Problem Description
Clear, one-sentence description of what's wrong.

## Expected Behavior
What should happen?

## Actual Behavior  
What actually happens?

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Environment
- OS: macOS 12.1
- Browser: Chrome 96.0.4664.110
- Node.js: v16.13.1
- Project commit: a7b3c2d

## Additional Context
Any other relevant information, screenshots, or code samples.
```

### Where to Get Help
- **GitHub Issues**: Technical problems, bugs, feature requests
- **GitHub Discussions**: General questions, ideas, showcasing work
- **Discord Chat**: Real-time help, casual discussion
- **Code Review**: Detailed feedback on your contributions

---

## 🎉 Thank You!

Every contribution, no matter how small, helps make this project better. Whether you're fixing a typo, implementing a complex ecological model, or creating beautiful 3D assets, your work matters.

Together, we're building something unprecedented - a scientifically accurate, visually stunning ecosystem simulation that can help people understand the complex relationships that govern life on Earth.

**Happy coding! 🦇🌿**