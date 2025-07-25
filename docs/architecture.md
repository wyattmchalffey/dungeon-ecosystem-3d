# 🏗️ System Architecture Guide

This document explains the high-level architecture of the Dungeon Ecosystem 3D Engine, including design decisions, data flow, and system interactions.

## 🎯 Core Design Philosophy

### Separation of Concerns
The engine is built around three independent layers that can operate separately:

1. **Simulation Layer** - Pure ecological mathematics and population dynamics
2. **Rendering Layer** - 3D graphics, shaders, and visual effects  
3. **Interaction Layer** - User input, UI, and ecosystem manipulation

This separation allows for:
- **Headless simulation** for testing and server-side processing
- **Multiple renderers** (3D, 2D graphs, VR, etc.)
- **Independent optimization** of each system
- **Easier debugging** through isolated components

### Data-Driven Design
All ecosystem parameters, species definitions, and behavioral rules are stored in JSON configuration files rather than hardcoded values. This enables:
- **Rapid experimentation** with ecosystem parameters
- **Non-programmer contribution** to ecosystem design
- **Runtime modification** of species behaviors
- **Easy A/B testing** of different ecological models

### Performance-First Architecture
From day one, the system is designed to handle thousands of creatures across hundreds of rooms at 60fps:
- **Web Workers** for heavy simulation calculations
- **Spatial partitioning** to avoid O(n²) distance calculations  
- **Level-of-detail systems** for both simulation and rendering
- **Object pooling** to minimize garbage collection
- **Instanced rendering** for large populations

## 🧵 Thread Architecture

```mermaid
graph TD
    A[Main Thread] --> B[Rendering Pipeline]
    A --> C[UI System]
    A --> D[Input Handling]
    
    E[Simulation Worker] --> F[Population Dynamics]
    E --> G[Environmental Updates]
    E --> H[Migration Calculations]
    
    I[Pathfinding Worker] --> J[A* Navigation]
    I --> K[Flocking Behaviors]
    
    L[Generation Worker] --> M[Dungeon Layout]
    L --> N[Environmental Zones]
    
    A <--> E
    A <--> I  
    A <--> L
```

### Main Thread Responsibilities
- **Rendering**: WebGL draw calls, shader management, camera updates
- **UI**: Debug panels, ecosystem viewers, time controls
- **Input**: Mouse/keyboard handling, camera controls
- **Coordination**: Message passing with workers, state synchronization

### Simulation Worker
- **Population Updates**: Birth/death calculations, carrying capacity
- **Species Interactions**: Predation, competition, disease spread
- **Environmental Changes**: Temperature/humidity gradients, resource decay
- **Migration Logic**: Population pressure, pathfinding triggers

### Specialized Workers
- **Pathfinding Worker**: A* navigation, flocking calculations
- **Generation Worker**: Procedural dungeon creation, biome placement
- **Audio Worker**: Spatial audio processing, procedural sound generation

## 📊 Data Flow Architecture

### Simulation → Rendering Pipeline
```javascript
// Simulation calculates creature positions/states
SimulationWorker.postMessage({
  type: 'CREATURE_UPDATE',
  creatures: [
    { id: 1, position: [x, y, z], species: 'beetle', state: 'feeding' },
    { id: 2, position: [x, y, z], species: 'spider', state: 'hunting' }
  ]
});

// Main thread receives and updates render data
onmessage = (event) => {
  if (event.data.type === 'CREATURE_UPDATE') {
    renderQueue.updateCreatures(event.data.creatures);
  }
};
```

### User Input → Simulation Pipeline
```javascript
// User clicks to add food source
onClick(worldPosition) {
  simulationWorker.postMessage({
    type: 'ADD_RESOURCE',
    position: worldPosition,
    resourceType: 'organic_matter',
    amount: 50
  });
}
```

### Configuration → Runtime Pipeline
```javascript
// Species definitions loaded from JSON
const speciesConfig = await fetch('/assets/data/species-definitions.json');
const species = new SpeciesManager(speciesConfig);

// Runtime modification through UI
modifySpecies('cave_spider', { 
  reproductionRate: 0.035,  // Increase from 0.03
  aggressionLevel: 0.8      // New parameter
});
```

## 🏛️ System Modules

### Core Systems (`src/core/`)

#### Engine.js
The main engine coordinator that:
- Initializes all subsystems in correct order
- Manages the main game loop
- Handles system communication and error recovery
- Provides global access to managers and utilities

