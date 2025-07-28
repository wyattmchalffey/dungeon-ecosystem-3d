/**
 * GeometryGenerator - Converts dungeon data to 3D geometry
 * FINAL COMPLETE VERSION - Correctly uses the GeometryBuilder for all generation.
 */

import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { GeometryBuilder } from '../rendering/GeometryBuilder.js';
import { SimplexNoise } from './SimplexNoise.js';

export class GeometryGenerator {
    constructor() {
        this.noise = new SimplexNoise();
        this.materials = {
            CAVE_ROCK: { color: [0.4, 0.35, 0.3], roughness: 0.9 },
            CARVED_STONE: { color: [0.5, 0.48, 0.45], roughness: 0.7 },
            ANCIENT_STONE: { color: [0.35, 0.32, 0.3], roughness: 0.8 },
        };
    }

    async generateGeometry(dungeonData, config) {
        const geometrySystem = { rooms: new Map(), connections: new Map(), optimized: null, materials: this.materials };

        for (const room of dungeonData.rooms) {
            const roomGeometry = this.generateRoomGeometry(room);
            if (roomGeometry) geometrySystem.rooms.set(room.id, roomGeometry);
        }

        if (config.optimizeGeometry !== false) {
            geometrySystem.optimized = this.optimizeGeometry(geometrySystem.rooms, dungeonData);
        }

        return geometrySystem;
    }

    /**
     * Bakes the world transform of each room into its geometry before merging.
     */
    optimizeGeometry(roomGeometries, dungeonData) {
        console.log('   Optimizing geometry by merging meshes...');
        const geometryByMaterial = new Map();

        for (const [roomId, roomGeo] of roomGeometries) {
            const room = dungeonData.rooms.find(r => r.id === roomId);
            if (!room) continue;

            const material = roomGeo.material || 'CAVE_ROCK';
            if (!geometryByMaterial.has(material)) {
                geometryByMaterial.set(material, []);
            }
            
            const transformMatrix = Matrix4.translation(room.position);
            
            const components = [roomGeo.floor, roomGeo.walls, roomGeo.ceiling].filter(Boolean);
            for(const component of components) {
                const transformedComponent = { ...component, vertices: component.vertices.slice(), normals: component.normals.slice() };
                GeometryBuilder.transformGeometry(transformedComponent, transformMatrix);
                geometryByMaterial.get(material).push(transformedComponent);
            }
        }
        
        const optimized = new Map();
        for (const [material, geometries] of geometryByMaterial) {
            if (geometries.length > 0) {
                optimized.set(material, GeometryBuilder.mergeGeometries(geometries));
            }
        }

        console.log(`   Optimized to ${optimized.size} final meshes.`);
        return optimized;
    }
    
    generateRoomGeometry(room) {
        if (room.style === 'NATURAL') {
            return this.generateNaturalCaveGeometry(room);
        } else {
            return this.generateManMadeRoomGeometry(room);
        }
    }

    generateNaturalCaveGeometry(room) {
        const radius = room.size.radius || 10;
        const caveGeo = GeometryBuilder.createIcosphere(radius, 2);
        for (let i = 0; i < caveGeo.vertices.length; i+=3) {
            const x = caveGeo.vertices[i], y = caveGeo.vertices[i+1], z = caveGeo.vertices[i+2];
            const noise = 1 + (this.noise.noise3D(x*0.1, y*0.1, z*0.1) * 0.4);
            caveGeo.vertices[i] *= noise;
            caveGeo.vertices[i+1] *= noise;
            caveGeo.vertices[i+2] *= noise;
            if (caveGeo.vertices[i+1] < 0) caveGeo.vertices[i+1] = 0;
        }
        GeometryBuilder.calculateNormals(caveGeo);
        // Flip normals to be visible from the inside
        for (let i = 0; i < caveGeo.normals.length; i++) { caveGeo.normals[i] *= -1; }

        return { walls: caveGeo, material: 'CAVE_ROCK' };
    }

    generateManMadeRoomGeometry(room) {
        return this.createArchitecturalShape(room);
    }

    createArchitecturalShape(room) {
        const shape = room.template?.baseShape || 'rectangular';
        switch (shape) {
            case 'rectangular':
            default:
                return this.createRectangularRoom(room);
        }
    }
    
    createRectangularRoom(room) {
        const width = room.size.width || 10;
        const height = room.size.height || 8;
        const length = room.size.length || 15;

        const floor = GeometryBuilder.createPlane(width, length, 4, 4);
        const ceiling = GeometryBuilder.createPlane(width, length, 4, 4);
        
        GeometryBuilder.translateGeometry(ceiling, 0, height, 0);
        for (let i = 0; i < ceiling.normals.length; i+=3) { ceiling.normals[i+1] *= -1; }
        for (let i = 0; i < ceiling.indices.length; i += 3) { [ceiling.indices[i+1], ceiling.indices[i+2]] = [ceiling.indices[i+2], ceiling.indices[i+1]]; }
        
        const walls = GeometryBuilder.createRectangularWalls(width, height, length);

        return { floor, walls, ceiling, material: 'CARVED_STONE' };
    }
}