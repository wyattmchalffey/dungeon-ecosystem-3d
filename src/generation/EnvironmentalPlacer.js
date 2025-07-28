/**
 * EnvironmentalPlacer - Places water, temperature zones, and ecosystem features
 * Critical for making dungeons suitable for life simulation
 */

import { Vector3 } from '../math/Vector3.js';
import { MathUtils } from '../math/MathUtils.js';

export class EnvironmentalPlacer {
    constructor() {
        this.waterFlowSimulator = new WaterFlowSimulator();
        this.temperatureCalculator = new TemperatureCalculator();
        this.lightCalculator = new LightCalculator();
        this.organicPlacer = new OrganicMatterPlacer();
    }
    
    /**
     * Place all environmental features in the dungeon
     */
    async placeEnvironment(geometrySystem, dungeonData, config) {
        console.log('   Placing environmental features...');
        
        const environment = {
            waterBodies: [],
            waterFlow: [],
            temperatureZones: [],
            lightSources: [],
            lightMap: null,
            organicDeposits: [],
            airFlow: [],
            atmosphericEffects: []
        };
        
        // Place water features based on room types and depth
        environment.waterBodies = await this.placeWaterFeatures(dungeonData, config);
        
        // Simulate water flow between connected water bodies
        environment.waterFlow = await this.waterFlowSimulator.simulateFlow(
            environment.waterBodies,
            dungeonData.connections
        );
        
        // Calculate temperature distribution
        environment.temperatureZones = await this.temperatureCalculator.calculateZones(
            dungeonData,
            environment.waterBodies
        );
        
        // Place and calculate light sources
        environment.lightSources = await this.placeLightSources(dungeonData, config);
        environment.lightMap = await this.lightCalculator.calculateLightMap(
            environment.lightSources,
            dungeonData
        );
        
        // Distribute organic matter based on moisture and light
        environment.organicDeposits = await this.organicPlacer.placeOrganicMatter(
            dungeonData,
            environment.waterBodies,
            environment.lightMap
        );
        
        // Calculate air flow patterns
        environment.airFlow = await this.calculateAirFlow(dungeonData);
        
        // Add atmospheric effects
        environment.atmosphericEffects = this.createAtmosphericEffects(
            dungeonData,
            environment
        );
        
        console.log(`   Placed ${environment.waterBodies.length} water bodies`);
        console.log(`   Placed ${environment.lightSources.length} light sources`);
        console.log(`   Placed ${environment.organicDeposits.length} organic deposits`);
        
        return environment;
    }
    
    /**
     * Place water features throughout the dungeon
     */
    async placeWaterFeatures(dungeonData, config) {
        const waterFeatures = [];
        
        for (const room of dungeonData.rooms) {
            const waterProbability = this.calculateWaterProbability(room);
            
            if (Math.random() < waterProbability) {
                const waterFeature = {
                    id: `water_${room.id}`,
                    roomId: room.id,
                    type: this.selectWaterType(room),
                    coverage: this.calculateWaterCoverage(room),
                    depth: this.calculateWaterDepth(room),
                    position: room.position.clone(),
                    volume: 0, // Calculated later
                    properties: {
                        temperature: Math.max(5, room.environment.temperature - 3),
                        clarity: this.calculateWaterClarity(room),
                        mineralContent: room.depth * 0.05,
                        flow: 'STILL', // Updated by flow simulator
                        ph: 6.5 + Math.random() * 2
                    },
                    connections: [] // Filled by flow simulator
                };
                
                // Calculate volume
                const roomArea = this.estimateRoomArea(room);
                waterFeature.volume = roomArea * waterFeature.coverage * waterFeature.depth;
                
                waterFeatures.push(waterFeature);
                
                // Update room humidity
                room.environment.humidity = Math.min(100, 
                    room.environment.humidity + waterFeature.coverage * 30
                );
            }
        }
        
        return waterFeatures;
    }
    