#### Time.js
Centralized time management:
- **Delta time calculation** for frame-independent updates
- **Time scaling** for fast-forward/slow-motion effects
- **Pause/resume functionality** with state preservation
- **Timestamp synchronization** between threads

#### EventSystem.js
Decoupled communication system:
- **Pub/sub pattern** for loose coupling between systems
- **Event prioritization** for performance-critical messages
- **Event replay** for debugging and state reconstruction
- **Cross-thread messaging** with automatic serialization

#### ResourceManager.js
Asset loading and caching:
- **Async loading** with progress callbacks
- **Intelligent caching** with memory management
- **Asset hot-reloading** for development
- **Format conversion** (OBJ to engine format, etc.)

### Rendering Systems (`src/rendering/`)

#### Renderer.js
Main rendering coordinator:
- **Render queue management** with automatic batching
- **Viewport and context management**
- **Performance monitoring** with automatic quality scaling
- **Multi-pass rendering** for effects like shadows

#### Scene.js
Hierarchical scene management:
- **Transform hierarchy** with automatic matrix updates
- **Frustum culling** to skip invisible objects
- **Level-of-detail selection** based on distance/importance
- **Scene serialization** for save/load functionality

#### Camera.js
Flexible camera system:
- **Multiple camera types** (orbit, first-person, cinematic)
- **Smooth transitions** between camera modes
- **Auto-follow** for tracking creatures or events
- **FOV and projection management**

### Simulation Systems (`src/simulation/`)

#### EcosystemManager.js
Top-level ecosystem coordination:
- **Room interconnection** and migration pathways
- **Global resource balancing** across rooms
- **Extinction recovery** through recolonization
- **Ecosystem health monitoring** and alerts

#### Species.js
Individual species behavior definition:
- **Behavioral state machines** for complex AI
- **Genetic parameter inheritance** and mutation
- **Environmental adaptation** over generations
- **Social behaviors** (flocking, territorial, cooperative)

#### Population.js
Population-level dynamics:
- **Stochastic birth/death** with realistic variation
- **Age structure modeling** for demographic realism
- **Genetic diversity tracking** to prevent inbreeding
- **Disease resistance** and outbreak modeling

#### Environment.js
Environmental simulation:
- **Heat/humidity diffusion** using simplified fluid dynamics
- **Resource flow** through interconnected chambers
- **Seasonal-like cycles** for environmental variation
- **Pollution accumulation** from creature waste

### Entity Systems (`src/entities/`)

#### Entity.js
Base entity with component system:
- **Transform component** for position/rotation/scale
- **Render component** for visual representation
- **Physics component** for collision and movement
- **Behavior component** for AI state machines

#### Creature.js
Individual creature simulation:
- **Needs system** (hunger, thirst, safety, reproduction)
- **Memory system** for learning and spatial awareness
- **Social relationships** with other creatures
- **Life stage progression** (juvenile, adult, elder)

## 🔧 Performance Architecture

### Spatial Optimization

#### Octree Partitioning
```javascript
class DungeonOctree {
  constructor(bounds, maxDepth = 6) {
    this.bounds = bounds;
    this.creatures = [];
    this.children = null;
    this.maxCreatures = 10;
  }
  
  insert(creature) {
    // Automatically subdivide when capacity exceeded
    // Enable O(log n) spatial queries instead of O(n)
  }
  
  queryRange(range) {
    // Return only creatures within specified 3D range
    // Used for predator detection, resource competition
  }
}
```

#### Level-of-Detail System
```javascript
class LODManager {
  updateCreatureLOD(creature, cameraDistance) {
    if (cameraDistance < 10) {
      creature.setLOD('high');    // Full animation, individual AI
    } else if (cameraDistance < 50) {
      creature.setLOD('medium');  // Simplified animation, group AI
    } else {
      creature.setLOD('low');     // Statistical representation only
    }
  }
}
```

### Memory Management

#### Object Pooling
```javascript
class CreaturePool {
  constructor(species, poolSize = 1000) {
    this.available = [];
    this.active = new Set();
    
    // Pre-allocate creature objects
    for (let i = 0; i < poolSize; i++) {
      this.available.push(new Creature(species));
    }
  }
  
  spawn(position) {
    const creature = this.available.pop() || new Creature(this.species);
    creature.reset(position);
    this.active.add(creature);
    return creature;
  }
  
  despawn(creature) {
    this.active.delete(creature);
    this.available.push(creature);
  }
}
```

