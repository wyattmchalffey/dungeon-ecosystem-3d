/**
 * Camera - 3D Camera System with Orbit Controls
 * Handles view matrices and mouse-driven camera controls
 */

import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { MathUtils } from '../math/MathUtils.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Camera parameters
        this.position = new Vector3(0, 0, 5);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);
        
        // Orbit controls
        this.distance = 5;
        this.azimuth = 0;        // Horizontal rotation (radians)
        this.elevation = 0;      // Vertical rotation (radians)
        this.minDistance = 1;
        this.maxDistance = 20;
        this.minElevation = -Math.PI / 2 + 0.1;
        this.maxElevation = Math.PI / 2 - 0.1;
        
        // Mouse interaction
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseSensitivity = 0.005;
        this.wheelSensitivity = 0.1;
        
        // Matrices
        this.viewMatrix = Matrix4.identity();
        this.projectionMatrix = Matrix4.identity();
        
        // Setup controls
        this.setupControls();
        
        // Initialize matrices
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }
    
    /**
     * Set up mouse and keyboard controls
     */
    setupControls() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Set initial cursor
        this.canvas.style.cursor = 'grab';
        
        console.log('🎮 Camera controls initialized');
    }
    
    /**
     * Update view matrix based on orbit parameters
     */
    updateViewMatrix() {
        // Calculate position from spherical coordinates
        const cosElevation = Math.cos(this.elevation);
        this.position.set(
            this.target.x + this.distance * cosElevation * Math.sin(this.azimuth),
            this.target.y + this.distance * Math.sin(this.elevation),
            this.target.z + this.distance * cosElevation * Math.cos(this.azimuth)
        );
        
        // Create view matrix
        this.viewMatrix = Matrix4.lookAt(this.position, this.target, this.up);
    }
    
    /**
     * Update projection matrix
     */
    updateProjectionMatrix() {
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = Matrix4.perspective(
            MathUtils.degToRad(45), // 45 degree FOV
            aspect,
            0.1,    // near
            100.0   // far
        );
    }
    
    /**
     * Get current view matrix
     */
    getViewMatrix() {
        return this.viewMatrix;
    }
    
    /**
     * Get current projection matrix
     */
    getProjectionMatrix() {
        return this.projectionMatrix;
    }
    
    /**
     * Get camera position
     */
    getPosition() {
        return this.position.clone();
    }
    
    /**
     * Set camera target
     */
    setTarget(target) {
        this.target = target.clone();
        this.updateViewMatrix();
    }
    
    /**
     * Set camera distance
     */
    setDistance(distance) {
        this.distance = MathUtils.clamp(distance, this.minDistance, this.maxDistance);
        this.updateViewMatrix();
    }
    
    /**
     * Rotate camera around target
     */
    rotate(deltaAzimuth, deltaElevation) {
        this.azimuth += deltaAzimuth;
        this.elevation = MathUtils.clamp(
            this.elevation + deltaElevation,
            this.minElevation,
            this.maxElevation
        );
        
        this.updateViewMatrix();
    }
    
    /**
     * Zoom camera in/out
     */
    zoom(delta) {
        this.distance = MathUtils.clamp(
            this.distance * (1 + delta),
            this.minDistance,
            this.maxDistance
        );
        
        this.updateViewMatrix();
    }
    
    /**
     * Handle canvas resize
     */
    resize() {
        this.updateProjectionMatrix();
        console.log('📷 Camera projection updated for new aspect ratio');
    }
    
    /**
     * Reset camera to default position
     */
    reset() {
        this.distance = 5;
        this.azimuth = 0;
        this.elevation = 0;
        this.target.set(0, 0, 0);
        this.updateViewMatrix();
        
        console.log('📷 Camera reset to default position');
    }
    
    // Mouse event handlers
    onMouseDown(event) {
        this.isMouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        // Change cursor
        this.canvas.style.cursor = 'grabbing';
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        // Rotate camera
        this.rotate(
            deltaX * this.mouseSensitivity,
            -deltaY * this.mouseSensitivity
        );
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
        
        // Reset cursor
        this.canvas.style.cursor = 'grab';
    }
    
    onWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY * this.wheelSensitivity * 0.001;
        this.zoom(delta);
    }
    
    // Touch event handlers (for mobile)
    onTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.isMouseDown = true;
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        
        if (!this.isMouseDown || event.touches.length !== 1) return;
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - this.lastMouseX;
        const deltaY = touch.clientY - this.lastMouseY;
        
        // Rotate camera
        this.rotate(
            deltaX * this.mouseSensitivity,
            -deltaY * this.mouseSensitivity
        );
        
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.isMouseDown = false;
    }
    
    /**
     * Set up smooth camera animations
     */
    animateTo(targetAzimuth, targetElevation, targetDistance, duration = 1000) {
        const startAzimuth = this.azimuth;
        const startElevation = this.elevation;
        const startDistance = this.distance;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use smooth easing
            const eased = MathUtils.easeInOutCubic(progress);
            
            this.azimuth = MathUtils.lerp(startAzimuth, targetAzimuth, eased);
            this.elevation = MathUtils.lerp(startElevation, targetElevation, eased);
            this.distance = MathUtils.lerp(startDistance, targetDistance, eased);
            
            this.updateViewMatrix();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Set camera to predefined views
     */
    setView(viewName) {
        switch (viewName) {
            case 'front':
                this.animateTo(0, 0, this.distance);
                break;
            case 'back':
                this.animateTo(Math.PI, 0, this.distance);
                break;
            case 'left':
                this.animateTo(-Math.PI / 2, 0, this.distance);
                break;
            case 'right':
                this.animateTo(Math.PI / 2, 0, this.distance);
                break;
            case 'top':
                this.animateTo(0, Math.PI / 2 - 0.1, this.distance);
                break;
            case 'bottom':
                this.animateTo(0, -Math.PI / 2 + 0.1, this.distance);
                break;
            case 'isometric':
                this.animateTo(Math.PI / 4, Math.PI / 6, this.distance);
                break;
            default:
                console.warn(`Unknown view: ${viewName}`);
        }
    }
    
    /**
     * Get camera information for debugging
     */
    getInfo() {
        return {
            position: this.position.toArray(),
            target: this.target.toArray(),
            distance: this.distance,
            azimuth: MathUtils.radToDeg(this.azimuth),
            elevation: MathUtils.radToDeg(this.elevation)
        };
    }
}