/**
 * DemoScene - Creates demonstration content
 * Separated from main application logic
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { MathUtils } from '../math/MathUtils.js';
import { Scene, Group, Mesh } from '../rendering/Scene.js';
import { GeometryBuilder } from '../rendering/GeometryBuilder.js';

export class DemoScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.time = 0;
        
        // Demo objects
        this.cubes = [];
        this.lights = [];
        
        // Animation parameters
        this.rotationSpeed = 0.5;
        this.orbitRadius = 3;
    }
    
    /**
     * Create the initial demo scene
     */
    create() {
        console.log('🎨 Creating demo scene...');
        
        // Create demo content based on renderer
        if (this.engine.config.renderMode === 'webgl') {
            this.createWebGLDemo();
        } else {
            this.createCanvas2DDemo();
        }
        
        console.log('✅ Demo scene created');
    }
    
    /**
     * Create WebGL demo with 3D cubes
     */
    createWebGLDemo() {
        // Create container group
        const cubeGroup = new Group('CubeGroup');
        this.scene.addChild(cubeGroup);
        
        // Create multiple cubes with different colors and positions
        const cubeConfigs = [
            { pos: [0, 0, 0], color: [0.2, 0.6, 1.0], scale: 1 },      // Blue center
            { pos: [-2, 0, 0], color: [1.0, 0.2, 0.2], scale: 0.8 },   // Red left
            { pos: [2, 0, 0], color: [0.2, 1.0, 0.2], scale: 0.8 },    // Green right
            { pos: [0, 2, 0], color: [1.0, 1.0, 0.2], scale: 0.6 },    // Yellow top
            { pos: [0, -2, 0], color: [1.0, 0.2, 1.0], scale: 0.6 }    // Magenta bottom
        ];
        
        cubeConfigs.forEach((config, index) => {
            const cube = this.createCube(
                `Cube${index}`,
                config.pos,
                config.color,
                config.scale
            );
            cubeGroup.addChild(cube);
            this.cubes.push(cube);
        });
        
        // Add an orbiting cube
        const orbitingCube = this.createCube(
            'OrbitingCube',
            [0, 0, 0],
            [0.5, 0.5, 1.0],
            0.5
        );
        this.scene.addChild(orbitingCube);
        this.cubes.push(orbitingCube);
        
        // Store special references
        this.orbitingCube = orbitingCube;
        this.cubeGroup = cubeGroup;
    }
    
    /**
     * Create a cube mesh node
     */
    createCube(name, position, color, scale = 1) {
        // Create geometry
        const geometry = GeometryBuilder.createBox(1, 1, 1);
        
        // Create material (simple color for now)
        const material = {
            type: 'basic',
            color: color,
            shininess: 32
        };
        
        // Create mesh node
        const cube = new Mesh(geometry, material, name);
        cube.setPosition(position[0], position[1], position[2]);
        cube.setScale(scale, scale, scale);
        
        // Add custom component for animation
        cube.addComponent('animator', {
            rotationSpeed: this.rotationSpeed * (1 + Math.random() * 0.5),
            axis: new Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize(),
            
            update: function(deltaTime) {
                const rotation = Quaternion.fromAxisAngle(
                    this.axis,
                    this.rotationSpeed * deltaTime
                );
                cube.rotation = cube.rotation.multiply(rotation);
                cube.matrixDirty = true;
            }
        });
        
        return cube;
    }
    
    /**
     * Create Canvas2D demo content
     */
    createCanvas2DDemo() {
        // For Canvas2D, we'll just store some data to render
        this.canvas2DContent = {
            title: 'Dungeon Ecosystem 3D Engine',
            phase: 'Phase 2: WebGL Rendering ✅ Complete',
            info: [
                `Math Library: Vector3, Matrix4, Quaternion ✅`,
                `WebGL Status: ${this.engine.webglInfo?.renderer || 'Not Available'}`,
                `Performance: ${this.engine.performanceMonitor.stats.fps} FPS`,
                `Next: Phase 3 - Procedural Generation`
            ]
        };
    }
    
    /**
     * Update demo scene
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        if (this.engine.config.renderMode === 'webgl') {
            this.updateWebGLDemo(deltaTime);
        } else {
            this.updateCanvas2DDemo(deltaTime);
        }
    }
    
    /**
     * Update WebGL demo animations
     */
    updateWebGLDemo(deltaTime) {
        // Animate orbiting cube
        if (this.orbitingCube) {
            const angle = this.time * 0.5;
            const x = Math.sin(angle) * this.orbitRadius;
            const z = Math.cos(angle) * this.orbitRadius;
            const y = Math.sin(angle * 0.7) * 0.5;
            
            this.orbitingCube.setPosition(x, y, z);
        }
        
        // Rotate the entire cube group
        if (this.cubeGroup) {
            const rotation = Quaternion.fromAxisAngle(
                new Vector3(0, 1, 0),
                deltaTime * 0.2
            );
            this.cubeGroup.rotation = this.cubeGroup.rotation.multiply(rotation);
            this.cubeGroup.matrixDirty = true;
        }
    }
    
    /**
     * Update Canvas2D demo
     */
    updateCanvas2DDemo(deltaTime) {
        // Update FPS in info
        if (this.canvas2DContent) {
            this.canvas2DContent.info[2] = 
                `Performance: ${Math.round(this.engine.performanceMonitor.stats.fps)} FPS`;
        }
    }
    
    /**
     * Render Canvas2D content (called by engine)
     */
    renderCanvas2D(ctx, canvas) {
        if (!this.canvas2DContent) return;
        
        const content = this.canvas2DContent;
        
        // Title
        ctx.fillStyle = '#4a9eff';
        ctx.font = '32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(content.title, canvas.width / 2, 80);
        
        // Phase status
        ctx.fillStyle = '#4eff4a';
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillText(content.phase, canvas.width / 2, 120);
        
        // Info panel
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'left';
        
        const infoX = 50;
        const infoY = 200;
        const lineHeight = 25;
        
        content.info.forEach((line, index) => {
            ctx.fillText(line, infoX, infoY + index * lineHeight);
        });
        
        // Animated element
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 50;
        const radius = 100;
        
        // Draw orbiting circles
        for (let i = 0; i < 3; i++) {
            const angle = this.time + (i * Math.PI * 2 / 3);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * 0.5;
            
            ctx.fillStyle = `hsl(${i * 120}, 70%, 50%)`;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Instructions
        ctx.fillStyle = '#888888';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Space to Start/Stop • Ctrl+D for Debug Panel', canvas.width / 2, canvas.height - 30);
    }
    
    /**
     * Handle demo-specific input
     */
    setupInput() {
        const input = this.engine.inputManager;
        
        // Number keys to focus on specific cubes
        for (let i = 1; i <= 6; i++) {
            input.onKeyDown(`Digit${i}`, () => {
                if (this.cubes[i - 1] && this.engine.camera) {
                    const pos = this.cubes[i - 1].getWorldPosition();
                    this.engine.camera.setTarget(pos);
                    console.log(`📷 Camera focused on Cube ${i - 1}`);
                }
            });
        }
        
        // R key to randomize colors
        input.onKeyDown('KeyR', (event) => {
            if (!event.ctrlKey && !event.metaKey) {
                this.randomizeCubeColors();
            }
        });
        
        // Arrow keys for manual camera control
        input.onKeyDown('ArrowLeft', () => {
            if (this.engine.camera) {
                this.engine.camera.rotate(-0.1, 0);
            }
        });
        
        input.onKeyDown('ArrowRight', () => {
            if (this.engine.camera) {
                this.engine.camera.rotate(0.1, 0);
            }
        });
        
        input.onKeyDown('ArrowUp', () => {
            if (this.engine.camera) {
                this.engine.camera.rotate(0, 0.1);
            }
        });
        
        input.onKeyDown('ArrowDown', () => {
            if (this.engine.camera) {
                this.engine.camera.rotate(0, -0.1);
            }
        });
    }
    
    /**
     * Randomize cube colors
     */
    randomizeCubeColors() {
        this.cubes.forEach(cube => {
            const mesh = cube.getComponent('mesh');
            if (mesh && mesh.material) {
                mesh.material.color = [
                    Math.random(),
                    Math.random(),
                    Math.random()
                ];
            }
        });
        
        console.log('🎨 Cube colors randomized');
    }
    
    /**
     * Clean up demo resources
     */
    dispose() {
        // Remove all demo nodes from scene
        this.cubes.forEach(cube => {
            if (cube.parent) {
                cube.parent.removeChild(cube);
            }
        });
        
        if (this.cubeGroup && this.cubeGroup.parent) {
            this.cubeGroup.parent.removeChild(this.cubeGroup);
        }
        
        this.cubes = [];
        this.lights = [];
        this.cubeGroup = null;
        this.orbitingCube = null;
    }
}