#### Smart Garbage Collection
```javascript
class MemoryManager {
  constructor() {
    this.gcThreshold = 100000;  // Objects before forced GC
    this.objectCount = 0;
  }
  
  trackAllocation(obj) {
    this.objectCount++;
    if (this.objectCount > this.gcThreshold) {
      this.forceGarbageCollection();
    }
  }
  
  forceGarbageCollection() {
    // Clean up temporary objects
    // Force browser GC during low-activity periods
    requestIdleCallback(() => {
      // Cleanup logic here
    });
  }
}
```

### Rendering Optimization

#### Instanced Rendering
```javascript
class InstancedRenderer {
  constructor() {
    this.instanceMatrices = new Float32Array(1000 * 16);  // 1000 4x4 matrices
    this.instanceColors = new Float32Array(1000 * 4);     // 1000 RGBA colors
    this.instanceCount = 0;
  }
  
  addInstance(matrix, color) {
    // Add to instance buffers instead of individual draw calls
    // Single draw call renders thousands of creatures
  }
  
  render() {
    gl.drawElementsInstanced(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0, this.instanceCount);
  }
}
```

## 🔄 State Management

### Simulation State
```javascript
class SimulationState {
  constructor() {
    this.time = 0;
    this.day = 1;
    this.globalResources = new Map();
    this.rooms = new Map();
    this.species = new Map();
    this.eventLog = [];
  }
  
  serialize() {
    // Convert to JSON for save/load
    return JSON.stringify({
      time: this.time,
      rooms: Array.from(this.rooms.entries()),
      // ... other state
    });
  }
  
  deserialize(json) {
    // Restore from saved state
    const data = JSON.parse(json);
    this.time = data.time;
    // ... restore other state
  }
}
```

### Rendering State
```javascript
class RenderState {
  constructor() {
    this.camera = new Camera();
    this.lights = [];
    this.renderQueue = new RenderQueue();
    this.debugFlags = new Set();
  }
  
  syncWithSimulation(simulationState) {
    // Update visual representations based on simulation
    this.updateCreaturePositions(simulationState.creatures);
    this.updateEnvironmentalEffects(simulationState.environment);
  }
}
```

## 🚨 Error Handling & Recovery

### Graceful Degradation
```javascript
class SystemResilience {
  constructor() {
    this.fallbackModes = new Map([
      ['webgl2', 'webgl1'],
      ['webgl1', 'canvas2d'],
      ['canvas2d', 'statistical-only']
    ]);
  }
  
  handleSystemFailure(failedSystem) {
    const fallback = this.fallbackModes.get(failedSystem);
    if (fallback) {
      console.warn(`Falling back from ${failedSystem} to ${fallback}`);
      this.initializeFallback(fallback);
    }
  }
}
```

### Worker Recovery
```javascript
class WorkerManager {
  constructor() {
    this.workers = new Map();
    this.heartbeatInterval = 5000;  // 5 second heartbeat
  }
  
  createWorker(type, script) {
    const worker = new Worker(script);
    worker.onerror = () => this.restartWorker(type);
    this.workers.set(type, worker);
    this.startHeartbeat(worker, type);
  }
  
  restartWorker(type) {
    console.warn(`Restarting ${type} worker`);
    const oldWorker = this.workers.get(type);
    oldWorker?.terminate();
    this.createWorker(type, this.workerScripts.get(type));
  }
}
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Room-based partitioning**: Each room can be simulated independently
- **Species-based partitioning**: Different workers handle different species
- **Time-based partitioning**: Historical data moved to separate storage

### Vertical Scaling
- **Adaptive quality**: Reduce simulation complexity based on performance
- **Dynamic LOD**: More aggressive level-of-detail as complexity increases
- **Selective updates**: Only update visible/important parts of ecosystem

### Future Architecture Extensions
- **Network multiplayer**: Multiple users observing same ecosystem
- **Cloud computing**: Offload heavy simulation to server workers
- **Machine learning**: AI species that learn and adapt behaviors
- **VR/AR support**: Immersive ecosystem exploration

## 🧪 Testing Architecture

### Unit Testing
- **Math libraries**: Comprehensive coverage of all mathematical operations
- **Individual components**: Isolated testing with mocked dependencies
- **Performance benchmarks**: Automated performance regression detection

### Integration Testing
- **System interactions**: Cross-system communication and data flow
- **Worker communication**: Message passing and state synchronization
- **Save/load functionality**: State serialization and restoration

### Ecosystem Testing
- **Population stability**: Long-term ecosystem balance verification
- **Extinction recovery**: System resilience to population crashes
- **Parameter sensitivity**: How changes affect ecosystem stability

This architecture provides a solid foundation for building a complex, performant ecosystem simulation while maintaining flexibility for future enhancements and modifications.