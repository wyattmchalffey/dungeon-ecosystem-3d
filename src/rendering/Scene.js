/**
 * Scene - Hierarchical Scene Graph Management
 * Essential for organizing dungeon rooms, creatures, and objects
 */

import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

/**
 * Base scene node with transform hierarchy
 */
export class SceneNode {
    constructor(name = 'Node') {
        this.name = name;
        this.id = SceneNode.nextId++;
        
        // Transform components
        this.position = new Vector3(0, 0, 0);
        this.rotation = Quaternion.identity();
        this.scale = new Vector3(1, 1, 1);
        
        // Hierarchy
        this.parent = null;
        this.children = [];
        
        // Matrices
        this.localMatrix = Matrix4.identity();
        this.worldMatrix = Matrix4.identity();
        this.matrixDirty = true;
        
        // Visibility and activity
        this.visible = true;
        this.active = true;
        
        // User data
        this.userData = {};
        
        // Components (for entity-component pattern)
        this.components = new Map();
    }
    
    static nextId = 0;
    
    /**
     * Add child node
     */
    addChild(node) {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        
        node.parent = this;
        this.children.push(node);
        node.updateWorldMatrix();
        
        return this;
    }
    
    /**
     * Remove child node
     */
    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index !== -1) {
            this.children.splice(index, 1);
            node.parent = null;
        }
        
        return this;
    }
    
    /**
     * Find child by name (recursive)
     */
    findByName(name) {
        if (this.name === name) return this;
        
        for (const child of this.children) {
            const found = child.findByName(name);
            if (found) return found;
        }
        
        return null;
    }
    
    /**
     * Update local transformation matrix
     */
    updateLocalMatrix() {
        this.localMatrix = Matrix4.compose(
            this.position,
            this.rotation.toMatrix4(),
            this.scale
        );
        
        this.matrixDirty = false;
    }
    
    /**
     * Update world transformation matrix
     */
    updateWorldMatrix(updateParents = false, updateChildren = true) {
        if (updateParents && this.parent) {
            this.parent.updateWorldMatrix(true, false);
        }
        
        if (this.matrixDirty) {
            this.updateLocalMatrix();
        }
        
        if (this.parent) {
            this.worldMatrix = this.parent.worldMatrix.multiply(this.localMatrix);
        } else {
            this.worldMatrix.copy(this.localMatrix);
        }
        
        if (updateChildren) {
            for (const child of this.children) {
                child.updateWorldMatrix(false, true);
            }
        }
    }
    
    /**
     * Get world position
     */
    getWorldPosition() {
        this.updateWorldMatrix(true, false);
        return this.worldMatrix.getPosition();
    }
    
    /**
     * Set position and mark dirty
     */
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.matrixDirty = true;
        return this;
    }
    
    /**
     * Set rotation and mark dirty
     */
    setRotation(rotation) {
        this.rotation.copy(rotation);
        this.matrixDirty = true;
        return this;
    }
    
    /**
     * Set scale and mark dirty
     */
    setScale(x, y, z) {
        if (typeof x === 'number' && y === undefined && z === undefined) {
            this.scale.set(x, x, x);
        } else {
            this.scale.set(x, y, z);
        }
        this.matrixDirty = true;
        return this;
    }
    
    /**
     * Add component to node
     */
    addComponent(name, component) {
        this.components.set(name, component);
        if (component.onAttach) {
            component.onAttach(this);
        }
        return this;
    }
    
    /**
     * Get component by name
     */
    getComponent(name) {
        return this.components.get(name);
    }
    
    /**
     * Remove component
     */
    removeComponent(name) {
        const component = this.components.get(name);
        if (component) {
            if (component.onDetach) {
                component.onDetach(this);
            }
            this.components.delete(name);
        }
        return this;
    }
    
    /**
     * Traverse scene graph
     */
    traverse(callback) {
        callback(this);
        
        for (const child of this.children) {
            child.traverse(callback);
        }
    }
    
    /**
     * Clone node (deep copy)
     */
    clone(recursive = true) {
        const cloned = new SceneNode(this.name + '_clone');
        
        cloned.position.copy(this.position);
        cloned.rotation.copy(this.rotation);
        cloned.scale.copy(this.scale);
        cloned.visible = this.visible;
        cloned.active = this.active;
        cloned.userData = { ...this.userData };
        
        // Clone components
        for (const [name, component] of this.components) {
            if (component.clone) {
                cloned.addComponent(name, component.clone());
            }
        }
        
        // Clone children
        if (recursive) {
            for (const child of this.children) {
                cloned.addChild(child.clone(true));
            }
        }
        
        return cloned;
    }
}

/**
 * Main scene container
 */
export class Scene extends SceneNode {
    constructor() {
        super('Scene');
        
        // Scene-specific properties
        this.ambientLight = new Vector3(0.2, 0.2, 0.3);
        this.fog = {
            enabled: false,
            color: new Vector3(0.5, 0.5, 0.6),
            near: 10,
            far: 100
        };
        
        // Performance optimization structures
        this.renderableNodes = [];
        this.lightNodes = [];
        this.updateableNodes = [];
        
        // Spatial partitioning (prepare for Phase 3)
        this.spatialIndex = null;
    }
    
