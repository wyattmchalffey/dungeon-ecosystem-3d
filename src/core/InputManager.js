/**
 * InputManager - Centralized input handling
 * Manages keyboard, mouse, and touch input
 */

export class InputManager {
    constructor(element) {
        this.element = element;
        
        // Keyboard state
        this.keys = new Map();
        this.keyDownCallbacks = new Map();
        this.keyUpCallbacks = new Map();
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: new Set(),
            wheel: 0
        };
        this.mouseCallbacks = {
            down: new Map(),
            up: new Map(),
            move: new Map(),
            wheel: new Map()
        };
        
        // Touch state
        this.touches = new Map();
        this.touchCallbacks = {
            start: new Map(),
            end: new Map(),
            move: new Map()
        };
        
        // Initialize event listeners
        this.initializeEventListeners();
    }
    
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.element.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.element.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.element.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Prevent context menu
        this.element.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Update input state (called each frame)
     */
    update() {
        // Reset deltas
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    // Keyboard handling
    handleKeyDown(event) {
        const key = event.code;
        
        if (!this.keys.has(key)) {
            this.keys.set(key, true);
            
            // Trigger callbacks
            const callbacks = this.keyDownCallbacks.get(key);
            if (callbacks) {
                for (const callback of callbacks) {
                    callback(event);
                }
            }
        }
    }
    
    handleKeyUp(event) {
        const key = event.code;
        
        this.keys.delete(key);
        
        // Trigger callbacks
        const callbacks = this.keyUpCallbacks.get(key);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    /**
     * Check if key is currently pressed
     */
    isKeyPressed(key) {
        return this.keys.has(key);
    }
    
    /**
     * Register key down callback
     */
    onKeyDown(key, callback) {
        if (!this.keyDownCallbacks.has(key)) {
            this.keyDownCallbacks.set(key, new Set());
        }
        this.keyDownCallbacks.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.keyDownCallbacks.get(key)?.delete(callback);
        };
    }
    
    /**
     * Register key up callback
     */
    onKeyUp(key, callback) {
        if (!this.keyUpCallbacks.has(key)) {
            this.keyUpCallbacks.set(key, new Set());
        }
        this.keyUpCallbacks.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.keyUpCallbacks.get(key)?.delete(callback);
        };
    }
    
    // Mouse handling
    handleMouseDown(event) {
        this.mouse.buttons.add(event.button);
        
        const callbacks = this.mouseCallbacks.down.get(event.button);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    handleMouseUp(event) {
        this.mouse.buttons.delete(event.button);
        
        const callbacks = this.mouseCallbacks.up.get(event.button);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    handleMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.mouse.deltaX = x - this.mouse.x;
        this.mouse.deltaY = y - this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
        
        // Trigger move callbacks
        for (const [_, callbacks] of this.mouseCallbacks.move) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        this.mouse.wheel = event.deltaY;
        
        // Trigger wheel callbacks
        for (const [_, callbacks] of this.mouseCallbacks.wheel) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    /**
     * Check if mouse button is pressed
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttons.has(button);
    }
    
    /**
     * Register mouse callbacks
     */
    onMouseDown(button, callback) {
        if (!this.mouseCallbacks.down.has(button)) {
            this.mouseCallbacks.down.set(button, new Set());
        }
        this.mouseCallbacks.down.get(button).add(callback);
        
        return () => {
            this.mouseCallbacks.down.get(button)?.delete(callback);
        };
    }
    
    onMouseUp(button, callback) {
        if (!this.mouseCallbacks.up.has(button)) {
            this.mouseCallbacks.up.set(button, new Set());
        }
        this.mouseCallbacks.up.get(button).add(callback);
        
        return () => {
            this.mouseCallbacks.up.get(button)?.delete(callback);
        };
    }
    
    onMouseMove(callback) {
        const id = Symbol();
        if (!this.mouseCallbacks.move.has(id)) {
            this.mouseCallbacks.move.set(id, new Set());
        }
        this.mouseCallbacks.move.get(id).add(callback);
        
        return () => {
            this.mouseCallbacks.move.delete(id);
        };
    }
    
    onMouseWheel(callback) {
        const id = Symbol();
        if (!this.mouseCallbacks.wheel.has(id)) {
            this.mouseCallbacks.wheel.set(id, new Set());
        }
        this.mouseCallbacks.wheel.get(id).add(callback);
        
        return () => {
            this.mouseCallbacks.wheel.delete(id);
        };
    }
    
    // Touch handling
    handleTouchStart(event) {
        for (const touch of event.touches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            });
        }
        
        // Trigger callbacks
        for (const [_, callbacks] of this.touchCallbacks.start) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    handleTouchEnd(event) {
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
        }
        
        // Trigger callbacks
        for (const [_, callbacks] of this.touchCallbacks.end) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    handleTouchMove(event) {
        for (const touch of event.touches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }
        
        // Trigger callbacks
        for (const [_, callbacks] of this.touchCallbacks.move) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }
    
    /**
     * Register touch callbacks
     */
    onTouchStart(callback) {
        const id = Symbol();
        if (!this.touchCallbacks.start.has(id)) {
            this.touchCallbacks.start.set(id, new Set());
        }
        this.touchCallbacks.start.get(id).add(callback);
        
        return () => {
            this.touchCallbacks.start.delete(id);
        };
    }
    
    onTouchEnd(callback) {
        const id = Symbol();
        if (!this.touchCallbacks.end.has(id)) {
            this.touchCallbacks.end.set(id, new Set());
        }
        this.touchCallbacks.end.get(id).add(callback);
        
        return () => {
            this.touchCallbacks.end.delete(id);
        };
    }
    
    onTouchMove(callback) {
        const id = Symbol();
        if (!this.touchCallbacks.move.has(id)) {
            this.touchCallbacks.move.set(id, new Set());
        }
        this.touchCallbacks.move.get(id).add(callback);
        
        return () => {
            this.touchCallbacks.move.delete(id);
        };
    }
    
    /**
     * Get normalized mouse position (0-1)
     */
    getNormalizedMousePosition() {
        const rect = this.element.getBoundingClientRect();
        return {
            x: this.mouse.x / rect.width,
            y: this.mouse.y / rect.height
        };
    }
    
    /**
     * Clean up event listeners
     */
    dispose() {
        // Remove all event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
        this.element.removeEventListener('wheel', this.handleWheel);
        
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        
        // Clear all callbacks
        this.keyDownCallbacks.clear();
        this.keyUpCallbacks.clear();
        this.mouseCallbacks.down.clear();
        this.mouseCallbacks.up.clear();
        this.mouseCallbacks.move.clear();
        this.mouseCallbacks.wheel.clear();
        this.touchCallbacks.start.clear();
        this.touchCallbacks.end.clear();
        this.touchCallbacks.move.clear();
    }
}

