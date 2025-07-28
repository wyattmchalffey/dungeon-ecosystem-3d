/**
 * RoomGenerator - Creates individual rooms with natural and man-made styles
 * Handles room shapes, features, and environmental properties
 */

import { Vector3 } from '../math/Vector3.js';
import { MathUtils } from '../math/MathUtils.js';

export class RoomGenerator {
    constructor() {
        // Room templates
        this.templates = this.initializeTemplates();

        // Feature generators
        this.featureGenerators = {
            // Natural features
            stalactites: this.generateStalactites.bind(this),
            stalagmites: this.generateStalagmites.bind(this),
            flowstone: this.generateFlowstone.bind(this),
            crystal_formations: this.generateCrystals.bind(this),
            mushroom_grove: this.generateMushrooms.bind(this),
            water_pool: this.generateWaterPool.bind(this),

            // Man-made features
            columns: this.generateColumns.bind(this),
            altar: this.generateAltar.bind(this),
            torch_sconces: this.generateTorchSconces.bind(this),
            carved_walls: this.generateCarvedWalls.bind(this),
            tombs: this.generateTombs.bind(this),
            broken_stairs: this.generateBrokenStairs.bind(this)
        };
    }

    /**
     * Initialize room templates
     */
    initializeTemplates() {
        return {
            // Natural cave formations
            NATURAL_CHAMBER: {
                baseShape: 'organic',
                sizeRange: { radius: [8, 20], height: [4, 12] },
                irregularity: 0.4,
                features: ['stalactites', 'stalagmites', 'flowstone'],
                floorSlope: 0.1,
                ceilingVariation: 0.3
            },
            WATER_CAVE: {
                baseShape: 'elongated',
                sizeRange: { length: [15, 30], width: [8, 15], height: [3, 8] },
                irregularity: 0.3,
                features: ['water_pool', 'flowstone', 'erosion_patterns'],
                floorSlope: 0.05,
                waterLevel: 0.3
            },
            CRYSTAL_CAVE: {
                baseShape: 'geodesic',
                sizeRange: { radius: [10, 15], height: [6, 10] },
                irregularity: 0.2,
                features: ['crystal_formations', 'reflective_surfaces'],
                floorSlope: 0.15,
                lightReflectivity: 0.8
            },
            MUSHROOM_GROVE: {
                baseShape: 'organic',
                sizeRange: { radius: [12, 18], height: [4, 6] },
                irregularity: 0.35,
                features: ['mushroom_grove', 'organic_matter', 'spore_clouds'],
                floorSlope: 0.05,
                humidity: 0.9
            },
            UNDERGROUND_LAKE: {
                baseShape: 'bowl',
                sizeRange: { radius: [20, 35], depth: [5, 15] },
                irregularity: 0.25,
                features: ['water_pool', 'rocky_shores', 'mist'],
                waterLevel: 0.8,
                humidity: 0.95
            },

            // Man-made structures
            ENTRANCE_HALL: {
                baseShape: 'rectangular',
                sizeRange: { width: [10, 15], length: [15, 20], height: [8, 12] },
                irregularity: 0.1,
                features: ['columns', 'carved_walls', 'torch_sconces'],
                decay: 0.2,
                architecturalStyle: 'classical'
            },
            GUARD_ROOM: {
                baseShape: 'rectangular',
                sizeRange: { width: [8, 12], length: [8, 12], height: [4, 6] },
                irregularity: 0.05,
                features: ['weapon_racks', 'torch_sconces', 'arrow_slits'],
                decay: 0.3,
                architecturalStyle: 'defensive'
            },
            TEMPLE: {
                baseShape: 'cross',
                sizeRange: { width: [20, 30], length: [25, 35], height: [12, 18] },
                irregularity: 0.05,
                features: ['altar', 'columns', 'sacred_pool', 'carved_ceiling'],
                decay: 0.15,
                architecturalStyle: 'religious'
            },
            LIBRARY: {
                baseShape: 'rectangular',
                sizeRange: { width: [15, 20], length: [20, 25], height: [8, 10] },
                irregularity: 0.05,
                features: ['book_shelves', 'reading_alcoves', 'collapsed_sections'],
                decay: 0.4,
                architecturalStyle: 'scholarly'
            },
            CRYPT: {
                baseShape: 'grid',
                sizeRange: { width: [15, 25], length: [15, 25], height: [4, 6] },
                irregularity: 0.1,
                features: ['tombs', 'alcoves', 'bone_piles'],
                decay: 0.25,
                architecturalStyle: 'funerary'
            },
            TREASURE_VAULT: {
                baseShape: 'octagonal',
                sizeRange: { radius: [8, 12], height: [6, 8] },
                irregularity: 0.05,
                features: ['pillars', 'treasure_pedestals', 'trapped_floor'],
                decay: 0.1,
                architecturalStyle: 'secure'
            }
        };
    }