    /**
     * Prepare scene for rendering
     */
    prepareRender() {
        this.renderableNodes = [];
        this.lightNodes = [];
        
        this.traverse((node) => {
            if (!node.visible) return;
            
            // Check for renderable component
            const mesh = node.getComponent('mesh');
            if (mesh) {
                this.renderableNodes.push(node);
            }
            
            // Check for light component
            const light = node.getComponent('light');
            if (light) {
                this.lightNodes.push(node);
            }
        });
    }
    
    /**
     * Update all active nodes
     */
    update(deltaTime) {
        this.updateableNodes = [];
        
        this.traverse((node) => {
            if (!node.active) return;
            
            // Update all components
            for (const component of node.components.values()) {
                if (component.update) {
                    component.update(deltaTime);
                }
            }
            
            // Check for update component
            const updater = node.getComponent('updater');
            if (updater) {
                this.updateableNodes.push(node);
            }
        });
    }
    
    /**
     * Get all nodes within radius (for spatial queries)
     */
    getNodesInRadius(position, radius) {
        const results = [];
        
        this.traverse((node) => {
            const worldPos = node.getWorldPosition();
            if (worldPos.distance(position) <= radius) {
                results.push(node);
            }
        });
        
        return results;
    }
    
    /**
     * Raycast through scene
     */
    raycast(origin, direction, maxDistance = Infinity) {
        const hits = [];
        
        this.traverse((node) => {
            const mesh = node.getComponent('mesh');
            if (mesh && mesh.raycast) {
                const hit = mesh.raycast(origin, direction, node.worldMatrix);
                if (hit && hit.distance <= maxDistance) {
                    hits.push({
                        node: node,
                        ...hit
                    });
                }
            }
        });
        
        // Sort by distance
        hits.sort((a, b) => a.distance - b.distance);
        
        return hits;
    }
}

/**
 * Group node for organizing scene objects
 */
export class Group extends SceneNode {
    constructor(name = 'Group') {
        super(name);
    }
}

/**
 * Mesh node for renderable objects
 */
export class Mesh extends SceneNode {
    constructor(geometry, material, name = 'Mesh') {
        super(name);
        
        this.addComponent('mesh', {
            geometry: geometry,
            material: material,
            
            raycast: function(origin, direction, worldMatrix) {
                // Implement ray-mesh intersection
                // This is a placeholder - implement based on geometry type
                return null;
            },
            
            clone: function() {
                return {
                    geometry: this.geometry,
                    material: this.material,
                    raycast: this.raycast
                };
            }
        });
    }
}

/**
 * Light node
 */
export class Light extends SceneNode {
    constructor(type = 'directional', name = 'Light') {
        super(name);
        
        this.addComponent('light', {
            type: type, // 'directional', 'point', 'spot'
            color: new Vector3(1, 1, 1),
            intensity: 1,
            
            // Point/spot light properties
            range: 10,
            decay: 1,
            
            // Spot light properties
            angle: Math.PI / 3,
            penumbra: 0.1,
            
            // Shadow properties
            castShadow: false,
            shadowBias: 0.001,
            shadowResolution: 1024,
            
            clone: function() {
                const cloned = { ...this };
                cloned.color = this.color.clone();
                return cloned;
            }
        });
    }
}

/**
 * Camera node (useful for cutscenes or multiple viewpoints)
 */
export class CameraNode extends SceneNode {
    constructor(fov = 45, name = 'Camera') {
        super(name);
        
        this.addComponent('camera', {
            fov: fov,
            aspect: 1,
            near: 0.1,
            far: 100,
            
            getProjectionMatrix: function() {
                return Matrix4.perspective(
                    this.fov * Math.PI / 180,
                    this.aspect,
                    this.near,
                    this.far
                );
            },
            
            clone: function() {
                return { ...this };
            }
        });
    }
}

/**
 * Example usage for Phase 3 - Room node for dungeon generation
 */
export class RoomNode extends Group {
    constructor(width, height, depth, name = 'Room') {
        super(name);
        
        this.dimensions = new Vector3(width, height, depth);
        this.roomType = 'generic'; // 'start', 'boss', 'treasure', etc.
        this.connections = []; // References to connected rooms
        this.environmentalZones = []; // Water, heat sources, etc.
        
        // Room-specific data
        this.userData.temperature = 20;
        this.userData.humidity = 50;
        this.userData.lightLevel = 0.1;
    }
    
    /**
     * Connect this room to another
     */
    connectTo(otherRoom, direction) {
        this.connections.push({
            room: otherRoom,
            direction: direction,
            doorway: null // Will be created by dungeon generator
        });
        
        // Create reciprocal connection
        const oppositeDir = this.getOppositeDirection(direction);
        otherRoom.connections.push({
            room: this,
            direction: oppositeDir,
            doorway: null
        });
    }
    
    getOppositeDirection(direction) {
        const opposites = {
            'north': 'south',
            'south': 'north',
            'east': 'west',
            'west': 'east',
            'up': 'down',
            'down': 'up'
        };
        return opposites[direction] || direction;
    }
}