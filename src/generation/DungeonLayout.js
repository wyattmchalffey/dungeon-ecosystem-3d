/**
 * DungeonLayout - Spatial graph for dungeon structure
 * Manages nodes, connections, and spatial queries
 */

import { Vector3 } from '../math/Vector3.js';

export class DungeonLayout {
    constructor() {
        this.nodes = new Map();
        this.connections = new Map(); // Adjacency list
        this.depthLayers = new Map(); // Nodes organized by depth
        this.bounds = { min: null, max: null };
        this.nodeCount = 0;
    }
    
    /**
     * Clear all data
     */
    clear() {
        this.nodes.clear();
        this.connections.clear();
        this.depthLayers.clear();
        this.bounds = { min: null, max: null };
        this.nodeCount = 0;
    }
    
    /**
     * Add a node to the layout
     */
    addNode(node, depth) {
        this.nodes.set(node.id, node);
        this.connections.set(node.id, []);
        
        // Add to depth layer
        if (!this.depthLayers.has(depth)) {
            this.depthLayers.set(depth, []);
        }
        this.depthLayers.get(depth).push(node.id);
        
        // Update bounds
        this.updateBounds(node.position);
        
        this.nodeCount++;
        
        return node;
    }
    
    /**
     * Add connection between two nodes
     */
    addConnection(nodeIdA, nodeIdB) {
        if (!this.nodes.has(nodeIdA) || !this.nodes.has(nodeIdB)) {
            throw new Error(`Invalid node IDs: ${nodeIdA}, ${nodeIdB}`);
        }
        
        // Add to adjacency lists (bidirectional)
        if (!this.connections.get(nodeIdA).includes(nodeIdB)) {
            this.connections.get(nodeIdA).push(nodeIdB);
        }
        if (!this.connections.get(nodeIdB).includes(nodeIdA)) {
            this.connections.get(nodeIdB).push(nodeIdA);
        }
        
        // Update node connection arrays
        const nodeA = this.nodes.get(nodeIdA);
        const nodeB = this.nodes.get(nodeIdB);
        
        if (!nodeA.connections.includes(nodeIdB)) {
            nodeA.connections.push(nodeIdB);
        }
        if (!nodeB.connections.includes(nodeIdA)) {
            nodeB.connections.push(nodeIdA);
        }
    }
    
    /**
     * Get all nodes within radius of a position
     */
    getNodesInRadius(position, radius) {
        const results = [];
        const radiusSquared = radius * radius;
        
        for (const node of this.nodes.values()) {
            const distSquared = position.distanceSquared(node.position);
            if (distSquared <= radiusSquared) {
                results.push(node);
            }
        }
        
        return results;
    }
    
    /**
     * Get all connections for a node
     */
    getConnections(nodeId) {
        return this.connections.get(nodeId) || [];
    }
    
    /**
     * Get nodes at specific depth
     */
    getNodesAtDepth(depth) {
        const nodeIds = this.depthLayers.get(depth) || [];
        return nodeIds.map(id => this.nodes.get(id));
    }
    
    /**
     * Find shortest path between two nodes (A* algorithm)
     */
    findPath(startId, endId) {
        if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
            return null;
        }
        
        const start = this.nodes.get(startId);
        const end = this.nodes.get(endId);
        