    /**
     * Generate rooms from classified regions
     */
    async generateRooms(regions, config) {
        const rooms = [];

        for (const region of regions) {
            const room = await this.createRoom(region, config);
            rooms.push(room);
        }

        // Post-process for coherence
        this.ensureRoomCoherence(rooms);

        return rooms;
    }

    /**
     * Create individual room
     */
    async createRoom(region, config) {
        const template = this.templates[region.type] || this.templates.NATURAL_CHAMBER;

        // Calculate room size based on template and random variation
        const size = this.calculateRoomSize(template.sizeRange);

        // Create base room object
        const room = {
            id: region.node.id,
            type: region.type,
            style: region.style,
            position: region.node.position.clone(),
            depth: region.node.depth,
            size: size,
            template: template,
            connections: [],
            features: [],
            environment: this.calculateEnvironment(region.node.depth, template),
            geometry: null // Will be generated later
        };

        // Apply style-specific modifications
        if (region.style === 'NATURAL') {
            this.applyNaturalCaveProperties(room, region);
        } else {
            this.applyManMadeProperties(room, region);
        }

        // Generate room features
        room.features = await this.generateRoomFeatures(room, template.features);

        return room;
    }

    /**
     * Calculate room size from template range
     */
    calculateRoomSize(sizeRange) {
        const size = {};

        for (const [key, range] of Object.entries(sizeRange)) {
            if (Array.isArray(range)) {
                size[key] = MathUtils.randomRange(range[0], range[1]);
            } else {
                size[key] = range;
            }
        }

        return size;
    }

    /**
     * Calculate environmental properties
     */
    calculateEnvironment(depth, template) {
        const baseTemp = 20;
        const tempDropPerLevel = 1.5;

        const environment = {
            temperature: baseTemp - (depth * tempDropPerLevel),
            humidity: 50 + (depth * 5) + (template.humidity || 0) * 50,
            lightLevel: Math.max(0, 1 - (depth * 0.15)),
            airFlow: Math.max(0.1, 1 - (depth * 0.1)),
            pressure: 1 + (depth * 0.05)
        };

        // Clamp values
        environment.temperature = MathUtils.clamp(environment.temperature, 5, 35);
        environment.humidity = MathUtils.clamp(environment.humidity, 20, 100);

        return environment;
    }

    /**
     * Apply natural cave properties
     */
    applyNaturalCaveProperties(room, region) {
        room.properties = {
            irregularity: room.template.irregularity,
            erosionLevel: 0.1 + (room.depth * 0.05),
            geologicalAge: MathUtils.randomRange(1000, 10000),
            mineralComposition: this.generateMineralComposition(),
            formationType: this.selectFormationType(room.depth)
        };

        // Natural caves have organic connections
        room.connectionStyle = 'ORGANIC_TUNNEL';

        // Add natural modifiers
        room.modifiers = {
            noise: {
                frequency: 0.1 + (Math.random() * 0.05),
                amplitude: room.template.irregularity,
                octaves: 3
            },
            erosion: {
                iterations: Math.floor(region.node.depth * 2),
                strength: 0.1 + (Math.random() * 0.1)
            }
        };
    }

    /**
     * Apply man-made properties
     */
    applyManMadeProperties(room, region) {
        room.properties = {
            architecturalStyle: room.template.architecturalStyle,
            constructionQuality: 1 - (room.template.decay || 0),
            age: this.estimateStructureAge(room.depth),
            culturalOrigin: this.selectCulturalOrigin(room.type),
            structuralIntegrity: 1 - (room.depth * 0.08)
        };

        // Man-made areas use carved passages
        room.connectionStyle = 'CARVED_CORRIDOR';

        // Add decay modifiers
        room.modifiers = {
            decay: {
                amount: room.template.decay + (room.depth * 0.05),
                type: 'structural',
                patterns: ['cracks', 'missing_blocks', 'collapsed_sections']
            },
            architectural: {
                style: room.template.architecturalStyle,
                period: room.properties.culturalOrigin
            }
        };
    }