    /**
     * Calculate probability of water in a room
     */
    calculateWaterProbability(room) {
        const typeProb = {
            WATER_CAVE: 0.95,
            UNDERGROUND_LAKE: 0.98,
            NATURAL_CHAMBER: 0.3,
            CRYSTAL_CAVE: 0.4,
            MUSHROOM_GROVE: 0.6,
            TEMPLE: 0.2,
            CRYPT: 0.1,
            NATURAL_CAVE: 0.35
        };
        
        let probability = typeProb[room.type] || 0.15;
        
        // Increase with depth (water table)
        const depthFactor = Math.min(1, room.depth / 8);
        probability += (1 - probability) * depthFactor * 0.3;
        
        // Decrease if man-made (except temples with pools)
        if (room.style === 'MAN_MADE' && room.type !== 'TEMPLE') {
            probability *= 0.5;
        }
        
        return probability;
    }
    
    /**
     * Select appropriate water type for room
     */
    selectWaterType(room) {
        if (room.type === 'UNDERGROUND_LAKE') return 'LAKE';
        if (room.type === 'WATER_CAVE') return 'FLOWING_STREAM';
        if (room.style === 'MAN_MADE') return 'ARTIFICIAL_POOL';
        
        const types = ['POOL', 'PUDDLES', 'STREAM'];
        const weights = [0.5, 0.3, 0.2];
        
        // Streams more likely with multiple connections
        if (room.connections.length > 2) {
            weights[2] += 0.3;
            weights[0] -= 0.2;
        }
        
        return types[MathUtils.randomWeighted(weights)];
    }
    
    /**
     * Calculate water coverage in room
     */
    calculateWaterCoverage(room) {
        const baseCoverage = {
            UNDERGROUND_LAKE: 0.8,
            WATER_CAVE: 0.5,
            NATURAL_CHAMBER: 0.2,
            ARTIFICIAL_POOL: 0.15
        };
        
        const base = baseCoverage[room.type] || 0.1;
        const variation = Math.random() * 0.3;
        
        return MathUtils.clamp(base + variation, 0.05, 0.9);
    }
    
    /**
     * Calculate water depth
     */
    calculateWaterDepth(room) {
        if (room.type === 'UNDERGROUND_LAKE') {
            return 2 + Math.random() * 8; // Deep lakes
        }
        
        const baseDepth = 0.3 + Math.random() * 1.5;
        
        // Deeper at lower levels
        const depthBonus = room.depth * 0.1;
        
        return baseDepth + depthBonus;
    }
    
    /**
     * Calculate water clarity
     */
    calculateWaterClarity(room) {
        // Stagnant water is less clear
        if (room.connections.length === 1) {
            return 0.1 + Math.random() * 0.3;
        }
        
        // Flowing water is clearer
        if (room.connections.length > 2) {
            return 0.6 + Math.random() * 0.3;
        }
        
        return 0.3 + Math.random() * 0.4;
    }
    
    /**
     * Estimate room area for volume calculations
     */
    estimateRoomArea(room) {
        if (room.size.radius) {
            return Math.PI * room.size.radius * room.size.radius;
        } else if (room.size.width && room.size.length) {
            return room.size.width * room.size.length;
        }
        
        return 100; // Default estimate
    }
    