// Common key codes for convenience
export const Keys = {
    // Letters
    A: 'KeyA', B: 'KeyB', C: 'KeyC', D: 'KeyD', E: 'KeyE',
    F: 'KeyF', G: 'KeyG', H: 'KeyH', I: 'KeyI', J: 'KeyJ',
    K: 'KeyK', L: 'KeyL', M: 'KeyM', N: 'KeyN', O: 'KeyO',
    P: 'KeyP', Q: 'KeyQ', R: 'KeyR', S: 'KeyS', T: 'KeyT',
    U: 'KeyU', V: 'KeyV', W: 'KeyW', X: 'KeyX', Y: 'KeyY',
    Z: 'KeyZ',
    
    // Numbers
    ZERO: 'Digit0', ONE: 'Digit1', TWO: 'Digit2', THREE: 'Digit3',
    FOUR: 'Digit4', FIVE: 'Digit5', SIX: 'Digit6', SEVEN: 'Digit7',
    EIGHT: 'Digit8', NINE: 'Digit9',
    
    // Function keys
    F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
    F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
    
    // Control keys
    ENTER: 'Enter',
    SPACE: 'Space',
    ESCAPE: 'Escape',
    BACKSPACE: 'Backspace',
    TAB: 'Tab',
    SHIFT_LEFT: 'ShiftLeft',
    SHIFT_RIGHT: 'ShiftRight',
    CTRL_LEFT: 'ControlLeft',
    CTRL_RIGHT: 'ControlRight',
    ALT_LEFT: 'AltLeft',
    ALT_RIGHT: 'AltRight',
    
    // Arrow keys
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight'
};

// Mouse buttons
export const MouseButtons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};