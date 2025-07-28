/**
 * Camera - 3D Camera System with Orbit and WASD Controls
 * FINAL VERSION - Features true "fly-through" movement.
 */

import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { MathUtils } from '../math/MathUtils.js';
import { Keys } from '../core/InputManager.js';

export class Camera {
    constructor(canvas, inputManager) {
        this.canvas = canvas;
        this.inputManager = inputManager;
        
        // Camera parameters
        this.position = new Vector3(0, 5, 10);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);
        
        // Orbit controls (still used for looking around with the mouse)
        this.distance = 10; // This now primarily defines the distance to the initial target
        this.azimuth = 0;
        this.elevation = -0.3;
        this.minDistance = 2;
        this.maxDistance = 80;
        this.minElevation = -Math.PI / 2 + 0.01; // Prevent flipping
        this.maxElevation = Math.PI / 2 - 0.01; // Prevent flipping
        
        // Movement properties for WASD
        this.movementSpeed = 15.0; // Units per second
        
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
        
        console.log('🎮 Camera controls initialized. Use WASD/Arrows to move, Q/E for vertical, and Mouse to look.');
    }

    /**
     * Update loop for handling keyboard-based movement.
     * This is called by the Engine every frame.
     * @param {number} deltaTime - Time elapsed since the last frame.
     */
    update(deltaTime) {
        if (!this.inputManager) return;

        // 1. Get the true forward vector (the direction the camera is looking)
        const forward = this.target.subtract(this.position).normalize();

        // 2. Calculate the 'right' vector using a cross product. This is always
        //    perpendicular to the forward direction and the world's 'up' axis.
        const right = forward.cross(this.up).normalize();

        const moveDirection = new Vector3(0, 0, 0);
        let moved = false;

        // --- Handle Movement Input ---

        // Forward/Backward (W/S)
        if (this.inputManager.isKeyPressed(Keys.W) || this.inputManager.isKeyPressed(Keys.ARROW_UP)) {
            moveDirection.addInPlace(forward);
            moved = true;
        }
        if (this.inputManager.isKeyPressed(Keys.S) || this.inputManager.isKeyPressed(Keys.ARROW_DOWN)) {
            moveDirection.subtractInPlace(forward);
            moved = true;
        }
        // Strafe Left/Right (A/D)
        if (this.inputManager.isKeyPressed(Keys.A) || this.inputManager.isKeyPressed(Keys.ARROW_LEFT)) {
            moveDirection.subtractInPlace(right);
            moved = true;
        }
        if (this.inputManager.isKeyPressed(Keys.D) || this.inputManager.isKeyPressed(Keys.ARROW_RIGHT)) {
            moveDirection.addInPlace(right);
            moved = true;
        }
        // Move Up/Down (E/Q)
        if (this.inputManager.isKeyPressed(Keys.E)) {
            moveDirection.addInPlace(this.up); // Use the world up vector
            moved = true;
        }
        if (this.inputManager.isKeyPressed(Keys.Q)) {
            moveDirection.subtractInPlace(this.up); // Use the world up vector
            moved = true;
        }


        if (moved) {
            // 4. Normalize to prevent faster diagonal movement and apply speed.
            const movement = moveDirection.normalize().multiply(this.movementSpeed * deltaTime);

            // 5. Move BOTH the camera's position and its target by the same amount.
            //    This creates the "fly-through" effect.
            this.position.addInPlace(movement);
            this.target.addInPlace(movement);

            // 6. Recalculate the view matrix to reflect the new position and target.
            this.updateViewMatrix();
        }
    }
    
    /**
     * Update view matrix based on camera parameters.
     * For mouse orbit, it now updates the target's position relative to the camera.
     */
    updateViewMatrix() {
        // Calculate the target point based on the camera's position and orientation
        const cosElevation = Math.cos(this.elevation);
        const direction = new Vector3(
            cosElevation * Math.sin(this.azimuth),
            Math.sin(this.elevation),
            cosElevation * Math.cos(this.azimuth)
        );

        // The target is always `distance` units in front of the camera's position.
        this.target = this.position.add(direction.multiply(this.distance));
        
        // Create the final view matrix.
        this.viewMatrix = Matrix4.lookAt(this.position, this.target, this.up);
    }
    
    /**
     * Update projection matrix
     */
    updateProjectionMatrix() {
        if (this.canvas.height === 0) return; // Avoid division by zero
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = Matrix4.perspective(
            MathUtils.degToRad(60), // A wider FOV can feel better for FPS-style controls
            aspect,
            0.1,
            1000.0 // Increased far plane for large dungeons
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
     * The `rotate` method is now simpler. It just adjusts the orientation
     * angles, and `updateViewMatrix` will calculate the new target position.
     */
    rotate(deltaAzimuth, deltaElevation) {
        this.azimuth += deltaAzimuth;
        // Keep azimuth within a standard range
        this.azimuth = (this.azimuth + 2 * Math.PI) % (2 * Math.PI); 

        this.elevation = MathUtils.clamp(
            this.elevation + deltaElevation,
            this.minElevation,
            this.maxElevation
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
        this.position.set(0, 5, 10);
        this.azimuth = 0;
        this.elevation = -0.3;
        this.updateViewMatrix();
        
        console.log('📷 Camera reset to default position');
    }
    
    // Mouse event handlers
    onMouseDown(event) {
        this.isMouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        this.rotate(
            deltaX * this.mouseSensitivity,
            -deltaY * this.mouseSensitivity
        );
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
        this.canvas.style.cursor = 'grab';
    }
    
    /**
     * The `zoom` method now moves the camera position forward/backward.
     */
    onWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY * this.wheelSensitivity * 0.1;
        
        // Get the forward direction and move the camera along it
        const forward = this.target.subtract(this.position).normalize();
        const movement = forward.multiply(delta);

        this.position.addInPlace(movement);
        
        this.updateViewMatrix();
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
        const startPosition = this.position.clone();

        // Calculate target position based on current target
        const cosElev = Math.cos(targetElevation);
        const direction = new Vector3(
            cosElev * Math.sin(targetAzimuth),
            Math.sin(targetElevation),
            cosElev * Math.cos(targetAzimuth)
        );
        const endPosition = this.target.subtract(direction.multiply(targetDistance));
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = MathUtils.easeInOutCubic(progress);
            
            this.azimuth = MathUtils.lerp(startAzimuth, targetAzimuth, eased);
            this.elevation = MathUtils.lerp(startElevation, targetElevation, eased);
            this.position.lerpVectors(startPosition, endPosition, eased);
            
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
                this.animateTo(this.azimuth, Math.PI / 2 - 0.01, this.distance);
                break;
            case 'bottom':
                this.animateTo(this.azimuth, -Math.PI / 2 + 0.01, this.distance);
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
            distanceToTarget: this.position.distance(this.target),
            azimuth: MathUtils.radToDeg(this.azimuth),
            elevation: MathUtils.radToDeg(this.elevation)
        };
    }
}