    /**
     * Place light sources throughout dungeon
     */
    async placeLightSources(dungeonData, config) {
        const lightSources = [];
        
        // Natural light from entrance
        const entrance = dungeonData.rooms.find(r => r.depth === 0);
        if (entrance) {
            lightSources.push({
                id: 'natural_light_entrance',
                type: 'NATURAL_SUNLIGHT',
                position: entrance.position.clone(),
                intensity: 1.0,
                color: [1, 0.95, 0.8],
                attenuation: {
                    constant: 1,
                    linear: 0.05,
                    quadratic: 0.01
                },
                range: 40,
                castsRays: true
            });
            
            // Light shafts in rooms near entrance
            for (const room of dungeonData.rooms) {
                if (room.depth === 1 && room.style === 'NATURAL' && Math.random() < 0.3) {
                    lightSources.push({
                        id: `light_shaft_${room.id}`,
                        type: 'LIGHT_SHAFT',
                        position: room.position.clone().add(new Vector3(0, room.size.height, 0)),
                        intensity: 0.5,
                        color: [1, 0.95, 0.8],
                        attenuation: {
                            constant: 1,
                            linear: 0.1,
                            quadratic: 0.02
                        },
                        range: 20,
                        angle: Math.PI / 6
                    });
                }
            }
        }
        
        // Bioluminescent features in deep caves
        for (const room of dungeonData.rooms) {
            if (room.style === 'NATURAL' && room.depth > 3) {
                const bioChance = 0.2 + (room.depth - 3) * 0.1;
                
                if (Math.random() < bioChance) {
                    // Glowing fungi
                    if (room.type === 'MUSHROOM_GROVE' || Math.random() < 0.3) {
                        const count = 3 + Math.floor(Math.random() * 5);
                        for (let i = 0; i < count; i++) {
                            const offset = new Vector3(
                                (Math.random() - 0.5) * room.size.radius,
                                0,
                                (Math.random() - 0.5) * room.size.radius
                            );
                            
                            lightSources.push({
                                id: `bio_fungi_${room.id}_${i}`,
                                type: 'BIOLUMINESCENT_FUNGI',
                                position: room.position.clone().add(offset),
                                intensity: 0.1 + Math.random() * 0.1,
                                color: [0.2, 0.8, 0.4],
                                attenuation: {
                                    constant: 1,
                                    linear: 0.5,
                                    quadratic: 0.1
                                },
                                range: 8,
                                flicker: true,
                                flickerSpeed: 0.1
                            });
                        }
                    }
                    
                    // Glowing crystals
                    if (room.type === 'CRYSTAL_CAVE' || Math.random() < 0.2) {
                        lightSources.push({
                            id: `crystal_glow_${room.id}`,
                            type: 'CRYSTAL_GLOW',
                            position: room.position.clone(),
                            intensity: 0.3,
                            color: [0.4, 0.6, 0.9],
                            attenuation: {
                                constant: 1,
                                linear: 0.2,
                                quadratic: 0.05
                            },
                            range: 15,
                            pulse: true,
                            pulseSpeed: 0.5
                        });
                    }
                }
            }
            
            // Man-made light sources
            if (room.style === 'MAN_MADE') {
                const torchCount = Math.floor(room.size.width / 5) || 2;
                
                for (let i = 0; i < torchCount; i++) {
                    const t = i / torchCount;
                    const pos = this.getTorchPosition(room, t);
                    
                    // Some torches are extinguished
                    const lit = Math.random() > 0.3 - (room.depth * 0.05);
                    
                    if (lit) {
                        lightSources.push({
                            id: `torch_${room.id}_${i}`,
                            type: 'TORCH',
                            position: pos.add(new Vector3(0, 2.5, 0)),
                            intensity: 0.4,
                            color: [1, 0.6, 0.2],
                            attenuation: {
                                constant: 1,
                                linear: 0.3,
                                quadratic: 0.1
                            },
                            range: 10,
                            flicker: true,
                            flickerSpeed: 0.3,
                            flickerIntensity: 0.1
                        });
                    }
                }
                
                // Special room lighting
                if (room.type === 'TEMPLE' && Math.random() < 0.7) {
                    lightSources.push({
                        id: `sacred_light_${room.id}`,
                        type: 'MAGICAL_LIGHT',
                        position: room.position.clone().add(new Vector3(0, room.size.height * 0.8, 0)),
                        intensity: 0.6,
                        color: [0.8, 0.8, 1],
                        attenuation: {
                            constant: 1,
                            linear: 0.1,
                            quadratic: 0.02
                        },
                        range: 20,
                        pulse: true
                    });
                }
            }
        }
        
        return lightSources;
    }
    
