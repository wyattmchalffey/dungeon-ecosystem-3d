/**
 * PerformanceMonitor - Track and analyze performance metrics
 * Provides detailed timing and memory statistics
 */

export class PerformanceMonitor {
    constructor() {
        // Frame timing
        this.frameStartTime = 0;
        this.frameEndTime = 0;
        this.deltaTime = 0;
        this.smoothDeltaTime = 0;
        
        // FPS tracking
        this.fps = 0;
        this.fpsHistory = new Array(60).fill(0);
        this.fpsHistoryIndex = 0;
        this.lastFpsUpdate = 0;
        
        // Performance marks
        this.marks = new Map();
        this.measures = new Map();
        
        // Statistics
        this.stats = {
            fps: 0,
            frameTime: 0,
            minFrameTime: Infinity,
            maxFrameTime: 0,
            avgFrameTime: 0,
            
            updateTime: 0,
            renderTime: 0,
            
            drawCalls: 0,
            triangles: 0,
            vertices: 0,
            
            memoryUsed: 0,
            memoryLimit: 0,
            
            entities: 0,
            activeEntities: 0
        };
        
        // Memory tracking (if available)
        this.supportsMemory = performance.memory !== undefined;
        
        // Frame counter for averaging
        this.frameCount = 0;
        this.accumulatedFrameTime = 0;
        
        // Update intervals
        this.statsUpdateInterval = 100; // Update stats every 100ms
        this.lastStatsUpdate = 0;
    }
    
    /**
     * Start frame timing
     */
    beginFrame() {
        this.frameStartTime = performance.now();
    }
    
    /**
     * End frame timing and update stats
     */
    endFrame() {
        this.frameEndTime = performance.now();
        this.deltaTime = this.frameEndTime - this.frameStartTime;
        
        // Smooth delta time using exponential moving average
        this.smoothDeltaTime = this.smoothDeltaTime * 0.9 + this.deltaTime * 0.1;
        
        // Update FPS history
        this.fpsHistory[this.fpsHistoryIndex] = 1000 / this.deltaTime;
        this.fpsHistoryIndex = (this.fpsHistoryIndex + 1) % this.fpsHistory.length;
        
        // Accumulate for averaging
        this.frameCount++;
        this.accumulatedFrameTime += this.deltaTime;
        
        // Update stats periodically
        const now = performance.now();
        if (now - this.lastStatsUpdate > this.statsUpdateInterval) {
            this.updateStats();
            this.lastStatsUpdate = now;
        }
    }
    
    /**
     * Mark a timing point
     */
    mark(name) {
        this.marks.set(name, performance.now());
    }
    
    /**
     * Measure between two marks or from mark to now
     */
    measure(name, startMark, endMark = null) {
        const startTime = this.marks.get(startMark);
        if (!startTime) {
            console.warn(`Performance mark '${startMark}' not found`);
            return 0;
        }
        
        const endTime = endMark ? this.marks.get(endMark) : performance.now();
        const duration = endTime - startTime;
        
        // Store measurement
        if (!this.measures.has(name)) {
            this.measures.set(name, {
                count: 0,
                total: 0,
                min: Infinity,
                max: 0,
                average: 0,
                last: 0
            });
        }
        
        const measure = this.measures.get(name);
        measure.count++;
        measure.total += duration;
        measure.min = Math.min(measure.min, duration);
        measure.max = Math.max(measure.max, duration);
        measure.average = measure.total / measure.count;
        measure.last = duration;
        
        return duration;
    }
    
    /**
     * Update performance statistics
     */
    updateStats() {
        // Calculate average FPS
        let fpsSum = 0;
        for (let i = 0; i < this.fpsHistory.length; i++) {
            fpsSum += this.fpsHistory[i];
        }
        this.stats.fps = Math.round(fpsSum / this.fpsHistory.length);
        
        // Frame time stats
        if (this.frameCount > 0) {
            this.stats.avgFrameTime = this.accumulatedFrameTime / this.frameCount;
            this.stats.frameTime = this.smoothDeltaTime;
            this.stats.minFrameTime = Math.min(this.stats.minFrameTime, this.deltaTime);
            this.stats.maxFrameTime = Math.max(this.stats.maxFrameTime, this.deltaTime);
        }
        
        // Memory stats
        if (this.supportsMemory) {
            this.stats.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
            this.stats.memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1048576); // MB
        }
        
        // Get specific timings if available
        const updateMeasure = this.measures.get('update');
        if (updateMeasure) {
            this.stats.updateTime = updateMeasure.average;
        }
        