        const openSet = new Set([startId]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(startId, 0);
        
        const fScore = new Map();
        fScore.set(startId, this.heuristic(start, end));
        
        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = null;
            let lowestF = Infinity;
            
            for (const nodeId of openSet) {
                const f = fScore.get(nodeId) || Infinity;
                if (f < lowestF) {
                    lowestF = f;
                    current = nodeId;
                }
            }
            
            if (current === endId) {
                // Reconstruct path
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.delete(current);
            
            // Check neighbors
            for (const neighbor of this.getConnections(current)) {
                const currentNode = this.nodes.get(current);
                const neighborNode = this.nodes.get(neighbor);
                
                const tentativeGScore = gScore.get(current) + 
                    currentNode.position.distance(neighborNode.position);
                
                if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighborNode, end));
                    openSet.add(neighbor);
                }
            }
        }
        
        return null; // No path found
    }
    
    /**
     * Heuristic function for A*
     */
    heuristic(nodeA, nodeB) {
        return nodeA.position.distance(nodeB.position);
    }
    
    /**
     * Reconstruct path from A* search
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        
        return path;
    }
    
    /**
     * Check if all nodes are reachable from entrance
     */
    validateConnectivity() {
        if (this.nodeCount === 0) return true;
        
        const entrance = this.nodes.get('entrance_0');
        if (!entrance) return false;
        
        const visited = new Set();
        const queue = [entrance.id];
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            
            visited.add(current);
            
            for (const neighbor of this.getConnections(current)) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
        }
        
        return visited.size === this.nodeCount;
    }
    
    /**
     * Get minimum spanning tree (for ensuring connectivity)
     */
    getMinimumSpanningTree() {
        if (this.nodeCount < 2) return [];
        
        const edges = [];
        const visited = new Set();
        
        // Start from entrance
        const start = 'entrance_0';
        visited.add(start);
        
        // Prim's algorithm
        while (visited.size < this.nodeCount) {
            let minEdge = null;
            let minWeight = Infinity;
            
            // Find minimum edge from visited to unvisited
            for (const visitedId of visited) {
                const visitedNode = this.nodes.get(visitedId);
                
                for (const [nodeId, node] of this.nodes) {
                    if (!visited.has(nodeId)) {
                        const weight = visitedNode.position.distance(node.position);
                        
                        if (weight < minWeight) {
                            minWeight = weight;
                            minEdge = { from: visitedId, to: nodeId, weight };
                        }
                    }
                }
            }
            
            if (minEdge) {
                edges.push(minEdge);
                visited.add(minEdge.to);
            } else {
                break; // No more connections possible
            }
        }
        
        return edges;
    }
    
    /**
     * Update spatial bounds
     */
    updateBounds(position) {
        if (!this.bounds.min) {
            this.bounds.min = position.clone();
            this.bounds.max = position.clone();
        } else {
            this.bounds.min.x = Math.min(this.bounds.min.x, position.x);
            this.bounds.min.y = Math.min(this.bounds.min.y, position.y);
            this.bounds.min.z = Math.min(this.bounds.min.z, position.z);
            
            this.bounds.max.x = Math.max(this.bounds.max.x, position.x);
            this.bounds.max.y = Math.max(this.bounds.max.y, position.y);
            this.bounds.max.z = Math.max(this.bounds.max.z, position.z);
        }
    }
    
    /**
     * Get layout statistics
     */
    getStats() {
        const depthStats = new Map();
        
        for (const [depth, nodes] of this.depthLayers) {
            depthStats.set(depth, nodes.length);
        }
        
        let totalConnections = 0;
        for (const connections of this.connections.values()) {
            totalConnections += connections.length;
        }
        
        return {
            nodeCount: this.nodeCount,
            connectionCount: totalConnections / 2, // Each connection counted twice
            maxDepth: Math.max(...this.depthLayers.keys()),
            depthDistribution: depthStats,
            bounds: this.bounds,
            isConnected: this.validateConnectivity()
        };
    }
    
    /**
     * Export layout data
     */
    getData() {
        return {
            nodes: Array.from(this.nodes.values()),
            connections: Array.from(this.connections.entries()).map(([id, conns]) => ({
                nodeId: id,
                connections: conns
            })),
            stats: this.getStats(),
            getConnections: (nodeId) => this.getConnections(nodeId),
            findPath: (startId, endId) => this.findPath(startId, endId),
            getNodesInRadius: (pos, radius) => this.getNodesInRadius(pos, radius)
        };
    }
    
    /**
     * Debug visualization data
     */
    getDebugVisualization() {
        const nodes = [];
        const edges = [];
        
        // Convert nodes for visualization
        for (const node of this.nodes.values()) {
            nodes.push({
                id: node.id,
                position: node.position.toArray(),
                depth: node.depth,
                label: `D${node.depth}`
            });
        }
        
        // Convert edges for visualization
        const processedEdges = new Set();
        
        for (const [nodeId, connections] of this.connections) {
            for (const targetId of connections) {
                const edgeKey = [nodeId, targetId].sort().join('-');
                
                if (!processedEdges.has(edgeKey)) {
                    processedEdges.add(edgeKey);
                    
                    const nodeA = this.nodes.get(nodeId);
                    const nodeB = this.nodes.get(targetId);
                    
                    edges.push({
                        from: nodeId,
                        to: targetId,
                        fromPos: nodeA.position.toArray(),
                        toPos: nodeB.position.toArray()
                    });
                }
            }
        }
        
        return { nodes, edges };
    }
}