    /**
     * Generate room features
     */
    async generateRoomFeatures(room, featureList) {
        const features = [];

        for (const featureName of featureList) {
            const generator = this.featureGenerators[featureName];
            if (generator) {
                const feature = await generator(room);
                if (feature) {
                    features.push(feature);
                }
            }
        }

        return features;
    }

    // Feature generation methods
    generateStalactites(room) {
        const count = Math.floor(room.size.radius * 0.5 + Math.random() * 10);
        const stalactites = [];

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const distance = Math.random() * room.size.radius * 0.8;

            stalactites.push({
                type: 'stalactite',
                position: new Vector3(
                    Math.cos(angle) * distance,
                    room.size.height * 0.8 + Math.random() * room.size.height * 0.2,
                    Math.sin(angle) * distance
                ),
                length: 0.5 + Math.random() * 2,
                thickness: 0.1 + Math.random() * 0.3,
                mineralType: this.selectMineralType()
            });
        }

        return {
            type: 'stalactites',
            instances: stalactites,
            coverage: count / (room.size.radius * room.size.radius)
        };
    }

    generateStalagmites(room) {
        const count = Math.floor(room.size.radius * 0.3 + Math.random() * 8);
        const stalagmites = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * room.size.radius * 0.7;

            stalagmites.push({
                type: 'stalagmite',
                position: new Vector3(
                    Math.cos(angle) * distance,
                    0,
                    Math.sin(angle) * distance
                ),
                height: 0.5 + Math.random() * 3,
                thickness: 0.2 + Math.random() * 0.5,
                mineralType: this.selectMineralType()
            });
        }

        return {
            type: 'stalagmites',
            instances: stalagmites,
            coverage: count / (room.size.radius * room.size.radius)
        };
    }

    generateColumns(room) {
        const layout = this.selectColumnLayout(room);
        const columns = [];

        for (const pos of layout.positions) {
            columns.push({
                type: 'column',
                position: pos,
                height: room.size.height * 0.9,
                radius: 0.3 + Math.random() * 0.2,
                style: room.properties.architecturalStyle,
                condition: 1 - room.modifiers.decay.amount
            });
        }

        return {
            type: 'columns',
            instances: columns,
            layout: layout.type
        };
    }

    generateWaterPool(room) {
        const coverage = room.template.waterLevel || 0.3;

        return {
            type: 'water_pool',
            coverage: coverage,
            depth: 0.5 + Math.random() * 2,
            shape: room.style === 'NATURAL' ? 'organic' : 'geometric',
            properties: {
                clarity: 0.3 + Math.random() * 0.7,
                flow: room.connections.length > 2 ? 'flowing' : 'still',
                temperature: room.environment.temperature - 2,
                mineralContent: room.depth * 0.1
            }
        };
    }

    generateCrystals(room) {
        const clusters = Math.floor(3 + Math.random() * 5);
        const crystals = [];

        for (let i = 0; i < clusters; i++) {
            const angle = (i / clusters) * Math.PI * 2;
            const distance = room.size.radius * (0.3 + Math.random() * 0.5);

            crystals.push({
                type: 'crystal_cluster',
                position: new Vector3(
                    Math.cos(angle) * distance,
                    Math.random() * room.size.height * 0.5,
                    Math.sin(angle) * distance
                ),
                size: 0.5 + Math.random() * 1.5,
                crystalType: this.selectCrystalType(),
                glowIntensity: 0.1 + Math.random() * 0.3,
                color: this.selectCrystalColor()
            });
        }

        return {
            type: 'crystal_formations',
            instances: crystals,
            lightEmission: 0.2
        };
    }

    // Helper methods
    selectFormationType(depth) {
        const types = ['dissolution', 'lava_tube', 'tectonic', 'erosion'];
        const weights = [0.4, 0.1, 0.2, 0.3];

        // Lava tubes more common at depth
        if (depth > 5) weights[1] += 0.3;

        return types[MathUtils.randomWeighted(weights)];
    }

    generateMineralComposition() {
        return {
            limestone: 0.3 + Math.random() * 0.4,
            granite: 0.1 + Math.random() * 0.2,
            quartz: 0.05 + Math.random() * 0.15,
            other: 0.1 + Math.random() * 0.2
        };
    }

    selectMineralType() {
        const types = ['calcite', 'aragonite', 'gypsum', 'flowstone'];
        return types[Math.floor(Math.random() * types.length)];
    }

    selectCrystalType() {
        const types = ['quartz', 'amethyst', 'calcite', 'fluorite', 'selenite'];
        return types[Math.floor(Math.random() * types.length)];
    }

    selectCrystalColor() {
        const colors = [
            [0.9, 0.9, 1.0], // Clear
            [0.6, 0.4, 0.8], // Purple
            [0.4, 0.8, 0.9], // Blue
            [0.4, 0.9, 0.4], // Green
            [1.0, 0.8, 0.4]  // Amber
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    selectColumnLayout(room) {
        const width = room.size.width || room.size.radius * 2;
        const length = room.size.length || room.size.radius * 2;

        const layouts = {
            grid: () => {
                const positions = [];
                const spacing = 4;
                const cols = Math.floor(width / spacing);
                const rows = Math.floor(length / spacing);

                for (let x = 0; x < cols; x++) {
                    for (let z = 0; z < rows; z++) {
                        positions.push(new Vector3(
                            (x - cols / 2 + 0.5) * spacing,
                            0,
                            (z - rows / 2 + 0.5) * spacing
                        ));
                    }
                }
                return positions;
            },
            perimeter: () => {
                const positions = [];
                const spacing = 3;
                const cols = Math.floor(width / spacing);
                const rows = Math.floor(length / spacing);

                // Add perimeter columns
                for (let x = 0; x < cols; x++) {
                    positions.push(new Vector3((x - cols / 2 + 0.5) * spacing, 0, -length / 2 + 1));
                    positions.push(new Vector3((x - cols / 2 + 0.5) * spacing, 0, length / 2 - 1));
                }
                for (let z = 1; z < rows - 1; z++) {
                    positions.push(new Vector3(-width / 2 + 1, 0, (z - rows / 2 + 0.5) * spacing));
                    positions.push(new Vector3(width / 2 - 1, 0, (z - rows / 2 + 0.5) * spacing));
                }
                return positions;
            }
        };

        const layoutType = room.properties.architecturalStyle === 'classical' ? 'grid' : 'perimeter';

        return {
            type: layoutType,
            positions: layouts[layoutType]()
        };
    }

    selectCulturalOrigin(roomType) {
        const origins = {
            TEMPLE: ['ancient_empire', 'forgotten_cult', 'divine_order'],
            CRYPT: ['noble_house', 'warrior_clan', 'ancient_dynasty'],
            LIBRARY: ['scholarly_order', 'wizard_academy', 'lost_civilization'],
            TREASURE_VAULT: ['dragon_hoard', 'royal_treasury', 'merchant_guild']
        };

        const options = origins[roomType] || ['unknown_builders'];
        return options[Math.floor(Math.random() * options.length)];
    }

    estimateStructureAge(depth) {
        // Deeper structures are older
        const baseAge = 500;
        const agePerLevel = 200;
        const variation = 100;

        return baseAge + (depth * agePerLevel) + (Math.random() * variation * 2 - variation);
    }

    /**
     * Ensure coherence between connected rooms
     */
    ensureRoomCoherence(rooms) {
        // Adjust environmental properties for smooth transitions
        for (const room of rooms) {
            const connectedRooms = rooms.filter(r =>
                room.connections.some(c => c.targetRoom === r.id)
            );

            if (connectedRooms.length > 0) {
                // Average environmental properties with neighbors
                let avgTemp = room.environment.temperature;
                let avgHumidity = room.environment.humidity;

                for (const connected of connectedRooms) {
                    avgTemp += connected.environment.temperature;
                    avgHumidity += connected.environment.humidity;
                }

                avgTemp /= (connectedRooms.length + 1);
                avgHumidity /= (connectedRooms.length + 1);

                // Blend towards average
                room.environment.temperature = MathUtils.lerp(
                    room.environment.temperature,
                    avgTemp,
                    0.3
                );
                room.environment.humidity = MathUtils.lerp(
                    room.environment.humidity,
                    avgHumidity,
                    0.3
                );
            }
        }
    }

    // Additional feature generators
    generateFlowstone(room) {
        return {
            type: 'flowstone',
            coverage: 0.2 + Math.random() * 0.3,
            thickness: 0.1 + Math.random() * 0.3,
            pattern: ['curtain', 'cascade', 'sheet'][Math.floor(Math.random() * 3)]
        };
    }

    generateMushrooms(room) {
        const count = Math.floor(10 + Math.random() * 20);
        const mushrooms = [];

        for (let i = 0; i < count; i++) {
            mushrooms.push({
                type: 'mushroom',
                position: new Vector3(
                    (Math.random() - 0.5) * room.size.radius * 1.5,
                    0,
                    (Math.random() - 0.5) * room.size.radius * 1.5
                ),
                size: 0.1 + Math.random() * 0.5,
                species: ['glowcap', 'sporepuff', 'death_bell'][Math.floor(Math.random() * 3)],
                glowing: Math.random() > 0.6
            });
        }

        return {
            type: 'mushroom_grove',
            instances: mushrooms,
            sporeLevel: 0.3 + Math.random() * 0.4
        };
    }

    generateAltar(room) {
        return {
            type: 'altar',
            position: new Vector3(0, 0.5, -room.size.length * 0.3),
            size: { width: 3, height: 1.5, depth: 2 },
            style: room.properties.culturalOrigin,
            condition: 1 - room.modifiers.decay.amount,
            features: ['candles', 'offering_bowl', 'sacred_symbols']
        };
    }

    generateTorchSconces(room) {
        const spacing = 5;
        const perimeter = (room.size.width + room.size.length) * 2;
        const count = Math.floor(perimeter / spacing);
        const torches = [];

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const pos = this.getPerimeterPosition(room, t);

            torches.push({
                type: 'torch_sconce',
                position: pos,
                height: 2.5,
                lit: Math.random() > 0.3, // Some torches are extinguished
                fuel: Math.random()
            });
        }

        return {
            type: 'torch_sconces',
            instances: torches
        };
    }

    generateCarvedWalls(room) {
        return {
            type: 'carved_walls',
            style: room.properties.culturalOrigin,
            coverage: 0.4 + Math.random() * 0.4,
            motifs: this.selectCarvingMotifs(room.properties.culturalOrigin),
            condition: 1 - room.modifiers.decay.amount
        };
    }

    generateTombs(room) {
        const layout = room.template.baseShape === 'grid' ? 'grid' : 'perimeter';
        const count = Math.floor(5 + Math.random() * 15);
        const tombs = [];

        for (let i = 0; i < count; i++) {
            tombs.push({
                type: 'tomb',
                position: this.getTombPosition(room, i, count, layout),
                size: { width: 2, height: 1, depth: 1 },
                sealed: Math.random() > 0.3,
                inscriptions: Math.random() > 0.5
            });
        }

        return {
            type: 'tombs',
            instances: tombs,
            layout: layout
        };
    }

    generateBrokenStairs(room) {
        return {
            type: 'broken_stairs',
            position: new Vector3(0, 0, room.size.length * 0.4),
            width: 3,
            height: room.size.height * 0.6,
            intactPercentage: 0.3 + Math.random() * 0.4,
            climbable: Math.random() > 0.5
        };
    }

    // Helper methods for feature placement
    getPerimeterPosition(room, t) {
        const width = room.size.width || room.size.radius * 2;
        const length = room.size.length || room.size.radius * 2;
        const hw = width / 2;
        const hl = length / 2;

        if (t < 0.25) {
            // Top edge
            return new Vector3(MathUtils.lerp(-hw, hw, t * 4), 0, -hl);
        } else if (t < 0.5) {
            // Right edge
            return new Vector3(hw, 0, MathUtils.lerp(-hl, hl, (t - 0.25) * 4));
        } else if (t < 0.75) {
            // Bottom edge
            return new Vector3(MathUtils.lerp(hw, -hw, (t - 0.5) * 4), 0, hl);
        } else {
            // Left edge
            return new Vector3(-hw, 0, MathUtils.lerp(hl, -hl, (t - 0.75) * 4));
        }
    }

    getTombPosition(room, index, total, layout) {
        if (layout === 'grid') {
            const cols = Math.ceil(Math.sqrt(total));
            const x = (index % cols) - cols / 2;
            const z = Math.floor(index / cols) - cols / 2;
            return new Vector3(x * 3, 0, z * 3);
        } else {
            const t = index / total;
            return this.getPerimeterPosition(room, t);
        }
    }

    selectCarvingMotifs(culturalOrigin) {
        const motifs = {
            ancient_empire: ['eagles', 'laurels', 'conquests'],
            forgotten_cult: ['strange_symbols', 'tentacles', 'eyes'],
            divine_order: ['holy_symbols', 'angels', 'prayers'],
            scholarly_order: ['constellation_maps', 'equations', 'diagrams']
        };

        return motifs[culturalOrigin] || ['geometric_patterns'];
    }
}