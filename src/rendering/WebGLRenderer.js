/**
 * WebGLRenderer - Core 3D Rendering System
 * UPGRADED VERSION - With generic mesh rendering and buffer caching.
 */

import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';

export class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.isInitialized = false;
        
        // Rendering state
        this.viewMatrix = Matrix4.identity();
        this.projectionMatrix = Matrix4.identity();
        this.cameraPosition = new Vector3(0, 0, 0);
        this.clearColor = { r: 0.1, g: 0.1, b: 0.15, a: 1.0 };
        
        // Performance tracking
        this.stats = { drawCalls: 0, vertices: 0, triangles: 0 };
        
        // Shader programs
        this.programs = new Map();
        this.currentProgram = null;

        // NEW: Buffer Caching System
        this.bufferCache = new Map();
    }
    
    async initialize() {
        try {
            console.log('🎮 Initializing WebGL renderer...');
            this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
            if (!this.gl) throw new Error('Unable to get WebGL context');
            
            this.isWebGL2 = this.gl instanceof WebGL2RenderingContext;
            console.log(`✅ WebGL ${this.isWebGL2 ? '2' : '1'} context created`);
            
            this.setupWebGLState();
            await this.createBasicShaders();
            this.resize();
            
            this.isInitialized = true;
            console.log('✅ WebGL renderer initialized successfully');
        } catch (error) {
            console.error('❌ WebGL initialization failed:', error);
            throw error;
        }
    }
    
    setupWebGLState() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    
    async createBasicShaders() {
        const vertexSrc = this.isWebGL2 ? `#version 300 es
            in vec3 a_position;
            in vec3 a_normal;
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            out vec3 v_normal;
            out vec3 v_worldPos;
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                v_worldPos = worldPos.xyz;
                mat3 normalMatrix = mat3(transpose(inverse(u_modelMatrix)));
                v_normal = normalize(normalMatrix * a_normal);
                gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
            }` : `
            attribute vec3 a_position;
            attribute vec3 a_normal;
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            varying vec3 v_normal;
            varying vec3 v_worldPos;
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                v_worldPos = worldPos.xyz;
                mat3 normalMatrix = mat3(u_modelMatrix); // Simplified for WebGL1
                v_normal = normalize(normalMatrix * a_normal);
                gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
            }`;

        const fragmentSrc = this.isWebGL2 ? `#version 300 es
            precision mediump float;
            in vec3 v_normal;
            in vec3 v_worldPos;
            uniform vec3 u_color;
            uniform vec3 u_lightDirection;
            uniform vec3 u_cameraPosition;
            out vec4 fragColor;
            void main() {
                vec3 normal = normalize(v_normal);
                vec3 lightDir = normalize(u_lightDirection);
                float diffuse = max(dot(normal, lightDir), 0.0);
                vec3 ambient = vec3(0.2);
                vec3 viewDir = normalize(u_cameraPosition - v_worldPos);
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 finalColor = u_color * (ambient + diffuse * 0.8) + vec3(1.0) * spec * 0.3;
                fragColor = vec4(finalColor, 1.0);
            }` : `
            precision mediump float;
            varying vec3 v_normal;
            varying vec3 v_worldPos;
            uniform vec3 u_color;
            uniform vec3 u_lightDirection;
            uniform vec3 u_cameraPosition;
            void main() {
                vec3 normal = normalize(v_normal);
                vec3 lightDir = normalize(u_lightDirection);
                float diffuse = max(dot(normal, lightDir), 0.0);
                vec3 ambient = vec3(0.2);
                vec3 viewDir = normalize(u_cameraPosition - v_worldPos);
                vec3 reflectDir = reflect(-lightDir, normal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 finalColor = u_color * (ambient + diffuse * 0.8) + vec3(1.0) * spec * 0.3;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;

        const basicProgram = this.createShaderProgram(vertexSrc, fragmentSrc);
        this.programs.set('basic', basicProgram);
    }
    
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Shader program linking failed: ' + gl.getProgramInfoLog(program));
        }
        return {
            program: program,
            attributes: {
                position: gl.getAttribLocation(program, 'a_position'),
                normal: gl.getAttribLocation(program, 'a_normal'),
            },
            uniforms: {
                modelMatrix: gl.getUniformLocation(program, 'u_modelMatrix'),
                viewMatrix: gl.getUniformLocation(program, 'u_viewMatrix'),
                projectionMatrix: gl.getUniformLocation(program, 'u_projectionMatrix'),
                color: gl.getUniformLocation(program, 'u_color'),
                lightDirection: gl.getUniformLocation(program, 'u_lightDirection'),
                cameraPosition: gl.getUniformLocation(program, 'u_cameraPosition'),
            }
        };
    }
    
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}\nSource:\n${source}`);
        }
        return shader;
    }

    beginFrame() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.stats = { drawCalls: 0, vertices: 0, triangles: 0 };
    }
    
    setCamera(viewMatrix, projectionMatrix, cameraPosition) {
        this.viewMatrix = viewMatrix;
        this.projectionMatrix = projectionMatrix;
        this.cameraPosition = cameraPosition;
    }
    
    useProgram(programName) {
        const programInfo = this.programs.get(programName);
        if (!programInfo) return false;
        
        this.gl.useProgram(programInfo.program);
        this.currentProgram = programInfo;
        
        this.gl.uniformMatrix4fv(programInfo.uniforms.viewMatrix, false, this.viewMatrix.toFloat32Array());
        this.gl.uniformMatrix4fv(programInfo.uniforms.projectionMatrix, false, this.projectionMatrix.toFloat32Array());
        this.gl.uniform3fv(programInfo.uniforms.cameraPosition, this.cameraPosition.toArray());
        
        return true;
    }
    
    /**
     * NEW: Creates and caches WebGL buffers for a given geometry object.
     */
    getOrCreateBuffers(geometry) {
        if (this.bufferCache.has(geometry)) {
            return this.bufferCache.get(geometry);
        }

        const gl = this.gl;
        const buffers = {};

        // Vertex buffer
        buffers.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        // Normal buffer
        buffers.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

        // Index buffer
        buffers.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        buffers.indexCount = geometry.indices.length;

        this.bufferCache.set(geometry, buffers);
        return buffers;
    }

    /**
     * REPLACES renderCube: Renders a generic mesh node.
     */
    renderMesh(node) {
        const meshComponent = node.getComponent('mesh');
        if (!meshComponent) return;

        const { geometry, material } = meshComponent;
        if (!geometry || !material) return;

        if (!this.useProgram('basic')) return;
        
        const gl = this.gl;
        const program = this.currentProgram;

        // Get or create buffers for this geometry
        const buffers = this.getOrCreateBuffers(geometry);
        
        // Set model matrix
        node.updateWorldMatrix(true, false); // Ensure matrix is up-to-date
        gl.uniformMatrix4fv(program.uniforms.modelMatrix, false, node.worldMatrix.toFloat32Array());
        
        // Set material and lighting uniforms
        gl.uniform3fv(program.uniforms.color, material.color || [1, 0, 1]); // Default to magenta if no color
        gl.uniform3fv(program.uniforms.lightDirection, [0.5, 1.0, 0.75]); // Example light
        
        // Bind vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.enableVertexAttribArray(program.attributes.position);
        gl.vertexAttribPointer(program.attributes.position, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.enableVertexAttribArray(program.attributes.normal);
        gl.vertexAttribPointer(program.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        
        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
        
        // Update stats
        this.stats.drawCalls++;
        this.stats.vertices += geometry.vertices.length / 3;
        this.stats.triangles += geometry.indices.length / 3;
    }
    
    resize() {
        if (!this.gl) return;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    dispose() {
        if (!this.gl) return;
        // Clean up cached buffers
        this.bufferCache.forEach(buffers => {
            this.gl.deleteBuffer(buffers.vertexBuffer);
            this.gl.deleteBuffer(buffers.normalBuffer);
            this.gl.deleteBuffer(buffers.indexBuffer);
        });
        this.bufferCache.clear();
        
        this.programs.forEach(program => this.gl.deleteProgram(program.program));
        this.programs.clear();
        
        this.isInitialized = false;
        console.log('🧹 WebGL renderer disposed');
    }
}