/**
 * ConnectionGenerator - Creates tunnels and corridors between rooms
 * Handles pathfinding, connection styles, and doorway placement
 */

import { Vector3 } from '../math/Vector3.js';
import { MathUtils } from '../math/MathUtils.js';

export class ConnectionGenerator {
    constructor() {
        this.connectionStyles = {
            NATURAL_TUNNEL: {
                width: [2, 4],
                height: [2.5, 4],
                irregularity: 0.3,
                curvature: 0.4,
                features: ['rock_formations', 'water_drips']
            },
            CARVED_CORRIDOR: {
                width: [2.5, 3.5],
                height: [3, 4],
                irregularity: 0.05,
                curvature: 0.1,
                features: ['support_beams', 'torch_brackets']
            },
            TRANSITIONAL: {
                width: [2, 3.5],
                height: [2.5, 3.5],
                irregularity: 0.15,
                curvature: 0.25,
                features: ['partial_carving', 'mixed_surfaces']
            }
        };
    }
    
    /**
     * Generate all connections between rooms
     */
    async generateConnections(rooms, config) {
        console.log(`   Generating connections for ${rooms.length} rooms...`);
        
        const connections = [];
        
        // First, create minimum spanning tree to ensure connectivity
        const mstEdges = this.calculateMinimumSpanningTree(rooms);
        
        // Create primary connections from MST
        for (const edge of mstEdges) {
            const connection = await this.createConnection(
                rooms.find(r => r.id === edge.from),
                rooms.find(r => r.id === edge.to),
                'PRIMARY',
                config
            );
            connections.push(connection);
        }
        
        // Add additional connections for interesting loops
        const additionalEdges = this.selectAdditionalConnections(rooms, mstEdges, config);
        
        for (const edge of additionalEdges) {
            const connection = await this.createConnection(
                rooms.find(r => r.id === edge.from),
                rooms.find(r => r.id === edge.to),
                'SECONDARY',
                config
            );
            connections.push(connection);
        }
        
        console.log(`   Created ${connections.length} connections`);
        
        return connections;
    }
    
    /**
     * Calculate minimum spanning tree using Prim's algorithm
     */
    calculateMinimumSpanningTree(rooms) {
        if (rooms.length < 2) return [];
        
        const edges = [];
        const visited = new Set();
        const unvisited = new Set(rooms.map(r => r.id));
        
        // Start from entrance
        const start = rooms.find(r => r.depth === 0) || rooms[0];
        visited.add(start.id);
        unvisited.delete(start.id);
        
        while (unvisited.size > 0) {
            let minEdge = null;
            let minWeight = Infinity;
            
            // Find minimum edge from visited to unvisited
            for (const visitedId of visited) {
                const visitedRoom = rooms.find(r => r.id === visitedId);
                
                for (const unvisitedId of unvisited) {
                    const unvisitedRoom = rooms.find(r => r.id === unvisitedId);
                    const distance = visitedRoom.position.distance(unvisitedRoom.position);
                    
                    if (distance < minWeight) {
                        minWeight = distance;
                        minEdge = {
                            from: visitedId,
                            to: unvisitedId,
                            weight: distance
                        };
                    }
                }
            }
            
            if (minEdge) {
                edges.push(minEdge);
                visited.add(minEdge.to);
                unvisited.delete(minEdge.to);
            } else {
                break; // No more connections possible
            }
        }
        
        return edges;
    }
    
    /**
     * Select additional connections for loops and alternate paths
     */
    selectAdditionalConnections(rooms, mstEdges, config) {
        const additionalEdges = [];
        const existingConnections = new Set();
        
        // Track existing connections
        for (const edge of mstEdges) {
            existingConnections.add(`${edge.from}-${edge.to}`);
            existingConnections.add(`${edge.to}-${edge.from}`);
        }
        
        // Consider all possible connections
        for (let i = 0; i < rooms.length; i++) {
            for (let j = i + 1; j < rooms.length; j++) {
                const roomA = rooms[i];
                const roomB = rooms[j];
                const key = `${roomA.id}-${roomB.id}`;
                
                if (!existingConnections.has(key)) {
                    const distance = roomA.position.distance(roomB.position);
                    
                    // Add connection if it meets criteria
                    if (this.shouldAddConnection(roomA, roomB, distance, config)) {
                        additionalEdges.push({
                            from: roomA.id,
                            to: roomB.id,
                            weight: distance
                        });
                        existingConnections.add(key);
                        existingConnections.add(`${roomB.id}-${roomA.id}`);
                    }
                }
            }
        }
        
        // Limit additional connections
        const maxAdditional = Math.floor(rooms.length * 0.3);
        return additionalEdges
            .sort((a, b) => a.weight - b.weight)
            .slice(0, maxAdditional);
    }
    
