/**
 * GeometryBuilder - Utilities for creating procedural 3D geometry
 */

import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';

export class GeometryBuilder {

    /**
     * Applies a transformation matrix to a geometry's vertices and normals.
     */
    static transformGeometry(geometry, matrix) {
        if (!geometry || !matrix) return;

        // Transform vertices
        for (let i = 0; i < geometry.vertices.length; i += 3) {
            const vec = new Vector3(geometry.vertices[i], geometry.vertices[i + 1], geometry.vertices[i + 2]);
            // Use the transformVector3 method from your Matrix4 class
            const transformedVec = matrix.transformVector3(vec);
            geometry.vertices[i] = transformedVec.x;
            geometry.vertices[i + 1] = transformedVec.y;
            geometry.vertices[i + 2] = transformedVec.z;
        }

        // To correctly transform normals, we need the inverse transpose of the matrix
        if (geometry.normals) {
            // --- THIS IS THE CORRECTED LOGIC USING YOUR FILE'S METHODS ---
            const normalMatrix = new Matrix4()
                .copy(matrix)
                .invertInPlace()      // Use the in-place version for chaining
                .transposeInPlace();  // Use the in-place version for chaining
            // -----------------------------------------------------------

            for (let i = 0; i < geometry.normals.length; i += 3) {
                const vec = new Vector3(geometry.normals[i], geometry.normals[i + 1], geometry.normals[i + 2]);
                // Use the direction transform method, which ignores translation
                const transformedVec = normalMatrix.transformVector3Direction(vec).normalize();
                geometry.normals[i] = transformedVec.x;
                geometry.normals[i + 1] = transformedVec.y;
                geometry.normals[i + 2] = transformedVec.z;
            }
        }

        return geometry;
    }

