# 🤝 Contributing to Dungeon Ecosystem 3D Engine

Thank you for your interest in contributing! This project aims to create the most scientifically accurate and visually stunning ecosystem simulation possible, and we need help from developers, artists, scientists, and enthusiasts.

## 🎯 Current Development Focus (Phase 3)

We're currently starting **Phase 3: Procedural Dungeon Generation**. This is an excellent time to contribute as we're building the foundation for the ecosystem simulation.

### 🔥 High Priority Contributions Needed

#### **Procedural Generation (Phase 3 - Starting Now)**
- **Room Generation Algorithms**: Implement space partitioning and layout systems
- **3D Geometry Creation**: Convert room data to optimized 3D meshes
- **Environmental Placement**: Algorithms for water, heat sources, organic matter
- **Performance Optimization**: Ensure 60fps with large generated dungeons

#### **Asset Creation (Ready for Contributors)**
- **Dungeon Textures**: Stone walls, floors, water surfaces, moss patterns
- **3D Models**: Rock formations, stalactites, environmental features
- **Shaders**: Water effects, atmospheric lighting, material systems
- **Audio**: Cave ambience, water drips, spatial sound effects

## 🚀 Ways to Contribute

### 🔬 For Scientists & Researchers
- **Ecological Models**: Implement realistic population dynamics, predator-prey relationships
- **Environmental Systems**: Temperature/humidity diffusion, nutrient cycling, seasonal changes
- **Genetic Algorithms**: Evolution, mutation, adaptation mechanisms
- **Disease Models**: Epidemic spread, immunity, population health

### 💻 For Developers
- **3D Graphics**: WebGL shaders, rendering optimization, visual effects
- **Procedural Generation**: Dungeon algorithms, mesh optimization, spatial systems
- **Performance**: Memory management, spatial optimization, Web Workers
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

## 🏗️ Current Architecture Status

### ✅ Complete & Ready for Extension
```
src/
├── math/              # Vector3, Matrix4, Quaternion, MathUtils ✅
├── rendering/         # WebGL2 pipeline, Camera, Scene graph ✅
├── core/              # Engine, Input, Performance monitoring ✅
└── utils/             # Environment detection ✅
```

### 🚀 Active Development (Phase 3)
```
src/
├── generation/        # 🚀 Procedural dungeon generation
│   ├── DungeonGenerator.js    # Main generation pipeline
│   ├── RoomGenerator.js       # Individual room creation
│   ├── ConnectionSystem.js    # Room interconnection
│   └── EnvironmentalZones.js  # Water, heat, organic matter
```

### 📅 Planned for Future Phases
```
src/
├── simulation/        # 📅 Ecosystem simulation (Phase 4)
├── entities/          # 📅 Creatures and objects (Phase 4)
└── behaviors/         # 📅 AI systems (Phase 4)
```

## 🚀 Getting Started

### For Phase 3 Procedural Generation

1. **Set up development environment**:
```bash
git clone https://github.com/your-org/dungeon-ecosystem-3d
cd dungeon-ecosystem-3d
npm install
npm run dev
```

2. **Understand current capabilities**:
   - Open `http://localhost:3000` to see the current 3D demo
   - Review `src/rendering/GeometryBuilder.js` for mesh creation tools
   - Check `src/rendering/Scene.js` for the component system

3. **Choose your contribution area**:
   - **Room Generation**: Work on `src/generation/DungeonGenerator.js`
   - **Mesh Creation**: Extend `src/rendering/GeometryBuilder.js`
   - **Environmental Features**: Create water, temperature, lighting systems
   - **Performance**: Optimize for large dungeons with many rooms