    /**
     * Determine if an additional connection should be added
     */
    shouldAddConnection(roomA, roomB, distance, config) {
        // Don't connect if too far
        if (distance > 30) return false;
        
        // Prefer connecting rooms at similar depths
        const depthDiff = Math.abs(roomA.depth - roomB.depth);
        if (depthDiff > 2) return false;
        
        // Prefer connecting special rooms
        const specialTypes = ['TEMPLE', 'TREASURE_VAULT', 'CRYSTAL_CAVE', 'UNDERGROUND_LAKE'];
        const isSpecial = specialTypes.includes(roomA.type) || specialTypes.includes(roomB.type);
        
        // Base probability
        let probability = 0.2;
        
        // Increase for special rooms
        if (isSpecial) probability += 0.3;
        
        // Decrease for depth difference
        probability -= depthDiff * 0.1;
        
        // Decrease for distance
        probability -= (distance / 30) * 0.2;
        
        return Math.random() < probability;
    }
    
    /**
     * Create a connection between two rooms
     */
    async createConnection(roomA, roomB, priority, config) {
        const style = this.determineConnectionStyle(roomA, roomB);
        const styleData = this.connectionStyles[style];
        
        // Calculate connection properties
        const width = MathUtils.randomRange(styleData.width[0], styleData.width[1]);
        const height = MathUtils.randomRange(styleData.height[0], styleData.height[1]);
        
        // Generate path
        const path = await this.generatePath(roomA, roomB, style, config);
        
        // Create connection object
        const connection = {
            id: `conn_${roomA.id}_${roomB.id}`,
            rooms: [roomA.id, roomB.id],
            priority: priority,
            style: style,
            path: path,
            width: width,
            height: height,
            length: this.calculatePathLength(path),
            features: this.generateConnectionFeatures(styleData, path.length),
            doorways: {
                [roomA.id]: this.calculateDoorway(roomA, path[0], path[1]),
                [roomB.id]: this.calculateDoorway(roomB, path[path.length - 1], path[path.length - 2])
            }
        };
        
        // Update room connections
        this.updateRoomConnections(roomA, roomB, connection);
        
        return connection;
    }
    
    /**
     * Determine connection style based on room types
     */
    determineConnectionStyle(roomA, roomB) {
        if (roomA.style === 'NATURAL' && roomB.style === 'NATURAL') {
            return 'NATURAL_TUNNEL';
        } else if (roomA.style === 'MAN_MADE' && roomB.style === 'MAN_MADE') {
            return 'CARVED_CORRIDOR';
        } else {
            return 'TRANSITIONAL';
        }
    }
    
    /**
     * Generate path between rooms
     */
    async generatePath(roomA, roomB, style, config) {
        const start = roomA.position;
        const end = roomB.position;
        
        switch (style) {
            case 'NATURAL_TUNNEL':
                return this.generateOrganicPath(start, end);
            case 'CARVED_CORRIDOR':
                return this.generateCarvedPath(start, end);
            case 'TRANSITIONAL':
                return this.generateTransitionalPath(start, end);
            default:
                return [start, end];
        }
    }
    
    /**
     * Generate organic tunnel path
     */
    generateOrganicPath(start, end) {
        const path = [start.clone()];
        const distance = start.distance(end);
        const segments = Math.max(3, Math.floor(distance / 5));
        
        // Generate control points with noise
        const controlPoints = [];
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const basePoint = start.lerp(end, t);
            
            // Add organic variation
            const offset = new Vector3(
                (Math.random() - 0.5) * distance * 0.2,
                (Math.random() - 0.5) * distance * 0.1,
                (Math.random() - 0.5) * distance * 0.2
            );
            
            controlPoints.push(basePoint.add(offset));
        }
        
        // Create smooth curve through control points
        for (let i = 0; i < controlPoints.length; i++) {
            const prev = i === 0 ? start : controlPoints[i - 1];
            const curr = controlPoints[i];
            const next = i === controlPoints.length - 1 ? end : controlPoints[i + 1];
            
            // Catmull-Rom spline interpolation
            const subSegments = 5;
            for (let j = 1; j < subSegments; j++) {
                const t = j / subSegments;
                const point = this.catmullRomInterpolate(prev, curr, next, t);
                path.push(point);
            }
        }
        
