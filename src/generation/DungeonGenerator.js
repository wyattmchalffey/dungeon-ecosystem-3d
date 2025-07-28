/**
 * DungeonGenerator - Main procedural dungeon generation system
 * Creates hybrid natural/man-made cave systems with ecosystem support
 */

import { Vector3 } from '../math/Vector3.js';
import { DungeonLayout } from './DungeonLayout.js';
import { RoomGenerator } from './RoomGenerator.js';
import { ConnectionGenerator } from './ConnectionGenerator.js';
import { GeometryGenerator } from './GeometryGenerator.js';
import { EnvironmentalPlacer } from './EnvironmentalPlacer.js';

export class DungeonGenerator {
    constructor() {
        this.layout = new DungeonLayout();
        this.roomGenerator = new RoomGenerator();
        this.connectionGenerator = new ConnectionGenerator();
        this.geometryGenerator = new GeometryGenerator();
        this.environmentalPlacer = new EnvironmentalPlacer();
        
        // Generation statistics
        this.stats = {
            generationTime: 0,
            roomCount: 0,
            connectionCount: 0,
            naturalRooms: 0,
            manMadeRooms: 0
        };
    }
    
    /**
     * Generate a complete dungeon
     * @param {Object} config - Generation configuration
     * @returns {Dungeon} Complete dungeon with geometry and environment
     */
    async generate(config = {}) {
        const startTime = performance.now();
        
        // Default configuration
        const defaultConfig = {
            seed: Date.now(),
            maxRooms: 30,
            maxDepth: 10,
            branchingFactor: 2.5,
            naturalCaveRatio: 0.6,
            waterProbability: 0.3,
            entranceType: 'AUTO',
            difficulty: 'medium',
            theme: 'mixed' // 'natural', 'ruins', 'mixed'
        };
        
        config = { ...defaultConfig, ...config };
        
        // Initialize random seed
        this.initializeRandom(config.seed);
        
        console.log(`🏔️ Generating dungeon with seed: ${config.seed}`);
        
        try {
            // Phase 1: Create entrance and spatial layout
            console.log('📍 Phase 1: Creating entrance and layout...');
            const entrance = this.createEntrance(config);
            const layoutData = await this.generateLayout(entrance, config);
            
            // Phase 2: Classify regions and generate rooms
            console.log('🏛️ Phase 2: Classifying regions and generating rooms...');
            const regions = this.classifyRegions(layoutData, config);
            const rooms = await this.roomGenerator.generateRooms(regions, config);
            
            // Phase 3: Create connection network
            console.log('🔗 Phase 3: Creating connection network...');
            const connections = await this.connectionGenerator.generateConnections(rooms, config);
            
            // Phase 4: Generate 3D geometry
            console.log('📐 Phase 4: Generating 3D geometry...');
            const geometry = await this.geometryGenerator.generateGeometry({
                rooms: rooms,
                connections: connections
            }, config);
            
            // Phase 5: Place environmental features
            console.log('🌊 Phase 5: Placing environmental features...');
            const environment = await this.environmentalPlacer.placeEnvironment(
                geometry,
                { rooms, connections },
                config
            );
            
            // Update statistics
            this.updateStats(rooms, connections, performance.now() - startTime);
            
            // Create final dungeon object
            const dungeon = {
                config: config,
                entrance: entrance,
                layout: layoutData,
                rooms: rooms,
                connections: connections,
                geometry: geometry,
                environment: environment,
                stats: { ...this.stats },
                bounds: this.calculateBounds(rooms)
            };
            
            console.log(`✅ Dungeon generated in ${this.stats.generationTime}ms`);
            console.log(`   Rooms: ${this.stats.roomCount} (${this.stats.naturalRooms} natural, ${this.stats.manMadeRooms} man-made)`);
            console.log(`   Connections: ${this.stats.connectionCount}`);
            
            return dungeon;
            
        } catch (error) {
            console.error('❌ Dungeon generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize seeded random number generator
     */
    initializeRandom(seed) {
        // Simple seedable RNG (replace with better one if needed)
        this.rngSeed = seed;
        this.random = () => {
            this.rngSeed = (this.rngSeed * 9301 + 49297) % 233280;
            return this.rngSeed / 233280;
        };
    }
    
    /**
     * Create dungeon entrance
     */
    createEntrance(config) {
        const entranceTypes = {
            CAVE_MOUTH: {
                name: 'Natural Cave Entrance',
                shape: 'organic',
                size: { 
                    width: 8 + this.random() * 7,
                    height: 6 + this.random() * 4,
                    depth: 4 + this.random() * 4
                },
                features: ['stalactites', 'weathering', 'light_gradient'],
                style: 'NATURAL'
            },
            RUINS_ENTRANCE: {
                name: 'Ancient Ruins Entrance',
                shape: 'architectural',
                size: {
                    width: 6 + this.random() * 4,
                    height: 8 + this.random() * 4,
                    depth: 4 + this.random() * 2
                },
                features: ['columns', 'carved_doorway', 'broken_stairs'],
                style: 'MAN_MADE'
            },
            SINKHOLE: {
                name: 'Collapsed Sinkhole',
                shape: 'circular',
                size: {
                    radius: 5 + this.random() * 5,
                    depth: 10 + this.random() * 10
                },
                features: ['spiral_path', 'vegetation', 'rubble'],
                style: 'NATURAL'
            }
        };
        
        // Select entrance type
        let entranceType;
        if (config.entranceType === 'AUTO') {
            const types = Object.keys(entranceTypes);
            entranceType = types[Math.floor(this.random() * types.length)];
        } else {
            entranceType = config.entranceType;
        }
        
        const entrance = {
            id: 'entrance_0',
            type: entranceType,
            position: new Vector3(0, 0, 0),
            depth: 0,
            ...entranceTypes[entranceType],
            connections: [],
            environment: {
                lightLevel: 1.0,
                temperature: 20,
                humidity: 40
            }
        };
        
        console.log(`   Created ${entrance.name}`);
        
        return entrance;
    }
    
    /**
     * Generate spatial layout using growth algorithm
     */
    async generateLayout(entrance, config) {
        this.layout.clear();
        this.layout.addNode(entrance, 0);
        
        const growthQueue = [{ node: entrance, depth: 0 }];
        const processedNodes = new Set([entrance.id]);
        
        while (growthQueue.length > 0 && this.layout.nodeCount < config.maxRooms) {
            const { node, depth } = growthQueue.shift();
            
            if (depth >= config.maxDepth) continue;
            
            // Calculate branching based on depth
            const branchCount = this.calculateBranching(depth, config);
            
            for (let i = 0; i < branchCount; i++) {
                // Generate new node position
                const direction = this.selectGrowthDirection(node, this.layout, depth);
                const distance = this.calculateNodeDistance(depth, config);
                const position = node.position.add(direction.multiply(distance));
                
                // Create new node
                const newNode = {
                    id: `node_${this.layout.nodeCount}`,
                    position: position,
                    depth: depth + 1,
                    parent: node.id,
                    connections: []
                };
                
                // Validate placement
                if (this.isValidPlacement(newNode, this.layout, config)) {
                    this.layout.addNode(newNode, depth + 1);
                    this.layout.addConnection(node.id, newNode.id);
                    
                    // Add to growth queue
                    if (depth + 1 < config.maxDepth) {
                        growthQueue.push({ node: newNode, depth: depth + 1 });
                    }
                }
            }
        }
        
        return this.layout.getData();
    }
    
    /**
     * Calculate branching factor based on depth
     */
    calculateBranching(depth, config) {
        // Less branching as we go deeper
        const baseBranching = config.branchingFactor;
        const depthFactor = Math.exp(-depth * 0.15);
        const randomFactor = 0.5 + this.random() * 0.5;
        
        let branches = Math.floor(baseBranching * depthFactor * randomFactor);
        
        // Ensure at least one path continues (unless at max depth)
        if (depth < config.maxDepth - 1) {
            branches = Math.max(1, branches);
        }
        
        return branches;
    }
    
    /**
     * Select growth direction with downward bias
     */
    selectGrowthDirection(node, layout, depth) {
        // Stronger downward bias as we go deeper
        const downwardBias = -0.3 - (depth * 0.08);
        
        // Generate weighted random direction
        let direction = new Vector3(
            (this.random() - 0.5) * 2,
            downwardBias + (this.random() - 0.5) * 0.5,
            (this.random() - 0.5) * 2
        );
        
        // Avoid existing nodes
        const nearbyNodes = layout.getNodesInRadius(node.position, 20);
        for (const nearby of nearbyNodes) {
            if (nearby.id !== node.id) {
                const avoidance = node.position.subtract(nearby.position).normalize();
                direction = direction.add(avoidance.multiply(0.3));
            }
        }
        
        return direction.normalize();
    }
    
    /**
     * Calculate distance between nodes based on depth
     */
    calculateNodeDistance(depth, config) {
        const baseDistance = 15;
        const depthVariation = depth * 2; // Rooms get farther apart deeper
        const randomVariation = (this.random() - 0.5) * 10;
        
        return baseDistance + depthVariation + randomVariation;
    }
    
    /**
     * Validate node placement
     */
    isValidPlacement(node, layout, config) {
        // Check minimum distance from other nodes
        const nearbyNodes = layout.getNodesInRadius(node.position, 12);
        if (nearbyNodes.length > 0) {
            return false;
        }
        
        // Check bounds (optional)
        const maxDistance = config.maxDepth * 30;
        if (node.position.length() > maxDistance) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Classify regions as natural or man-made
     */
    classifyRegions(layoutData, config) {
        const regions = [];
        
        for (const node of layoutData.nodes) {
            // Factors affecting classification
            const depth = node.depth;
            const connectivity = layoutData.getConnections(node.id).length;
            
            // Calculate natural cave probability
            let naturalProbability = config.naturalCaveRatio;
            
            // Natural caves more common at mid-depths
            naturalProbability += 0.3 * Math.sin((depth / config.maxDepth) * Math.PI);
            
            // Less connected areas more likely to be natural
            naturalProbability += 0.2 * (1 - connectivity / 4);
            
            // Random factor
            const isNatural = this.random() < naturalProbability;
            
            const region = {
                node: node,
                style: isNatural ? 'NATURAL' : 'MAN_MADE',
                type: this.selectRoomType(node, isNatural, config),
                properties: {
                    depth: depth,
                    connectivity: connectivity
                }
            };
            
            regions.push(region);
        }
        
        // Smooth regions to create coherent areas
        this.smoothRegions(regions, layoutData);
        
        return regions;
    }
    
    /**
     * Select appropriate room type based on depth and style
     */
    selectRoomType(node, isNatural, config) {
        const depth = node.depth;
        const depthCategory = Math.min(4, Math.floor(depth / 2));
        
        const roomTypes = {
            natural: [
                ['ENTRANCE_CAVE', 'NATURAL_CHAMBER'],
                ['NATURAL_CHAMBER', 'WATER_CAVE'],
                ['CRYSTAL_CAVE', 'MUSHROOM_GROVE', 'DEEP_CAVE'],
                ['UNDERGROUND_LAKE', 'LAVA_TUBES', 'DEEP_CAVE'],
                ['ABYSS_CHAMBER', 'CRYSTAL_CATHEDRAL', 'MONSTER_DEN']
            ],
            manMade: [
                ['ENTRANCE_HALL', 'GUARD_ROOM'],
                ['STORAGE_ROOM', 'LIVING_QUARTERS', 'WORKSHOP'],
                ['TEMPLE', 'LIBRARY', 'ARMORY'],
                ['CRYPT', 'TREASURE_VAULT', 'RITUAL_CHAMBER'],
                ['ANCIENT_VAULT', 'FORGOTTEN_SANCTUM', 'SEALED_TOMB']
            ]
        };
        
        const typeList = isNatural ? roomTypes.natural : roomTypes.manMade;
        const availableTypes = typeList[depthCategory];
        
        return availableTypes[Math.floor(this.random() * availableTypes.length)];
    }
    
    /**
     * Smooth regions to create coherent areas
     */
    smoothRegions(regions, layoutData) {
        // Simple smoothing: if most neighbors are different style, switch
        for (let i = 0; i < 2; i++) { // Two passes
            for (const region of regions) {
                const connections = layoutData.getConnections(region.node.id);
                let naturalCount = 0;
                let manMadeCount = 0;
                
                for (const connId of connections) {
                    const connRegion = regions.find(r => r.node.id === connId);
                    if (connRegion) {
                        if (connRegion.style === 'NATURAL') naturalCount++;
                        else manMadeCount++;
                    }
                }
                
                // Switch if surrounded by opposite type
                if (naturalCount > manMadeCount * 2 && region.style === 'MAN_MADE') {
                    region.style = 'NATURAL';
                    region.type = this.selectRoomType(region.node, true, layoutData.config);
                } else if (manMadeCount > naturalCount * 2 && region.style === 'NATURAL') {
                    region.style = 'MAN_MADE';
                    region.type = this.selectRoomType(region.node, false, layoutData.config);
                }
            }
        }
    }
    
    /**
     * Update generation statistics
     */
    updateStats(rooms, connections, generationTime) {
        this.stats.generationTime = Math.round(generationTime);
        this.stats.roomCount = rooms.length;
        this.stats.connectionCount = connections.length;
        this.stats.naturalRooms = rooms.filter(r => r.style === 'NATURAL').length;
        this.stats.manMadeRooms = rooms.filter(r => r.style === 'MAN_MADE').length;
    }
    
    /**
     * Calculate dungeon bounds
     */
    calculateBounds(rooms) {
        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);
        
        for (const room of rooms) {
            const pos = room.position;
            const size = room.size || 10; // Estimate
            
            min.x = Math.min(min.x, pos.x - size);
            min.y = Math.min(min.y, pos.y - size);
            min.z = Math.min(min.z, pos.z - size);
            
            max.x = Math.max(max.x, pos.x + size);
            max.y = Math.max(max.y, pos.y + size);
            max.z = Math.max(max.z, pos.z + size);
        }
        
        return { min, max };
    }
}