    /**
     * Get torch position along room perimeter
     */
    getTorchPosition(room, t) {
        const width = room.size.width || room.size.radius * 2;
        const length = room.size.length || room.size.radius * 2;
        const hw = width / 2;
        const hl = length / 2;
        
        let localPos;
        if (t < 0.25) {
            localPos = new Vector3(MathUtils.lerp(-hw, hw, t * 4), 0, -hl);
        } else if (t < 0.5) {
            localPos = new Vector3(hw, 0, MathUtils.lerp(-hl, hl, (t - 0.25) * 4));
        } else if (t < 0.75) {
            localPos = new Vector3(MathUtils.lerp(hw, -hw, (t - 0.5) * 4), 0, hl);
        } else {
            localPos = new Vector3(-hw, 0, MathUtils.lerp(hl, -hl, (t - 0.75) * 4));
        }
        
        return room.position.clone().add(localPos);
    }
    
    /**
     * Calculate air flow patterns
     */
    async calculateAirFlow(dungeonData) {
        const airFlows = [];
        
        // Air flows from entrance deeper into dungeon
        const entrance = dungeonData.rooms.find(r => r.depth === 0);
        if (!entrance) return airFlows;
        
        // Simple flow model: air flows along connections from low to high depth
        for (const connection of dungeonData.connections) {
            const roomA = dungeonData.rooms.find(r => r.id === connection.rooms[0]);
            const roomB = dungeonData.rooms.find(r => r.id === connection.rooms[1]);
            
            if (roomA && roomB) {
                const depthDiff = roomB.depth - roomA.depth;
                
                if (depthDiff !== 0) {
                    const flowDirection = depthDiff > 0 ? 
                        roomB.position.subtract(roomA.position).normalize() :
                        roomA.position.subtract(roomB.position).normalize();
                    
                    airFlows.push({
                        connectionId: connection.id,
                        from: depthDiff > 0 ? roomA.id : roomB.id,
                        to: depthDiff > 0 ? roomB.id : roomA.id,
                        direction: flowDirection,
                        strength: Math.abs(depthDiff) * 0.3,
                        crossSection: connection.width * connection.height
                    });
                }
            }
        }
        
        return airFlows;
    }
    
    /**
     * Create atmospheric effects based on environment
     */
    createAtmosphericEffects(dungeonData, environment) {
        const effects = [];
        
        // Mist in humid areas
        for (const room of dungeonData.rooms) {
            if (room.environment.humidity > 80) {
                effects.push({
                    id: `mist_${room.id}`,
                    type: 'MIST',
                    roomId: room.id,
                    density: (room.environment.humidity - 80) / 20,
                    height: room.size.height * 0.3,
                    color: [0.7, 0.7, 0.8]
                });
            }
        }
        
        // Water spray near flowing water
        for (const waterBody of environment.waterBodies) {
            if (waterBody.properties.flow === 'FLOWING') {
                effects.push({
                    id: `spray_${waterBody.id}`,
                    type: 'WATER_SPRAY',
                    position: waterBody.position,
                    intensity: 0.3,
                    particleCount: 50
                });
            }
        }
        
        // Dust particles in dry areas
        for (const room of dungeonData.rooms) {
            if (room.environment.humidity < 30 && room.style === 'MAN_MADE') {
                effects.push({
                    id: `dust_${room.id}`,
                    type: 'DUST_PARTICLES',
                    roomId: room.id,
                    density: 0.2,
                    particleSize: 0.01
                });
            }
        }
        
        // Spore clouds in mushroom areas
        for (const room of dungeonData.rooms) {
            if (room.type === 'MUSHROOM_GROVE') {
                effects.push({
                    id: `spores_${room.id}`,
                    type: 'SPORE_CLOUD',
                    roomId: room.id,
                    density: 0.4,
                    color: [0.8, 0.9, 0.7],
                    bioluminescent: true
                });
            }
        }
        
        return effects;
    }
}

/**
 * Water flow simulation between connected bodies
 */