4. **Start with Phase 3 tasks**:
   - Check GitHub issues labeled `phase-3` and `procedural-generation`
   - Review the [Phase 3 specification](docs/ROADMAP.md#phase-3) 
   - Join discussions in GitHub Discussions for coordination

### For Asset Creation

1. **Review asset specifications**:
   - Check `src/core/AssetLoader.js` for supported formats
   - Review `assets/` directory structure
   - See `dungeonAssets` manifest for needed assets

2. **Asset requirements**:
   - **Textures**: PNG format, power-of-2 dimensions (512x512, 1024x1024)
   - **Models**: OBJ or GLTF, <2000 triangles for performance
   - **Shaders**: GLSL (vertex/fragment), WebGL2 preferred with WebGL1 fallback
   - **Audio**: OGG Vorbis primary, MP3 fallback, <30 seconds

3. **Integration pipeline**:
   - Assets are loaded via `AssetLoader.js`
   - Textures integrate with WebGL material system
   - Models are parsed and converted to BufferGeometry
   - Shaders compile automatically with error handling

## 📋 Contribution Process

### Step 1: Plan Your Contribution
```bash
# 1. Check existing issues and Phase 3 status
# Browse GitHub issues, especially "phase-3" and "good-first-issue" labels

# 2. Create or comment on issue
# Describe your planned contribution and get feedback

# 3. Coordinate with team
# Join GitHub Discussions to avoid duplicate work
```

### Step 2: Development Setup
```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/dungeon-ecosystem-3d.git
cd dungeon-ecosystem-3d

# 2. Create feature branch
git checkout -b feature/phase3-room-generation

# 3. Set up development environment
npm install
npm run dev

# 4. Verify setup
# Open http://localhost:3000 and see 5 animated cubes
# Run npm test to ensure all 12 math tests pass
```

### Step 3: Implementation Guidelines

#### **For Procedural Generation**
```javascript
// ✅ Good: Modular, testable generation
class RoomGenerator {
  generateRoom(config) {
    const layout = this.createLayout(config);
    const geometry = this.createGeometry(layout);
    const features = this.addEnvironmentalFeatures(layout, config);
    
    return {
      geometry: geometry,
      features: features,
      metadata: this.calculateMetadata(layout)
    };
  }
  
  // Make functions pure and testable
  createLayout(config) {
    // Deterministic based on config
    return { width: config.width, height: config.height, doors: [...] };
  }
}

// ❌ Bad: Monolithic, hard to test
class BadRoomGenerator {
  doEverything() {
    // Huge function that does layout, geometry, features all together
    // Uses global state, random numbers without seeds
    // Hard to test individual components
  }
}
```

#### **For Performance-Critical Code**
```javascript
// ✅ Good: Reuse objects, efficient algorithms
class DungeonOptimizer {
  constructor() {
    this.tempVector = new Vector3(); // Reusable
    this.tempMatrix = new Matrix4();
  }
  
  optimizeGeometry(rooms) {
    // Use spatial indexing for O(log n) queries
    const spatialIndex = new Octree(bounds);
    
    for (const room of rooms) {
      // Reuse temp objects
      this.tempVector.copy(room.position);
      // Process efficiently...
    }
  }
}

// ❌ Bad: Creates garbage, inefficient
class BadOptimizer {
  optimizeGeometry(rooms) {
    for (const room of rooms) {
      const temp = new Vector3(room.x, room.y, room.z); // Garbage!
      // O(n²) nested loops
      for (const otherRoom of rooms) {
        // Inefficient comparisons...
      }
    }
  }
}
```

### Step 4: Testing Requirements

#### **Unit Tests for Generation**
```javascript
// Example test for room generation
describe('DungeonGenerator', () => {
  test('generates consistent rooms from same seed', () => {
    const generator = new DungeonGenerator();
    const config = { seed: 12345, roomCount: 10 };
    
    const dungeon1 = generator.generate(config);
    const dungeon2 = generator.generate(config);
    
    expect(dungeon1.rooms.length).toBe(dungeon2.rooms.length);
    expect(dungeon1.rooms[0].position).toEqual(dungeon2.rooms[0].position);
  });
  
  test('creates valid room connections', () => {
    const generator = new DungeonGenerator();
    const dungeon = generator.generate({ roomCount: 5 });
    
    // Every room should be reachable from every other room
    const reachable = generator.findReachableRooms(dungeon.rooms[0]);
    expect(reachable.length).toBe(dungeon.rooms.length);
  });
});
```

#### **Performance Tests**
```javascript
describe('Generation Performance', () => {
  test('medium dungeon generates in under 2 seconds', () => {
    const start = performance.now();
    const generator = new DungeonGenerator();
    
    const dungeon = generator.generate({
      roomCount: 25,
      complexity: 'medium'
    });
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
    expect(dungeon.rooms.length).toBe(25);
  });
});
```

### Step 5: Submit Your Contribution
```bash
# 1. Ensure tests pass
npm test
npm run lint

# 2. Commit with descriptive messages
git add .
git commit -m "feat(generation): implement recursive room partitioning

- Add BSP tree algorithm for room layout
- Support configurable room sizes and ratios  
- Include pathfinding validation for connectivity
- Add unit tests for deterministic generation

Addresses #123"

# 3. Push and create PR
git push origin feature/phase3-room-generation
# Create Pull Request on GitHub with detailed description
```

## 📝 Code Standards for Phase 3

### **Generation Code Conventions**
```javascript
// ✅ Good: Clear, descriptive naming
class DungeonGenerator {
  generateRoomLayout(config) {
    const partitions = this.createBSPPartitions(config.bounds);
    const rooms = this.partitionsToRooms(partitions);
    const connections = this.calculateConnections(rooms);
    
    return { rooms, connections };
  }
  
  createBSPPartitions(bounds, depth = 0) {
    if (this.shouldStopPartitioning(bounds, depth)) {
      return new LeafPartition(bounds);
    }
    
    const splitAxis = this.chooseSplitAxis(bounds);
    const splitPos = this.calculateSplitPosition(bounds, splitAxis);
    
    return new BranchPartition(
      this.createBSPPartitions(bounds.left, depth + 1),
      this.createBSPPartitions(bounds.right, depth + 1)
    );
  }
}

// ❌ Bad: Unclear, abbreviated
class DG {
  gen(cfg) {
    const p = this.bsp(cfg.b);
    const r = this.p2r(p);
    const c = this.calcC(r);
    return { r, c };
  }
}
```

### **Asset Integration Standards**
```javascript
// ✅ Good: Proper asset loading with error handling
class DungeonMaterialManager {
  async loadDungeonMaterials() {
    try {
      const stoneWall = await assetLoader.load('textures/stone-wall.png', 'texture');
      const stoneFloor = await assetLoader.load('textures/stone-floor.png', 'texture');
      const water = await assetLoader.load('textures/water.png', 'texture');
      
      return {
        wall: this.createMaterial(stoneWall, { roughness: 0.8 }),
        floor: this.createMaterial(stoneFloor, { roughness: 0.9 }),
        water: this.createMaterial(water, { transparency: 0.7, animated: true })
      };
    } catch (error) {
      console.error('Failed to load dungeon materials:', error);
      return this.createFallbackMaterials();
    }
  }
}
```

## 🎯 Phase 3 Specific Guidelines

### **Room Generation Requirements**
- **Deterministic**: Same seed produces same dungeon
- **Configurable**: Room count, size ranges, complexity levels
- **Connected**: All rooms must be reachable via pathfinding
- **Efficient**: Generation completes in <2 seconds for medium dungeons
- **Validated**: Automatic checks for structural integrity

### **Geometry Requirements**  
- **Optimized**: Merged meshes for performance
- **Textured**: Proper UV coordinates for materials
- **Lit**: Normal vectors for lighting calculations
- **Culled**: Back-face culling and occlusion ready
- **LOD Ready**: Geometry suitable for level-of-detail systems

### **Environmental Features**
- **Water Systems**: Pools, streams with proper flow direction
- **Temperature Zones**: Gradual transitions, not hard boundaries
- **Organic Matter**: Realistic distribution based on moisture/temperature
- **Lighting**: Areas of light penetration vs deep darkness
- **Air Flow**: Circulation patterns affecting scent and gas distribution

## 🧪 Testing Phase 3 Contributions

### **Generation Testing**
```bash
# Run generation-specific tests
npm run test:generation

# Performance benchmarks
npm run test:performance

# Visual validation
npm run dev
# Navigate to generation test page
# Generate multiple dungeons and verify visually
```

### **Integration Testing**
```bash
# Ensure generation integrates with existing systems
npm run test:integration

# Check WebGL rendering with generated content
npm run dev
# Generate dungeon and verify 60fps maintained
```

## 🎨 Asset Contribution Guidelines

### **Phase 3 Asset Priorities**

#### **High Priority Textures**
- `stone-wall-01.png` - Basic stone wall with subtle variation
- `stone-floor-01.png` - Rough stone floor with realistic wear
- `water-surface.png` - Animated water with normal mapping
- `moss-growth.png` - Organic moss patterns for humidity areas
- `organic-matter.png` - Decomposing material textures

#### **3D Models Needed**
- `rock-formation-small.obj` - Natural cave rock formations
- `stalactite-01.obj` - Hanging cave formations
- `stalagmite-01.obj` - Ground-based formations
- `mushroom-cluster.obj` - Organic growth in dark areas
- `water-pool.obj` - Natural pool formations

#### **Shader Requirements**
- `dungeon-basic.vert/frag` - Standard dungeon material
- `water-animated.vert/frag` - Flowing water with reflections
- `moss-organic.vert/frag` - Organic matter with subsurface scattering
- `rock-detailed.vert/frag` - High-detail rock with parallax mapping

### **Asset Creation Workflow**
1. **Check asset manifest** in `src/core/AssetLoader.js`
2. **Follow naming conventions**: `category-type-variation.extension`
3. **Test in engine**: Use asset loader to verify integration
4. **Optimize for performance**: Keep textures power-of-2, models under triangle limits
5. **Submit with examples**: Include test scenes showing asset in use

## 🤝 Community Guidelines

### **Communication Channels**
- **GitHub Issues**: Technical problems, feature requests, bug reports
- **GitHub Discussions**: General questions, ideas, showcasing contributions
- **Pull Request Reviews**: Detailed code feedback and collaboration
- **Documentation**: Keep docs updated with any API changes

### **Phase 3 Coordination**
Since Phase 3 involves multiple interconnected systems, coordination is crucial:

1. **Claim your area**: Comment on issues or create new ones for your planned work
2. **Share progress**: Regular updates in GitHub Discussions
3. **Test integration**: Ensure your code works with other Phase 3 contributions
4. **Review others**: Help review PRs in areas you understand
5. **Document decisions**: Update docs with any architectural decisions

## 📊 Contribution Impact

### **Phase 3 Success Metrics**
Your contributions to Phase 3 will be measured by:
- **Generation Speed**: <2 seconds for medium complexity dungeons
- **Rendering Performance**: Maintain 60fps with generated content
- **Memory Efficiency**: <200MB for typical generated dungeon
- **Visual Quality**: Realistic and engaging dungeon environments
- **Code Quality**: Maintainable, tested, well-documented code

---

## 🎉 Recognition

### **Phase 3 Contributors**
Phase 3 contributors will be recognized in:
- **Project README** with special "Phase 3 Architect" designation
- **Technical documentation** crediting specific algorithm implementations
- **Academic presentations** about the procedural generation system
- **Community showcases** highlighting exceptional contributions

### **Long-term Recognition**
All contributors become part of the project's history:
- **Contributor levels** based on merged PRs and impact
- **Expert recognition** for domain-specific contributions
- **Conference presentations** featuring contributor work
- **Academic papers** acknowledging community contributions

## ❓ Getting Help for Phase 3

### **Technical Assistance**
- **Generation Algorithms**: Ask in GitHub Discussions with "procedural-generation" tag
- **3D Geometry**: Review `GeometryBuilder.js` examples and ask specific questions
- **Performance Issues**: Use the performance monitor and share metrics
- **Integration Problems**: Check existing Phase 2 systems and ask for guidance

### **Where to Ask**
- **Algorithm Questions**: GitHub Discussions - "algorithms" category
- **Code Review**: Pull Request comments with specific line feedback
- **Performance Help**: GitHub Issues with "performance" label
- **Asset Questions**: GitHub Discussions - "assets" category

---

**Phase 3 is starting NOW! Join us in building the foundation for living digital ecosystems! 🚀**

*Together, we're creating something unprecedented - a scientifically accurate, procedurally generated world that will host complex life simulations.*