    /**
     * Create a box geometry
     */
    static createBox(width = 1, height = 1, depth = 1) {
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;
        const vertices = [
            -hw,-hh,hd,  hw,-hh,hd,  hw,hh,hd, -hw,hh,hd, // Front
            hw,-hh,-hd, -hw,-hh,-hd, -hw,hh,-hd,  hw,hh,-hd, // Back
            -hw,hh,hd,  hw,hh,hd,  hw,hh,-hd, -hw,hh,-hd, // Top
            -hw,-hh,-hd, hw,-hh,-hd,  hw,-hh,hd, -hw,-hh,hd, // Bottom
            hw,-hh,hd,  hw,-hh,-hd,  hw,hh,-hd,  hw,hh,hd, // Right
            -hw,-hh,-hd, -hw,-hh,hd,  -hw,hh,hd, -hw,hh,-hd, // Left
        ];
        const normals = [
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
            0,1,0, 0,1,0, 0,1,0, 0,1,0,
            0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
            1,0,0, 1,0,0, 1,0,0, 1,0,0,
            -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        ];
        const indices = [
            0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11,
            12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23,
        ];
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            indices: new Uint16Array(indices),
        };
    }
    
    /**
     * Create a plane geometry
     */
    static createPlane(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        const vertices = []; const normals = []; const indices = [];
        for (let y = 0; y <= heightSegments; y++) {
            for (let x = 0; x <= widthSegments; x++) {
                vertices.push((x/widthSegments - 0.5) * width, 0, (y/heightSegments - 0.5) * height);
                normals.push(0, 1, 0);
            }
        }
        for (let y = 0; y < heightSegments; y++) {
            for (let x = 0; x < widthSegments; x++) {
                const a = x + (widthSegments + 1) * y;
                const b = x + (widthSegments + 1) * (y + 1);
                const c = (x + 1) + (widthSegments + 1) * (y + 1);
                const d = (x + 1) + (widthSegments + 1) * y;
                indices.push(a, b, d, b, c, d);
            }
        }
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            indices: new Uint16Array(indices),
        };
    }

    /**
     * Create rectangular walls with actual thickness.
     */
    static createRectangularWalls(width, height, length) {
        const wallThickness = 0.5;
        const walls = [];

        const northWall = this.createBox(width + wallThickness, height, wallThickness);
        this.translateGeometry(northWall, 0, height / 2, -length / 2);
        walls.push(northWall);

        const southWall = this.createBox(width + wallThickness, height, wallThickness);
        this.translateGeometry(southWall, 0, height / 2, length / 2);
        walls.push(southWall);

        const eastWall = this.createBox(wallThickness, height, length - wallThickness);
        this.translateGeometry(eastWall, width / 2, height / 2, 0);
        walls.push(eastWall);

        const westWall = this.createBox(wallThickness, height, length - wallThickness);
        this.translateGeometry(westWall, -width / 2, height / 2, 0);
        walls.push(westWall);

        return this.mergeGeometries(walls);
    }
    
    /**
     * Create icosphere for organic shapes
     */
    static createIcosphere(radius = 1, subdivisions = 1) {
        const t = (1 + Math.sqrt(5)) / 2;
        let baseVertices = [
             new Vector3(-1, t, 0), new Vector3(1, t, 0), new Vector3(-1, -t, 0), new Vector3(1, -t, 0),
             new Vector3(0, -1, t), new Vector3(0, 1, t), new Vector3(0, -1, -t), new Vector3(0, 1, -t),
             new Vector3(t, 0, -1), new Vector3(t, 0, 1), new Vector3(-t, 0, -1), new Vector3(-t, 0, 1)
        ];
        baseVertices.forEach(v => v.normalize());

        let faces = [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
            [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
            [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
            [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
        ];

        const midpointCache = new Map();
        for (let i = 0; i < subdivisions; i++) {
            const faces2 = [];
            for (const tri of faces) {
                const v1 = this.getMiddlePoint(tri[0], tri[1], baseVertices, midpointCache);
                const v2 = this.getMiddlePoint(tri[1], tri[2], baseVertices, midpointCache);
                const v3 = this.getMiddlePoint(tri[2], tri[0], baseVertices, midpointCache);
                faces2.push([tri[0], v1, v3], [tri[1], v2, v1], [tri[2], v3, v2], [v1, v2, v3]);
            }
            faces = faces2;
        }

        const geometry = {
            vertices: new Float32Array(baseVertices.flatMap(v => v.multiply(radius).toArray())),
            indices: new Uint16Array(faces.flat()),
        };
        this.calculateNormals(geometry);
        return geometry;
    }

    static getMiddlePoint(p1, p2, vertices, cache) {
        const key = Math.min(p1, p2) + "_" + Math.max(p1, p2);
        if (cache.has(key)) return cache.get(key);
        const middle = vertices[p1].add(vertices[p2]).normalize();
        const index = vertices.length;
        vertices.push(middle);
        cache.set(key, index);
        return index;
    }

    /**
     * Calculate normals from vertices and indices
     */
    static calculateNormals(geometry) {
        const { vertices, indices } = geometry;
        const normals = new Float32Array(vertices.length);
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i], i2 = indices[i+1], i3 = indices[i+2];
            const v1 = new Vector3(vertices[i1*3], vertices[i1*3+1], vertices[i1*3+2]);
            const v2 = new Vector3(vertices[i2*3], vertices[i2*3+1], vertices[i2*3+2]);
            const v3 = new Vector3(vertices[i3*3], vertices[i3*3+1], vertices[i3*3+2]);
            const faceNormal = v2.subtract(v1).cross(v3.subtract(v1)).normalize();
            for (const index of [i1, i2, i3]) {
                normals[index*3] += faceNormal.x;
                normals[index*3+1] += faceNormal.y;
                normals[index*3+2] += faceNormal.z;
            }
        }
        for (let i = 0; i < normals.length; i+=3) {
            const n = new Vector3(normals[i], normals[i+1], normals[i+2]).normalize();
            normals[i] = n.x; normals[i+1] = n.y; normals[i+2] = n.z;
        }
        geometry.normals = normals;
    }

    /**
     * Helper function to translate geometry vertices.
     */
    static translateGeometry(geometry, x, y, z) {
        const matrix = Matrix4.translation(new Vector3(x, y, z));
        this.transformGeometry(geometry, matrix);
    }

    /**
     * Merge multiple geometries into one
     */
    static mergeGeometries(geometries) {
        let totalVertices = 0, totalIndices = 0;
        geometries.forEach(geo => { if(geo) { totalVertices += geo.vertices.length; totalIndices += geo.indices.length; }});
        const merged = { vertices: new Float32Array(totalVertices), normals: new Float32Array(totalVertices), indices: new Uint16Array(totalIndices) };
        let vertexOffset = 0, indexOffset = 0, vertexCount = 0;
        geometries.forEach(geo => {
            if (geo) {
                merged.vertices.set(geo.vertices, vertexOffset);
                if (geo.normals) merged.normals.set(geo.normals, vertexOffset);
                for (let i = 0; i < geo.indices.length; i++) { merged.indices[indexOffset + i] = geo.indices[i] + vertexCount; }
                vertexOffset += geo.vertices.length; indexOffset += geo.indices.length; vertexCount += geo.vertices.length / 3;
            }
        });
        return merged;
    }
}