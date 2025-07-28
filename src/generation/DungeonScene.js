/**
 * DungeonScene - Integration of dungeon generation with existing engine
 * Replaces DemoScene when dungeon generation is activated.
 * FINAL VERSION - With robust rendering logic for optimized/un-optimized geometry.
 */

import { Vector3 } from '../math/Vector3.js';
import { Scene, Group, Mesh, Light } from '../rendering/Scene.js';
import { DungeonGenerator } from './DungeonGenerator.js';

export class DungeonScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.dungeonGenerator = new DungeonGenerator();
        
        // Current dungeon data
        this.currentDungeon = null;
        this.dungeonGroup = null;
        
        // Generation state
        this.isGenerating = false;
        this.generationProgress = 0;
        
        // Visualization options
        this.showWireframe = false;
        this.showEnvironment = true;
        this.showDebugInfo = false;
    }
    
    /**
     * Generate and display a new dungeon
     */
    async generateDungeon(config = {}) {
        if (this.isGenerating) {
            console.warn('Generation already in progress');
            return;
        }
        
        this.isGenerating = true;
        this.generationProgress = 0;
        
        // Clear existing dungeon
        this.dispose();
        
        try {
            // Default config
            const defaultConfig = {
                seed: Date.now(),
                maxRooms: 20,
                maxDepth: 8,
                theme: 'mixed',
                optimizeGeometry: true // Set to false to debug individual room meshes
            };
            
            config = { ...defaultConfig, ...config };
            
            console.log('🏰 Generating dungeon...');
            
            // Generate dungeon data
            this.currentDungeon = await this.dungeonGenerator.generate(config);
            
            // Create 3D scene representation from the generated data
            if (this.currentDungeon) {
                await this.createDungeonScene();
                this.positionCameraAtEntrance();
                console.log('✅ Dungeon generation complete!');
            } else {
                throw new Error("Dungeon generator returned null or undefined.");
            }
            
        } catch (error) {
            console.error('❌ Dungeon generation failed:', error);
        } finally {
            this.isGenerating = false;
            this.generationProgress = 100;
        }
    }
    
    /**
     * Create 3D scene from the generated dungeon data.
     * This method decides whether to use optimized geometry or individual meshes.
     */
    async createDungeonScene() {
        if (!this.currentDungeon || !this.currentDungeon.geometry) {
            console.error("Cannot create scene, dungeon geometry data is missing.");
            return;
        }

        this.dungeonGroup = new Group('Dungeon');
        this.scene.addChild(this.dungeonGroup);

        const geometrySystem = this.currentDungeon.geometry;

        // Check if optimized geometry was created and should be used.
        if (geometrySystem.optimized && geometrySystem.optimized.size > 0) {
            console.log('✅ Rendering from OPTIMIZED geometry.');
            for (const [materialName, mergedGeometry] of geometrySystem.optimized) {
                const material = this.getMaterial(materialName);
                const mesh = new Mesh(mergedGeometry, material, `Optimized_${materialName}`);
                this.dungeonGroup.addChild(mesh);
            }
        } else {
            // Fallback to rendering individual room components if not optimized.
            console.log('⚠️ Rendering from UN-OPTIMIZED geometry.');
            this.createRoomMeshes();
            this.createConnectionMeshes();
        }

        // Environmental features and lights are added separately.
        if (this.showEnvironment) {
            this.createEnvironmentalFeatures();
            this.createDungeonLighting();
        }
    }
    
    /**
     * Creates meshes for each room component (floor, walls, ceiling).
     * This is the un-optimized rendering path.
     */
    createRoomMeshes() {
        const roomGroup = new Group('Rooms');
        
        for (const [roomId, roomGeometry] of this.currentDungeon.geometry.rooms) {
            const room = this.currentDungeon.rooms.find(r => r.id === roomId);
            if (!room) continue;

            const roomNode = new Group(`Room_${roomId}`);
            roomNode.setPosition(room.position.x, room.position.y, room.position.z);
            
            const material = this.getMaterial(roomGeometry.material);

            if (roomGeometry.floor) {
                const floorMesh = new Mesh(roomGeometry.floor, material, `Floor_${roomId}`);
                roomNode.addChild(floorMesh);
            }
            if (roomGeometry.walls) {
                const wallMesh = new Mesh(roomGeometry.walls, material, `Walls_${roomId}`);
                roomNode.addChild(wallMesh);
            }
            if (roomGeometry.ceiling) {
                const ceilingMesh = new Mesh(roomGeometry.ceiling, material, `Ceiling_${roomId}`);
                roomNode.addChild(ceilingMesh);
            }
            
            roomGroup.addChild(roomNode);
        }
        this.dungeonGroup.addChild(roomGroup);
    }
    
    /**
     * Creates meshes for connection tunnels.
     */
    createConnectionMeshes() {
        const connectionGroup = new Group('Connections');
        
        for (const [connId, connGeometry] of this.currentDungeon.geometry.connections) {
            if (!connGeometry || !connGeometry.tunnel) continue;
            
            const tunnelMesh = new Mesh(
                connGeometry.tunnel,
                this.getMaterial(connGeometry.material),
                `Tunnel_${connId}`
            );
            connectionGroup.addChild(tunnelMesh);
        }
        this.dungeonGroup.addChild(connectionGroup);
    }
    
    /**
     * Creates meshes for environmental features like water.
     */
    createEnvironmentalFeatures() {
        if (!this.currentDungeon.environment) return;

        const envGroup = new Group('Environment');
        
        for (const water of this.currentDungeon.environment.waterBodies || []) {
            // Future implementation for water meshes
        }
        
        this.dungeonGroup.addChild(envGroup);
    }
    
    /**
     * Creates light sources within the scene.
     */
    createDungeonLighting() {
        if (!this.currentDungeon.environment) return;
        
        const lightGroup = new Group('Lights');
        
        for (const lightData of this.currentDungeon.environment.lightSources || []) {
            const light = new Light(this.getLightType(lightData.type), `Light_${lightData.id}`);
            light.setPosition(lightData.position.x, lightData.position.y, lightData.position.z);
            
            const lightComponent = light.getComponent('light');
            lightComponent.color = new Vector3(...lightData.color);
            lightComponent.intensity = lightData.intensity;
            lightComponent.range = lightData.range;
            
            lightGroup.addChild(light);
        }
        this.dungeonGroup.addChild(lightGroup);
    }
    
    /**
     * Get material definition for a given material type string.
     */
    getMaterial(materialType) {
        const materials = this.currentDungeon.geometry.materials;
        const materialData = materials[materialType] || materials.CAVE_ROCK; // Default material
        
        return {
            type: 'phong', // Assuming a Phong lighting model
            color: materialData.color,
            roughness: materialData.roughness || 0.8,
            emissive: materialData.emissive || 0,
            transparency: materialData.transparency || 0
        };
    }
    
    /**
     * Convert light type string to an engine-compatible light type.
     */
    getLightType(type) {
        switch (type) {
            case 'NATURAL_SUNLIGHT': return 'directional';
            case 'LIGHT_SHAFT': return 'spot';
            case 'TORCH':
            case 'BIOLUMINESCENT_FUNGI':
            case 'CRYSTAL_GLOW':
            case 'MAGICAL_LIGHT':
            default:
                return 'point';
        }
    }
    
    /**
     * Position camera at the dungeon entrance for a good starting view.
     */
    positionCameraAtEntrance() {
        if (!this.engine.camera || !this.currentDungeon || !this.currentDungeon.entrance) return;
        
        const entrancePos = this.currentDungeon.entrance.position;
        
        // Position camera slightly above and behind the entrance, looking at it.
        const cameraPos = entrancePos.add(new Vector3(0, 5, 15));
        
        this.engine.camera.position.copy(cameraPos);
        this.engine.camera.setTarget(entrancePos);
    }
    
    /**
     * Get generation statistics for display in the UI.
     */
    getStats() {
        if (!this.currentDungeon || !this.currentDungeon.stats) {
            return { rooms: 0, connections: 0, generationTime: 0 };
        }
        
        return {
            rooms: this.currentDungeon.stats.roomCount,
            connections: this.currentDungeon.stats.connectionCount,
            natural: this.currentDungeon.stats.naturalRooms,
            manMade: this.currentDungeon.stats.manMadeRooms,
            waterBodies: this.currentDungeon.environment?.waterBodies.length || 0,
            lightSources: this.currentDungeon.environment?.lightSources.length || 0,
            generationTime: this.currentDungeon.stats.generationTime
        };
    }
    
    /**
     * Update loop for the dungeon scene (e.g., for animations).
     */
    update(deltaTime) {
        // Placeholder for future updates like flickering lights, water animation, etc.
    }
    
    /**
     * Clean up all resources used by the current dungeon scene.
     */
    dispose() {
        if (this.dungeonGroup) {
            this.scene.removeChild(this.dungeonGroup);
            this.dungeonGroup = null;
        }
        this.currentDungeon = null;
    }
}