class WaterFlowSimulator {
    async simulateFlow(waterBodies, connections) {
        const flows = [];
        
        // Find water bodies that are connected
        for (const connection of connections) {
            const waterA = waterBodies.find(w => w.roomId === connection.rooms[0]);
            const waterB = waterBodies.find(w => w.roomId === connection.rooms[1]);
            
            if (waterA && waterB) {
                // Calculate flow based on elevation difference
                const elevationDiff = waterA.position.y - waterB.position.y;
                
                if (Math.abs(elevationDiff) > 0.1) {
                    const flow = {
                        from: elevationDiff > 0 ? waterA.id : waterB.id,
                        to: elevationDiff > 0 ? waterB.id : waterA.id,
                        rate: Math.abs(elevationDiff) * 0.5,
                        connectionId: connection.id
                    };
                    
                    flows.push(flow);
                    
                    // Update water properties
                    const upstream = elevationDiff > 0 ? waterA : waterB;
                    const downstream = elevationDiff > 0 ? waterB : waterA;
                    
                    upstream.properties.flow = 'FLOWING_OUT';
                    downstream.properties.flow = 'FLOWING_IN';
                    
                    // Mix water properties
                    downstream.properties.temperature = MathUtils.lerp(
                        downstream.properties.temperature,
                        upstream.properties.temperature,
                        0.3
                    );
                    
                    downstream.properties.mineralContent = MathUtils.lerp(
                        downstream.properties.mineralContent,
                        upstream.properties.mineralContent,
                        0.2
                    );
                }
            }
        }
        
        return flows;
    }
}

/**
 * Temperature zone calculator
 */
class TemperatureCalculator {
    async calculateZones(dungeonData, waterBodies) {
        const zones = [];
        
        // Base temperature gradients
        for (const room of dungeonData.rooms) {
            const baseTemp = room.environment.temperature;
            
            // Water bodies cool the area
            let waterCooling = 0;
            for (const water of waterBodies) {
                if (water.roomId === room.id) {
                    waterCooling = water.coverage * 3;
                }
            }
            
            zones.push({
                roomId: room.id,
                baseTemperature: baseTemp,
                actualTemperature: baseTemp - waterCooling,
                gradient: this.calculateGradient(room, dungeonData),
                heatSources: this.findHeatSources(room),
                insulation: room.style === 'MAN_MADE' ? 0.8 : 0.3
            });
        }
        
        // Smooth temperature between connected rooms
        this.smoothTemperatures(zones, dungeonData);
        
        return zones;
    }
    
    calculateGradient(room, dungeonData) {
        // Temperature flows from warm to cold areas
        const gradient = new Vector3(0, 0, 0);
        
        for (const connection of room.connections) {
            const connectedRoom = dungeonData.rooms.find(r => r.id === connection.targetRoom);
            if (connectedRoom) {
                const tempDiff = room.environment.temperature - connectedRoom.environment.temperature;
                const direction = connectedRoom.position.subtract(room.position).normalize();
                gradient.addInPlace(direction.multiply(tempDiff * 0.1));
            }
        }
        
        return gradient;
    }
    
    findHeatSources(room) {
        const sources = [];
        
        // Lava pools in deep caves
        if (room.depth > 7 && room.style === 'NATURAL' && Math.random() < 0.1) {
            sources.push({
                type: 'LAVA_POOL',
                temperature: 800,
                radius: 5
            });
        }
        
        // Thermal vents
        if (room.depth > 5 && Math.random() < 0.15) {
            sources.push({
                type: 'THERMAL_VENT',
                temperature: 60,
                radius: 3
            });
        }
        
        return sources;
    }
    
    smoothTemperatures(zones, dungeonData) {
        // Simple temperature diffusion
        for (let i = 0; i < 3; i++) { // Multiple passes
            for (const zone of zones) {
                const room = dungeonData.rooms.find(r => r.id === zone.roomId);
                let avgTemp = zone.actualTemperature;
                let count = 1;
                
                for (const connection of room.connections) {
                    const connectedZone = zones.find(z => z.roomId === connection.targetRoom);
                    if (connectedZone) {
                        avgTemp += connectedZone.actualTemperature;
                        count++;
                    }
                }
                
                zone.actualTemperature = MathUtils.lerp(
                    zone.actualTemperature,
                    avgTemp / count,
                    0.3
                );
            }
        }
    }
}

