/**
 * GeometryBuilder - Utilities for creating procedural 3D geometry
 * Essential for Phase 3 dungeon generation
 */

import { Vector3 } from '../math/Vector3.js';

export class GeometryBuilder {
    /**
     * Create a box geometry
     */
    static createBox(width = 1, height = 1, depth = 1, segments = 1) {
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;
        
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        // Helper to add a face
        const addFace = (a, b, c, d, normal, materialIndex = 0) => {
            const vertexOffset = vertices.length / 3;
            
            // Add vertices
            vertices.push(...a, ...b, ...c, ...d);
            
            // Add normals
            for (let i = 0; i < 4; i++) {
                normals.push(...normal);
            }
            
            // Add texture coordinates
            texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
            
            // Add indices (two triangles)
            indices.push(
                vertexOffset, vertexOffset + 1, vertexOffset + 2,
                vertexOffset, vertexOffset + 2, vertexOffset + 3
            );
        };
        
        // Front face
        addFace(
            [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd],
            [0, 0, 1]
        );
        
        // Back face
        addFace(
            [hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd],
            [0, 0, -1]
        );
        
        // Top face
        addFace(
            [-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd],
            [0, 1, 0]
        );
        
        // Bottom face
        addFace(
            [-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd],
            [0, -1, 0]
        );
        
        // Right face
        addFace(
            [hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd],
            [1, 0, 0]
        );
        
        // Left face
        addFace(
            [-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd],
            [-1, 0, 0]
        );
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            type: 'box'
        };
    }
    
    /**
     * Create a plane geometry
     */
    static createPlane(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        const hw = width / 2;
        const hh = height / 2;
        
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        // Generate vertices
        for (let y = 0; y <= heightSegments; y++) {
            const v = y / heightSegments;
            
            for (let x = 0; x <= widthSegments; x++) {
                const u = x / widthSegments;
                
                vertices.push(
                    (u - 0.5) * width,
                    0,
                    (v - 0.5) * height
                );
                
                normals.push(0, 1, 0);
                texCoords.push(u, v);
            }
        }
        
        // Generate indices
        for (let y = 0; y < heightSegments; y++) {
            for (let x = 0; x < widthSegments; x++) {
                const a = x + (widthSegments + 1) * y;
                const b = x + (widthSegments + 1) * (y + 1);
                const c = (x + 1) + (widthSegments + 1) * (y + 1);
                const d = (x + 1) + (widthSegments + 1) * y;
                
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            type: 'plane'
        };
    }
    
    /**
     * Create dungeon room geometry
     */
    static createDungeonRoom(width, height, depth, options = {}) {
        const {
            wallThickness = 0.5,
            doorways = [], // Array of {wall: 'north'|'south'|'east'|'west', position: 0.5, width: 2}
            floorSegments = 4,
            wallSegments = 2,
            includeFloor = true,
            includeCeiling = true
        } = options;
        
        const geometries = [];
        
        // Create floor
        if (includeFloor) {
            const floor = this.createPlane(width, depth, floorSegments, floorSegments);
            floor.name = 'floor';
            geometries.push(floor);
        }
        
        // Create ceiling
        if (includeCeiling) {
            const ceiling = this.createPlane(width, depth, floorSegments, floorSegments);
            // Rotate and position ceiling
            for (let i = 0; i < ceiling.vertices.length; i += 3) {
                ceiling.vertices[i + 1] = height;
                ceiling.normals[i + 1] = -1; // Point downward
            }
            ceiling.name = 'ceiling';
            geometries.push(ceiling);
        }
        
        // Create walls
        const walls = {
            north: { pos: [0, height/2, -depth/2], rot: [0, 0, 0], size: [width, height] },
            south: { pos: [0, height/2, depth/2], rot: [0, Math.PI, 0], size: [width, height] },
            east: { pos: [width/2, height/2, 0], rot: [0, Math.PI/2, 0], size: [depth, height] },
            west: { pos: [-width/2, height/2, 0], rot: [0, -Math.PI/2, 0], size: [depth, height] }
        };
        
        // Create each wall with doorway cutouts
        for (const [wallName, wallData] of Object.entries(walls)) {
            const doorway = doorways.find(d => d.wall === wallName);
            
            if (doorway) {
                // Create wall with doorway
                const wallGeo = this.createWallWithDoorway(
                    wallData.size[0],
                    wallData.size[1],
                    wallThickness,
                    doorway
                );
                wallGeo.name = `wall_${wallName}`;
                wallGeo.position = wallData.pos;
                wallGeo.rotation = wallData.rot;
                geometries.push(wallGeo);
            } else {
                // Create solid wall
                const wall = this.createBox(wallData.size[0], wallData.size[1], wallThickness);
                wall.name = `wall_${wallName}`;
                wall.position = wallData.pos;
                wall.rotation = wallData.rot;
                geometries.push(wall);
            }
        }
        
        return {
            geometries: geometries,
            bounds: { width, height, depth },
            type: 'dungeonRoom'
        };
    }
    
    /**
     * Create wall with doorway cutout
     */
    static createWallWithDoorway(width, height, thickness, doorway) {
        const { position = 0.5, width: doorWidth = 2, height: doorHeight = 3 } = doorway;
        
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        // Calculate doorway position
        const doorX = (position - 0.5) * width;
        const doorLeft = doorX - doorWidth / 2;
        const doorRight = doorX + doorWidth / 2;
        const doorTop = doorHeight;
        
        // Helper to add a quad
        const addQuad = (v1, v2, v3, v4, normal) => {
            const vertexOffset = vertices.length / 3;
            
            vertices.push(...v1, ...v2, ...v3, ...v4);
            for (let i = 0; i < 4; i++) {
                normals.push(...normal);
            }
            texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
            
            indices.push(
                vertexOffset, vertexOffset + 1, vertexOffset + 2,
                vertexOffset, vertexOffset + 2, vertexOffset + 3
            );
        };
        
        const hw = width / 2;
        const hh = height / 2;
        const ht = thickness / 2;
        
        // Left wall section
        if (doorLeft > -hw) {
            addQuad(
                [-hw, -hh, ht], [doorLeft, -hh, ht],
                [doorLeft, hh, ht], [-hw, hh, ht],
                [0, 0, 1]
            );
        }
        
        // Right wall section
        if (doorRight < hw) {
            addQuad(
                [doorRight, -hh, ht], [hw, -hh, ht],
                [hw, hh, ht], [doorRight, hh, ht],
                [0, 0, 1]
            );
        }
        
        // Top section above door
        if (doorTop < height) {
            addQuad(
                [doorLeft, doorTop - hh, ht], [doorRight, doorTop - hh, ht],
                [doorRight, hh, ht], [doorLeft, hh, ht],
                [0, 0, 1]
            );
        }
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            type: 'wallWithDoorway'
        };
    }
    
    /**
     * Create a cylinder (for pillars, stalactites, etc.)
     */
    static createCylinder(radiusTop = 1, radiusBottom = 1, height = 2, segments = 8) {
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        const halfHeight = height / 2;
        
        // Generate vertices
        for (let y = 0; y <= 1; y++) {
            const radius = y === 0 ? radiusBottom : radiusTop;
            const yPos = y === 0 ? -halfHeight : halfHeight;
            
            for (let x = 0; x <= segments; x++) {
                const angle = (x / segments) * Math.PI * 2;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                
                vertices.push(cos * radius, yPos, sin * radius);
                normals.push(cos, 0, sin);
                texCoords.push(x / segments, y);
            }
        }
        
        // Generate side indices
        for (let x = 0; x < segments; x++) {
            const a = x;
            const b = x + segments + 1;
            const c = x + segments + 2;
            const d = x + 1;
            
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            type: 'cylinder'
        };
    }
    
    /**
     * Create irregular rock formation
     */
    static createRock(size = 1, irregularity = 0.3, subdivisions = 2) {
        // Start with icosphere
        const geometry = this.createIcosphere(size, subdivisions);
        
        // Add noise to vertices for irregularity
        for (let i = 0; i < geometry.vertices.length; i += 3) {
            const x = geometry.vertices[i];
            const y = geometry.vertices[i + 1];
            const z = geometry.vertices[i + 2];
            
            // Simple noise function
            const noise = (Math.random() - 0.5) * irregularity;
            const length = Math.sqrt(x * x + y * y + z * z);
            const scale = (length + noise) / length;
            
            geometry.vertices[i] *= scale;
            geometry.vertices[i + 1] *= scale;
            geometry.vertices[i + 2] *= scale;
        }
        
        // Recalculate normals
        this.calculateNormals(geometry);
        
        geometry.type = 'rock';
        return geometry;
    }
    
    /**
     * Create icosphere for organic shapes
     */
    static createIcosphere(radius = 1, subdivisions = 2) {
        const t = (1 + Math.sqrt(5)) / 2; // Golden ratio
        
        // Initial vertices of icosahedron
        let vertices = [
            -1,  t,  0,    1,  t,  0,   -1, -t,  0,    1, -t,  0,
             0, -1,  t,    0,  1,  t,    0, -1, -t,    0,  1, -t,
             t,  0, -1,    t,  0,  1,   -t,  0, -1,   -t,  0,  1
        ];
        
        // Normalize vertices
        for (let i = 0; i < vertices.length; i += 3) {
            const length = Math.sqrt(
                vertices[i] * vertices[i] +
                vertices[i + 1] * vertices[i + 1] +
                vertices[i + 2] * vertices[i + 2]
            );
            vertices[i] = vertices[i] / length * radius;
            vertices[i + 1] = vertices[i + 1] / length * radius;
            vertices[i + 2] = vertices[i + 2] / length * radius;
        }
        
        // Initial faces of icosahedron
        let indices = [
            0,11,5,  0,5,1,  0,1,7,  0,7,10,  0,10,11,
            1,5,9,  5,11,4,  11,10,2,  10,7,6,  7,1,8,
            3,9,4,  3,4,2,  3,2,6,  3,6,8,  3,8,9,
            4,9,5,  2,4,11,  6,2,10,  8,6,7,  9,8,1
        ];
        
        // Subdivide
        for (let i = 0; i < subdivisions; i++) {
            const newIndices = [];
            const midpointCache = new Map();
            
            for (let j = 0; j < indices.length; j += 3) {
                const v1 = indices[j];
                const v2 = indices[j + 1];
                const v3 = indices[j + 2];
                
                const a = this.getMiddlePoint(v1, v2, vertices, midpointCache, radius);
                const b = this.getMiddlePoint(v2, v3, vertices, midpointCache, radius);
                const c = this.getMiddlePoint(v3, v1, vertices, midpointCache, radius);
                
                newIndices.push(v1, a, c);
                newIndices.push(v2, b, a);
                newIndices.push(v3, c, b);
                newIndices.push(a, b, c);
            }
            
            indices = newIndices;
        }
        
        // Generate normals (for sphere, normal = position normalized)
        const normals = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const length = Math.sqrt(
                vertices[i] * vertices[i] +
                vertices[i + 1] * vertices[i + 1] +
                vertices[i + 2] * vertices[i + 2]
            );
            normals.push(
                vertices[i] / length,
                vertices[i + 1] / length,
                vertices[i + 2] / length
            );
        }
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(vertices.length / 3 * 2), // Placeholder
            indices: new Uint16Array(indices),
            type: 'icosphere'
        };
    }
    
    /**
     * Helper to get midpoint for subdivision
     */
    static getMiddlePoint(p1, p2, vertices, cache, radius) {
        const key = p1 < p2 ? `${p1}_${p2}` : `${p2}_${p1}`;
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const v1 = [vertices[p1 * 3], vertices[p1 * 3 + 1], vertices[p1 * 3 + 2]];
        const v2 = [vertices[p2 * 3], vertices[p2 * 3 + 1], vertices[p2 * 3 + 2]];
        
        const middle = [
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ];
        
        // Normalize to sphere surface
        const length = Math.sqrt(middle[0] * middle[0] + middle[1] * middle[1] + middle[2] * middle[2]);
        middle[0] = middle[0] / length * radius;
        middle[1] = middle[1] / length * radius;
        middle[2] = middle[2] / length * radius;
        
        const index = vertices.length / 3;
        vertices.push(...middle);
        
        cache.set(key, index);
        return index;
    }
    
    /**
     * Calculate normals from vertices and indices
     */
    static calculateNormals(geometry) {
        const vertices = geometry.vertices;
        const indices = geometry.indices;
        const normals = new Float32Array(vertices.length);
        
        // Calculate face normals and accumulate
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i] * 3;
            const i2 = indices[i + 1] * 3;
            const i3 = indices[i + 2] * 3;
            
            const v1 = new Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
            const v2 = new Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
            const v3 = new Vector3(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
            
            const edge1 = v2.subtract(v1);
            const edge2 = v3.subtract(v1);
            const faceNormal = edge1.cross(edge2).normalize();
            
            // Add to vertex normals
            normals[i1] += faceNormal.x;
            normals[i1 + 1] += faceNormal.y;
            normals[i1 + 2] += faceNormal.z;
            
            normals[i2] += faceNormal.x;
            normals[i2 + 1] += faceNormal.y;
            normals[i2 + 2] += faceNormal.z;
            
            normals[i3] += faceNormal.x;
            normals[i3 + 1] += faceNormal.y;
            normals[i3 + 2] += faceNormal.z;
        }
        
        // Normalize vertex normals
        for (let i = 0; i < normals.length; i += 3) {
            const length = Math.sqrt(
                normals[i] * normals[i] +
                normals[i + 1] * normals[i + 1] +
                normals[i + 2] * normals[i + 2]
            );
            
            if (length > 0) {
                normals[i] /= length;
                normals[i + 1] /= length;
                normals[i + 2] /= length;
            }
        }
        
        geometry.normals = normals;
    }
    
    /**
     * Merge multiple geometries into one
     */
    static mergeGeometries(geometries) {
        let totalVertices = 0;
        let totalIndices = 0;
        
        // Count totals
        for (const geo of geometries) {
            totalVertices += geo.vertices.length;
            totalIndices += geo.indices.length;
        }
        
        // Allocate arrays
        const vertices = new Float32Array(totalVertices);
        const normals = new Float32Array(totalVertices);
        const texCoords = new Float32Array(totalVertices / 3 * 2);
        const indices = new Uint16Array(totalIndices);
        
        let vertexOffset = 0;
        let indexOffset = 0;
        let vertexCount = 0;
        
        // Merge geometries
        for (const geo of geometries) {
            // Copy vertices
            vertices.set(geo.vertices, vertexOffset);
            normals.set(geo.normals, vertexOffset);
            
            // Copy texture coordinates if available
            if (geo.texCoords) {
                texCoords.set(geo.texCoords, vertexOffset / 3 * 2);
            }
            
            // Copy indices with offset
            for (let i = 0; i < geo.indices.length; i++) {
                indices[indexOffset + i] = geo.indices[i] + vertexCount;
            }
            
            vertexOffset += geo.vertices.length;
            indexOffset += geo.indices.length;
            vertexCount += geo.vertices.length / 3;
        }
        
        return {
            vertices,
            normals,
            texCoords,
            indices,
            type: 'merged'
        };
    }
} 