        const renderMeasure = this.measures.get('render');
        if (renderMeasure) {
            this.stats.renderTime = renderMeasure.average;
        }
    }
    
    /**
     * Set rendering statistics
     */
    setRenderStats(drawCalls, triangles, vertices) {
        this.stats.drawCalls = drawCalls;
        this.stats.triangles = triangles;
        this.stats.vertices = vertices;
    }
    
    /**
     * Set entity statistics
     */
    setEntityStats(total, active) {
        this.stats.entities = total;
        this.stats.activeEntities = active;
    }
    
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Get all measurements
     */
    getMeasurements() {
        const measurements = {};
        
        for (const [name, measure] of this.measures) {
            measurements[name] = { ...measure };
        }
        
        return measurements;
    }
    
    /**
     * Reset statistics
     */
    reset() {
        this.frameCount = 0;
        this.accumulatedFrameTime = 0;
        this.stats.minFrameTime = Infinity;
        this.stats.maxFrameTime = 0;
        this.marks.clear();
        this.measures.clear();
        this.fpsHistory.fill(0);
        this.fpsHistoryIndex = 0;
    }
    
    /**
     * Log performance report
     */
    logReport() {
        console.group('📊 Performance Report');
        
        console.log('Frame Statistics:');
        console.log(`  FPS: ${this.stats.fps}`);
        console.log(`  Frame Time: ${this.stats.frameTime.toFixed(2)}ms`);
        console.log(`  Min/Max: ${this.stats.minFrameTime.toFixed(2)}ms / ${this.stats.maxFrameTime.toFixed(2)}ms`);
        console.log(`  Average: ${this.stats.avgFrameTime.toFixed(2)}ms`);
        
        if (this.supportsMemory) {
            console.log('\nMemory Usage:');
            console.log(`  Used: ${this.stats.memoryUsed}MB`);
            console.log(`  Limit: ${this.stats.memoryLimit}MB`);
            console.log(`  Usage: ${(this.stats.memoryUsed / this.stats.memoryLimit * 100).toFixed(1)}%`);
        }
        
        if (this.stats.drawCalls > 0) {
            console.log('\nRendering:');
            console.log(`  Draw Calls: ${this.stats.drawCalls}`);
            console.log(`  Triangles: ${this.stats.triangles}`);
            console.log(`  Vertices: ${this.stats.vertices}`);
        }
        
        if (this.measures.size > 0) {
            console.log('\nTiming Breakdown:');
            for (const [name, measure] of this.measures) {
                console.log(`  ${name}: ${measure.average.toFixed(2)}ms (${measure.count} calls)`);
            }
        }
        
        console.groupEnd();
    }
    
    /**
     * Create performance overlay UI
     */
    createOverlay(container) {
        const overlay = document.createElement('div');
        overlay.id = 'performance-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #0f0;
            pointer-events: none;
            z-index: 10000;
            min-width: 200px;
        `;
        
        container.appendChild(overlay);
        
        // Update overlay periodically
        setInterval(() => this.updateOverlay(overlay), 100);
        
        return overlay;
    }
    
    /**
     * Update performance overlay
     */
    updateOverlay(overlay) {
        const lines = [
            `FPS: ${this.stats.fps}`,
            `Frame: ${this.stats.frameTime.toFixed(1)}ms`,
            `Update: ${this.stats.updateTime.toFixed(1)}ms`,
            `Render: ${this.stats.renderTime.toFixed(1)}ms`,
            ''
        ];
        
        if (this.stats.drawCalls > 0) {
            lines.push(`Draw Calls: ${this.stats.drawCalls}`);
            lines.push(`Triangles: ${this.formatNumber(this.stats.triangles)}`);
            lines.push('');
        }
        
        if (this.supportsMemory) {
            lines.push(`Memory: ${this.stats.memoryUsed}MB`);
            lines.push('');
        }
        
        if (this.stats.entities > 0) {
            lines.push(`Entities: ${this.stats.activeEntities}/${this.stats.entities}`);
        }
        
        overlay.innerHTML = lines.join('<br>');
    }
    
    /**
     * Format large numbers with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Profile a function execution
     */
    profile(name, fn) {
        this.mark(`${name}_start`);
        const result = fn();
        this.measure(name, `${name}_start`);
        return result;
    }
    
    /**
     * Async profile a function execution
     */
    async profileAsync(name, fn) {
        this.mark(`${name}_start`);
        const result = await fn();
        this.measure(name, `${name}_start`);
        return result;
    }
}