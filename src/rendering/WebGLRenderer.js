/**
 * WebGLRenderer - Core 3D Rendering System
 * FIXED VERSION - Handles canvas context properly
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
        this.clearColor = { r: 0.1, g: 0.1, b: 0.15, a: 1.0 };
        
        // Performance tracking
        this.stats = {
            drawCalls: 0,
            vertices: 0,
            triangles: 0
        };
        
        // Shader programs
        this.programs = new Map();
        this.currentProgram = null;
    }
    
    /**
     * Initialize WebGL context and basic setup
     */
    async initialize() {
        try {
            console.log('🎮 Initializing WebGL renderer...');
            
            // IMPORTANT: Clear any existing 2D context first
            // The canvas may have been used for 2D rendering during initialization
            console.log('🧹 Ensuring clean canvas for WebGL...');
            
            // Get WebGL context with proper options
            const contextOptions = {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
                powerPreference: "default",
                failIfMajorPerformanceCaveat: false // Allow software rendering
            };
            
            // Try WebGL2 first, then WebGL1
            this.gl = this.canvas.getContext('webgl2', contextOptions) || 
                     this.canvas.getContext('webgl', contextOptions) || 
                     this.canvas.getContext('experimental-webgl', contextOptions);
            
            if (!this.gl) {
                // If still fails, try without options
                console.log('🔄 Trying WebGL without specific options...');
                this.gl = this.canvas.getContext('webgl2') || 
                         this.canvas.getContext('webgl') || 
                         this.canvas.getContext('experimental-webgl');
            }
            
            if (!this.gl) {
                throw new Error('Unable to get WebGL context from canvas');
            }
            
            const isWebGL2 = this.gl instanceof WebGL2RenderingContext;
            console.log(`✅ WebGL ${isWebGL2 ? '2' : '1'} context created successfully`);
            
            // Log WebGL info
            try {
                const renderer = this.gl.getParameter(this.gl.RENDERER);
                const vendor = this.gl.getParameter(this.gl.VENDOR);
                const version = this.gl.getParameter(this.gl.VERSION);
                console.log(`🖥️ WebGL Renderer: ${renderer}`);
                console.log(`🏭 WebGL Vendor: ${vendor}`);
                console.log(`📋 WebGL Version: ${version}`);
            } catch (e) {
                console.warn('Could not get WebGL info:', e.message);
            }
            
            // Store context type for feature detection
            this.isWebGL2 = isWebGL2;
            
            // Set up basic WebGL state
            this.setupWebGLState();
            
            // Create basic shader program
            await this.createBasicShaders();
            
            // Set initial viewport
            this.resize();
            
            this.isInitialized = true;
            console.log('✅ WebGL renderer initialized successfully');
            
        } catch (error) {
            console.error('❌ WebGL initialization failed:', error);
            console.error('Canvas width:', this.canvas.width, 'height:', this.canvas.height);
            console.error('Canvas context before WebGL:', this.canvas.getContext ? 'Available' : 'Not available');
            throw error;
        }
    }
    
    /**
     * Set up basic WebGL rendering state
     */
    setupWebGLState() {
        const gl = this.gl;
        
        console.log('🔧 Setting up WebGL state...');
        
        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        
        // Enable face culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        
        // Set clear color
        gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
        
        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        console.log('✅ WebGL state configured');
    }
    
    /**
     * Create basic shader programs
     */
    async createBasicShaders() {
        console.log('🎨 Creating basic shaders...');

        // Fixed vertex shader with proper #version formatting
        const basicVertexShader = this.isWebGL2 ? `#version 300 es
in vec3 a_position;
in vec3 a_normal;
in vec2 a_texCoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;

out vec3 v_normal;
out vec3 v_worldPos;
out vec2 v_texCoord;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = u_normalMatrix * a_normal;
    v_texCoord = a_texCoord;
    
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}` : `attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec2 v_texCoord;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = u_normalMatrix * a_normal;
    v_texCoord = a_texCoord;
    
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}`;

        // Fixed fragment shader with proper #version formatting
        const basicFragmentShader = this.isWebGL2 ? `#version 300 es
precision mediump float;

in vec3 v_normal;
in vec3 v_worldPos;
in vec2 v_texCoord;

uniform vec3 u_color;
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_cameraPosition;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(-u_lightDirection);
    
    // Diffuse lighting
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // Specular lighting
    vec3 viewDir = normalize(u_cameraPosition - v_worldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    
    // Combine lighting
    vec3 ambient = u_ambientColor;
    vec3 diffuseColor = u_lightColor * diffuse;
    vec3 specularColor = u_lightColor * specular * 0.5;
    
    vec3 finalColor = u_color * (ambient + diffuseColor) + specularColor;
    
    fragColor = vec4(finalColor, 1.0);
}` : `precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPos;
varying vec2 v_texCoord;

uniform vec3 u_color;
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_cameraPosition;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(-u_lightDirection);
    
    // Diffuse lighting
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // Specular lighting
    vec3 viewDir = normalize(u_cameraPosition - v_worldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    
    // Combine lighting
    vec3 ambient = u_ambientColor;
    vec3 diffuseColor = u_lightColor * diffuse;
    vec3 specularColor = u_lightColor * specular * 0.5;
    
    vec3 finalColor = u_color * (ambient + diffuseColor) + specularColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

        // Compile and create shader program
        const basicProgram = this.createShaderProgram(basicVertexShader, basicFragmentShader);
        this.programs.set('basic', basicProgram);

        console.log('✅ Basic shaders created successfully');
    }
    
    /**
     * Create and compile a shader program
     */
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        // Compile vertex shader
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        if (!vertexShader) throw new Error('Failed to compile vertex shader');
        
        // Compile fragment shader
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        if (!fragmentShader) throw new Error('Failed to compile fragment shader');
        
        // Create program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        // Check for linking errors
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('Shader program linking failed: ' + error);
        }
        
        // Get attribute and uniform locations
        const programInfo = {
            program: program,
            attributes: {
                position: gl.getAttribLocation(program, 'a_position'),
                normal: gl.getAttribLocation(program, 'a_normal'),
                texCoord: gl.getAttribLocation(program, 'a_texCoord'),
            },
            uniforms: {
                modelMatrix: gl.getUniformLocation(program, 'u_modelMatrix'),
                viewMatrix: gl.getUniformLocation(program, 'u_viewMatrix'),
                projectionMatrix: gl.getUniformLocation(program, 'u_projectionMatrix'),
                normalMatrix: gl.getUniformLocation(program, 'u_normalMatrix'),
                color: gl.getUniformLocation(program, 'u_color'),
                lightDirection: gl.getUniformLocation(program, 'u_lightDirection'),
                lightColor: gl.getUniformLocation(program, 'u_lightColor'),
                ambientColor: gl.getUniformLocation(program, 'u_ambientColor'),
                cameraPosition: gl.getUniformLocation(program, 'u_cameraPosition'),
            }
        };
        
        return programInfo;
    }
    
    /**
     * Compile individual shader
     */
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            console.error('Shader compilation error:', error);
            console.error('Shader source:', source);
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Begin rendering frame
     */
    beginFrame() {
        const gl = this.gl;
        
        // Clear buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Reset stats
        this.stats.drawCalls = 0;
        this.stats.vertices = 0;
        this.stats.triangles = 0;
    }
    
    /**
     * Set camera matrices
     */
    setCamera(viewMatrix, projectionMatrix) {
        this.viewMatrix = viewMatrix;
        this.projectionMatrix = projectionMatrix;
    }
    
    /**
     * Use shader program
     */
    useProgram(programName) {
        const program = this.programs.get(programName);
        if (!program) {
            console.error(`Shader program '${programName}' not found`);
            return false;
        }
        
        this.gl.useProgram(program.program);
        this.currentProgram = program;
        
        // Set camera matrices
        this.gl.uniformMatrix4fv(program.uniforms.viewMatrix, false, this.viewMatrix.toFloat32Array());
        this.gl.uniformMatrix4fv(program.uniforms.projectionMatrix, false, this.projectionMatrix.toFloat32Array());
        
        return true;
    }
    
    /**
     * Render a simple cube (for initial testing)
     */
    renderCube(position = new Vector3(0, 0, 0), color = [0.2, 0.6, 1.0]) {
        if (!this.useProgram('basic')) return;
        
        const gl = this.gl;
        const program = this.currentProgram;
        
        // Create cube geometry if not already created
        if (!this.cubeBuffers) {
            this.cubeBuffers = this.createCubeBuffers();
        }
        
        // Set model matrix
        const modelMatrix = Matrix4.translation(position);
        gl.uniformMatrix4fv(program.uniforms.modelMatrix, false, modelMatrix.toFloat32Array());
        
        // Set normal matrix (inverse transpose of model matrix)
        const normalMatrix = modelMatrix.inverse().transpose();
        const normalMatrix3 = new Float32Array([
            normalMatrix.elements[0], normalMatrix.elements[1], normalMatrix.elements[2],
            normalMatrix.elements[4], normalMatrix.elements[5], normalMatrix.elements[6],
            normalMatrix.elements[8], normalMatrix.elements[9], normalMatrix.elements[10]
        ]);
        gl.uniformMatrix3fv(program.uniforms.normalMatrix, false, normalMatrix3);
        
        // Set material properties
        gl.uniform3fv(program.uniforms.color, color);
        gl.uniform3fv(program.uniforms.lightDirection, [0.5, -1.0, 0.3]);
        gl.uniform3fv(program.uniforms.lightColor, [1.0, 1.0, 1.0]);
        gl.uniform3fv(program.uniforms.ambientColor, [0.2, 0.2, 0.3]);
        gl.uniform3fv(program.uniforms.cameraPosition, [0, 0, 5]);
        
        // Bind vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.vertices);
        gl.enableVertexAttribArray(program.attributes.position);
        gl.vertexAttribPointer(program.attributes.position, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffers.normals);
        gl.enableVertexAttribArray(program.attributes.normal);
        gl.vertexAttribPointer(program.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        
        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeBuffers.indices);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        
        // Update stats
        this.stats.drawCalls++;
        this.stats.vertices += 8;
        this.stats.triangles += 12;
    }
    
    /**
     * Create cube geometry buffers
     */
    createCubeBuffers() {
        const gl = this.gl;
        
        // Cube vertices
        const vertices = new Float32Array([
            // Front face
            -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
            // Back face
            -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
            // Top face
            -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
            // Bottom face
            -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
            // Right face
             1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
            // Left face
            -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1
        ]);
        
        // Cube normals
        const normals = new Float32Array([
            // Front face
             0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
            // Back face
             0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
            // Top face
             0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
            // Bottom face
             0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
            // Right face
             1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
            // Left face
            -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0
        ]);
        
        // Cube indices
        const indices = new Uint16Array([
             0,  1,  2,   0,  2,  3,    // front
             4,  5,  6,   4,  6,  7,    // back
             8,  9, 10,   8, 10, 11,    // top
            12, 13, 14,  12, 14, 15,    // bottom
            16, 17, 18,  16, 18, 19,    // right
            20, 21, 22,  20, 22, 23     // left
        ]);
        
        // Create buffers
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
        console.log('📦 Cube geometry buffers created');
        
        return {
            vertices: vertexBuffer,
            normals: normalBuffer,
            indices: indexBuffer
        };
    }
    
    /**
     * Handle canvas resize
     */
    resize() {
        if (!this.gl) return;
        
        const gl = this.gl;
        const canvas = this.canvas;
        
        // Update viewport
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        // Update projection matrix for new aspect ratio
        const aspect = canvas.width / canvas.height;
        this.projectionMatrix = Matrix4.perspective(
            Math.PI / 4,  // 45 degrees FOV
            aspect,
            0.1,          // near
            100.0         // far
        );
        
        console.log(`📺 WebGL viewport updated: ${canvas.width}x${canvas.height}`);
    }
    
    /**
     * Get rendering statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        if (this.gl) {
            // Delete buffers
            if (this.cubeBuffers) {
                this.gl.deleteBuffer(this.cubeBuffers.vertices);
                this.gl.deleteBuffer(this.cubeBuffers.normals);
                this.gl.deleteBuffer(this.cubeBuffers.indices);
            }
            
            // Delete programs
            this.programs.forEach(program => {
                this.gl.deleteProgram(program.program);
            });
            
            this.programs.clear();
        }
        
        this.isInitialized = false;
        console.log('🧹 WebGL renderer disposed');
    }
}