        path.push(end.clone());
        
        return path;
    }
    
    /**
     * Generate carved corridor path
     */
    generateCarvedPath(start, end) {
        const path = [start.clone()];
        const direction = end.subtract(start);
        const distance = direction.length();
        
        // Carved corridors are mostly straight with minimal turns
        if (distance < 15) {
            // Direct connection for short distances
            path.push(end.clone());
        } else {
            // Add one or two turns for longer distances
            const turnCount = distance > 25 ? 2 : 1;
            
            for (let i = 1; i <= turnCount; i++) {
                const t = i / (turnCount + 1);
                const basePoint = start.lerp(end, t);
                
                // Small offset perpendicular to main direction
                const perpendicular = new Vector3(-direction.z, 0, direction.x).normalize();
                const offset = perpendicular.multiply((Math.random() - 0.5) * 5);
                
                path.push(basePoint.add(offset));
            }
            
            path.push(end.clone());
        }
        
        return path;
    }
    
    /**
     * Generate transitional path (mix of natural and carved)
     */
    generateTransitionalPath(start, end) {
        const path = [start.clone()];
        const distance = start.distance(end);
        const segments = Math.floor(distance / 6);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const basePoint = start.lerp(end, t);
            
            // Vary between organic and straight sections
            const isOrganic = Math.random() > 0.5;
            const variation = isOrganic ? 0.15 : 0.05;
            
            const offset = new Vector3(
                (Math.random() - 0.5) * distance * variation,
                (Math.random() - 0.5) * distance * variation * 0.5,
                (Math.random() - 0.5) * distance * variation
            );
            
            path.push(basePoint.add(offset));
        }
        
        path.push(end.clone());
        
        return path;
    }
    
    /**
     * Catmull-Rom spline interpolation
     */
    catmullRomInterpolate(p0, p1, p2, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        const v0 = p1;
        const v1 = p2.subtract(p0).multiply(0.5);
        const v2 = p2.subtract(p1).multiply(3).subtract(p2.subtract(p0).multiply(1.5));
        const v3 = p2.subtract(p1).multiply(-2).add(p2.subtract(p0).multiply(0.5));
        
        return v0.add(v1.multiply(t)).add(v2.multiply(t2)).add(v3.multiply(t3));
    }
    
    /**
     * Calculate path length
     */
    calculatePathLength(path) {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            length += path[i - 1].distance(path[i]);
        }
        return length;
    }
    
    /**
     * Generate connection features
     */
    generateConnectionFeatures(styleData, pathLength) {
        const features = [];
        const featureCount = Math.floor(pathLength / 10);
        
        for (let i = 0; i < featureCount; i++) {
            const t = (i + 1) / (featureCount + 1);
            
            for (const featureType of styleData.features) {
                if (Math.random() < 0.3) {
                    features.push({
                        type: featureType,
                        position: t, // Position along path (0-1)
                        variant: Math.floor(Math.random() * 3)
                    });
                }
            }
        }
        
        return features;
    }
    
    /**
     * Calculate doorway properties
     */
    calculateDoorway(room, connectionPoint, nextPoint) {
        // Calculate doorway direction
        const direction = nextPoint.subtract(connectionPoint).normalize();
        
        // Find best wall for doorway
        const localPos = connectionPoint.subtract(room.position);
        
        let wall = 'north';
        const absX = Math.abs(localPos.x);
        const absZ = Math.abs(localPos.z);
        
        if (absX > absZ) {
            wall = localPos.x > 0 ? 'east' : 'west';
        } else {
            wall = localPos.z > 0 ? 'south' : 'north';
        }
        
        return {
            wall: wall,
            localPosition: localPos,
            direction: direction,
            width: 2 + Math.random(),
            height: 2.5 + Math.random() * 0.5,
            style: room.style === 'NATURAL' ? 'rough' : 'carved'
        };
    }
    
    /**
     * Update room connection data
     */
    updateRoomConnections(roomA, roomB, connection) {
        roomA.connections.push({
            targetRoom: roomB.id,
            connectionId: connection.id,
            doorway: connection.doorways[roomA.id]
        });
        
        roomB.connections.push({
            targetRoom: roomA.id,
            connectionId: connection.id,
            doorway: connection.doorways[roomB.id]
        });
    }
}
            