/**
 * Light propagation calculator
 */
class LightCalculator {
    async calculateLightMap(lightSources, dungeonData) {
        const lightMap = new Map();
        
        // Calculate light level for each room
        for (const room of dungeonData.rooms) {
            let totalLight = 0;
            const contributingSources = [];
            
            for (const light of lightSources) {
                const distance = room.position.distance(light.position);
                
                if (distance < light.range) {
                    // Check if there's a path (no occlusion for now)
                    const attenuation = this.calculateAttenuation(distance, light.attenuation);
                    const intensity = light.intensity * attenuation;
                    
                    if (intensity > 0.01) {
                        totalLight += intensity;
                        contributingSources.push({
                            sourceId: light.id,
                            contribution: intensity,
                            color: light.color
                        });
                    }
                }
            }
            
            lightMap.set(room.id, {
                totalIntensity: Math.min(1, totalLight),
                sources: contributingSources,
                ambientLevel: Math.max(0.02, room.depth === 0 ? 0.3 : 0.05 / room.depth)
            });
        }
        
        return lightMap;
    }
    
    calculateAttenuation(distance, attenuation) {
        return 1 / (
            attenuation.constant +
            attenuation.linear * distance +
            attenuation.quadratic * distance * distance
        );
    }
}

/**
 * Organic matter placement system
 */
class OrganicMatterPlacer {
    async placeOrganicMatter(dungeonData, waterBodies, lightMap) {
        const deposits = [];
        
        for (const room of dungeonData.rooms) {
            const lightLevel = lightMap.get(room.id)?.totalIntensity || 0;
            const hasWater = waterBodies.some(w => w.roomId === room.id);
            
            // Calculate organic matter probability
            let probability = 0.1;
            
            // Increase near water
            if (hasWater) probability += 0.3;
            
            // Increase in dark, humid areas (decomposition)
            if (lightLevel < 0.1 && room.environment.humidity > 60) {
                probability += 0.4;
            }
            
            // Decrease in very dry or very cold areas
            if (room.environment.humidity < 30 || room.environment.temperature < 5) {
                probability *= 0.3;
            }
            
            if (Math.random() < probability) {
                const deposit = {
                    id: `organic_${room.id}`,
                    roomId: room.id,
                    type: this.selectOrganicType(room, lightLevel, hasWater),
                    amount: 10 + Math.random() * 40,
                    quality: this.calculateQuality(room),
                    position: this.selectPosition(room),
                    regenerationRate: 0.1 + Math.random() * 0.2
                };
                
                deposits.push(deposit);
            }
        }
        
        return deposits;
    }
    
    selectOrganicType(room, lightLevel, hasWater) {
        if (room.type === 'MUSHROOM_GROVE') return 'FUNGAL_MATTER';
        
        if (lightLevel > 0.3 && hasWater) return 'MOSS';
        if (lightLevel < 0.1) return 'DETRITUS';
        if (hasWater) return 'ALGAE';
        
        return 'DECOMPOSED_MATTER';
    }
    
    calculateQuality(room) {
        // Quality affected by environmental conditions
        let quality = 0.5;
        
        // Optimal conditions: moderate temperature and high humidity
        const tempOptimal = 1 - Math.abs(room.environment.temperature - 15) / 20;
        const humidityOptimal = room.environment.humidity / 100;
        
        quality = quality * tempOptimal * humidityOptimal;
        
        return MathUtils.clamp(quality, 0.1, 1.0);
    }
    
    selectPosition(room) {
        // Place organic matter in corners and edges
        const offset = new Vector3(
            (Math.random() - 0.5) * room.size.radius * 0.8,
            0,
            (Math.random() - 0.5) * room.size.radius * 0.8
        );
        
        return room.position.clone().add(offset);
    }
}