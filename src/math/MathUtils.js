/**
 * MathUtils - General Mathematics Utilities
 * Common mathematical functions and constants for the ecosystem engine
 */

export class MathUtils {
    // Mathematical constants
    static PI = Math.PI;
    static TWO_PI = Math.PI * 2;
    static HALF_PI = Math.PI * 0.5;
    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;
    static EPSILON = 1e-6;
    static GOLDEN_RATIO = 1.618033988749895;

    // Basic utility functions
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static lerpUnclamped(a, b, t) {
        return a + (b - a) * t;
    }

    static inverseLerp(a, b, value) {
        if (Math.abs(a - b) < MathUtils.EPSILON) {
            return 0;
        }
        return (value - a) / (b - a);
    }

    static smoothStep(edge0, edge1, x) {
        const t = MathUtils.clamp01((x - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
    }

    static smootherStep(edge0, edge1, x) {
        const t = MathUtils.clamp01((x - edge0) / (edge1 - edge0));
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Angular functions
    static degToRad(degrees) {
        return degrees * MathUtils.DEG_TO_RAD;
    }

    static radToDeg(radians) {
        return radians * MathUtils.RAD_TO_DEG;
    }

    static normalizeAngle(angle) {
        while (angle > Math.PI) angle -= MathUtils.TWO_PI;
        while (angle < -Math.PI) angle += MathUtils.TWO_PI;
        return angle;
    }

    static normalizeAngleDegrees(angle) {
        while (angle > 180) angle -= 360;
        while (angle < -180) angle += 360;
        return angle;
    }

    static deltaAngle(current, target) {
        let delta = MathUtils.normalizeAngle(target - current);
        if (delta > Math.PI) delta -= MathUtils.TWO_PI;
        return delta;
    }

    static lerpAngle(a, b, t) {
        const delta = MathUtils.deltaAngle(a, b);
        return a + delta * MathUtils.clamp01(t);
    }

    // Comparison functions
    static approximately(a, b, epsilon = MathUtils.EPSILON) {
        return Math.abs(a - b) < epsilon;
    }

    static isZero(value, epsilon = MathUtils.EPSILON) {
        return Math.abs(value) < epsilon;
    }

    static sign(value) {
        return value > 0 ? 1 : value < 0 ? -1 : 0;
    }

    // Power and root functions
    static pow(base, exponent) {
        return Math.pow(base, exponent);
    }

    static sqrt(value) {
        return Math.sqrt(Math.max(0, value));
    }

    static inverseSqrt(value) {
        return 1 / Math.sqrt(Math.max(MathUtils.EPSILON, value));
    }

    // Trigonometric functions with safety
    static sin(angle) {
        return Math.sin(angle);
    }

    static cos(angle) {
        return Math.cos(angle);
    }

    static tan(angle) {
        return Math.tan(angle);
    }

    static asin(value) {
        return Math.asin(MathUtils.clamp(value, -1, 1));
    }

    static acos(value) {
        return Math.acos(MathUtils.clamp(value, -1, 1));
    }

    static atan2(y, x) {
        return Math.atan2(y, x);
    }

    // Random number generation
    static random() {
        return Math.random();
    }

    static randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    static randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    static randomBool() {
        return Math.random() < 0.5;
    }

    static randomSign() {
        return Math.random() < 0.5 ? -1 : 1;
    }

    static randomGaussian(mean = 0, stdDev = 1) {
        // Box-Muller transform
        static let hasSpare = false;
        static let spare = 0;
        
        if (hasSpare) {
            hasSpare = false;
            return spare * stdDev + mean;
        }
        
        hasSpare = true;
        const u = Math.random();
        const v = Math.random();
        const mag = stdDev * Math.sqrt(-2 * Math.log(u));
        spare = mag * Math.cos(MathUtils.TWO_PI * v);
        return mag * Math.sin(MathUtils.TWO_PI * v) + mean;
    }

    static randomWeighted(weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }
        
        return weights.length - 1;
    }

    // Easing functions
    static easeInQuad(t) {
        return t * t;
    }

    static easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }

    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    static easeInCubic(t) {
        return t * t * t;
    }

    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    static easeInQuart(t) {
        return t * t * t * t;
    }

    static easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    static easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    static easeInSine(t) {
        return 1 - Math.cos(t * MathUtils.HALF_PI);
    }

    static easeOutSine(t) {
        return Math.sin(t * MathUtils.HALF_PI);
    }

    static easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    static easeInExpo(t) {
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }

    static easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    static easeInOutExpo(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    }

    // Noise functions
    static noise1D(x) {
        // Simple 1D noise function
        x = Math.sin(x) * 43758.5453;
        return x - Math.floor(x);
    }

    static noise2D(x, y) {
        // Simple 2D noise function
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    static noise3D(x, y, z) {
        // Simple 3D noise function
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return n - Math.floor(n);
    }

    // Perlin noise implementation
    static perlinNoise(x, y = 0, z = 0) {
        // Simplified Perlin noise - for production use a proper implementation
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;
        
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const zf = z - Math.floor(z);
        
        const u = MathUtils.fade(xf);
        const v = MathUtils.fade(yf);
        const w = MathUtils.fade(zf);
        
        // Simple gradient function
        const grad = (hash, x, y, z) => {
            const h = hash & 15;
            const u = h < 8 ? x : y;
            const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        };
        
        // Simplified permutation table
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = Math.floor(Math.random() * 256);
        }
        for (let i = 0; i < 256; i++) {
            p[256 + i] = p[i];
        }
        
        const aaa = grad(p[xi + p[yi + p[zi]]], xf, yf, zf);
        const aba = grad(p[xi + p[yi + 1 + p[zi]]], xf, yf - 1, zf);
        const aab = grad(p[xi + p[yi + p[zi + 1]]], xf, yf, zf - 1);
        const abb = grad(p[xi + p[yi + 1 + p[zi + 1]]], xf, yf - 1, zf - 1);
        const baa = grad(p[xi + 1 + p[yi + p[zi]]], xf - 1, yf, zf);
        const bba = grad(p[xi + 1 + p[yi + 1 + p[zi]]], xf - 1, yf - 1, zf);
        const bab = grad(p[xi + 1 + p[yi + p[zi + 1]]], xf - 1, yf, zf - 1);
        const bbb = grad(p[xi + 1 + p[yi + 1 + p[zi + 1]]], xf - 1, yf - 1, zf - 1);
        
        const x1 = MathUtils.lerp(aaa, baa, u);
        const x2 = MathUtils.lerp(aba, bba, u);
        const y1 = MathUtils.lerp(x1, x2, v);
        
        const x3 = MathUtils.lerp(aab, bab, u);
        const x4 = MathUtils.lerp(abb, bbb, u);
        const y2 = MathUtils.lerp(x3, x4, v);
        
        return MathUtils.lerp(y1, y2, w);
    }

    static fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Ecosystem-specific mathematical functions
    static logisticGrowth(population, carryingCapacity, growthRate) {
        return growthRate * population * (1 - population / carryingCapacity);
    }

    static exponentialDecay(value, decayRate, deltaTime) {
        return value * Math.exp(-decayRate * deltaTime);
    }

    static sigmoid(x, steepness = 1, midpoint = 0) {
        return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
    }

    static gaussian(x, mean = 0, variance = 1) {
        const stdDev = Math.sqrt(variance);
        const coefficient = 1 / (stdDev * Math.sqrt(MathUtils.TWO_PI));
        const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
        return coefficient * Math.exp(exponent);
    }

    // Distance and spatial functions
    static distance2D(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static manhattanDistance2D(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    static manhattanDistance3D(x1, y1, z1, x2, y2, z2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1) + Math.abs(z2 - z1);
    }

    static chebyshevDistance2D(x1, y1, x2, y2) {
        return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    }

    static chebyshevDistance3D(x1, y1, z1, x2, y2, z2) {
        return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
    }

    // Array and statistical functions
    static arrayMin(arr) {
        return Math.min(...arr);
    }

    static arrayMax(arr) {
        return Math.max(...arr);
    }

    static arraySum(arr) {
        return arr.reduce((sum, val) => sum + val, 0);
    }

    static arrayAverage(arr) {
        return arr.length > 0 ? MathUtils.arraySum(arr) / arr.length : 0;
    }

    static arrayMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }

    static arrayVariance(arr) {
        const mean = MathUtils.arrayAverage(arr);
        const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
        return MathUtils.arrayAverage(squaredDiffs);
    }

    static arrayStandardDeviation(arr) {
        return Math.sqrt(MathUtils.arrayVariance(arr));
    }

    // Utility functions for ecosystem calculations
    static scaleRange(value, fromMin, fromMax, toMin, toMax) {
        const normalized = (value - fromMin) / (fromMax - fromMin);
        return toMin + normalized * (toMax - toMin);
    }

    static wrap(value, min, max) {
        const range = max - min;
        if (range <= 0) return min;
        
        while (value < min) value += range;
        while (value >= max) value -= range;
        return value;
    }

    static pingPong(value, length) {
        if (length === 0) return 0;
        
        value = Math.abs(value) % (length * 2);
        return value > length ? length * 2 - value : value;
    }

    // Performance optimized functions
    static fastSin(x) {
        // Fast sine approximation for performance-critical code
        x = MathUtils.normalizeAngle(x);
        const x2 = x * x;
        return x * (1 - x2 / 6 + x2 * x2 / 120);
    }

    static fastCos(x) {
        return MathUtils.fastSin(x + MathUtils.HALF_PI);
    }

    static fastSqrt(x) {
        // Fast square root approximation using Newton's method
        if (x <= 0) return 0;
        
        let guess = x;
        for (let i = 0; i < 3; i++) {
            guess = (guess + x / guess) * 0.5;
        }
        return guess;
    }

    static fastInverseSqrt(x) {
        // Fast inverse square root (Quake algorithm approximation)
        if (x <= 0) return 0;
        
        const threehalfs = 1.5;
        let x2 = x * 0.5;
        let y = x;
        
        // Evil floating point bit level hacking (approximation in JS)
        const i = Math.floor(Math.log2(y)) + 127;
        y = Math.pow(2, (127 - i) / 2);
        
        // Newton's method iterations
        y = y * (threehalfs - (x2 * y * y));
        y = y * (threehalfs - (x2 * y * y));
        
        return y;
    }

    // Spline and curve functions
    static catmullRom(t, p0, p1, p2, p3) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    }

    static bezierQuadratic(t, p0, p1, p2) {
        const invT = 1 - t;
        return invT * invT * p0 + 2 * invT * t * p1 + t * t * p2;
    }

    static bezierCubic(t, p0, p1, p2, p3) {
        const invT = 1 - t;
        const invT2 = invT * invT;
        const invT3 = invT2 * invT;
        const t2 = t * t;
        const t3 = t2 * t;
        
        return invT3 * p0 + 3 * invT2 * t * p1 + 3 * invT * t2 * p2 + t3 * p3;
    }

    // Hash functions for procedural generation
    static hash(n) {
        n = Math.sin(n) * 43758.5453123;
        return n - Math.floor(n);
    }

    static hash2D(x, y) {
        return MathUtils.hash(x * 12.9898 + y * 78.233);
    }

    static hash3D(x, y, z) {
        return MathUtils.hash(x * 12.9898 + y * 78.233 + z * 37.719);
    }

    // Color space conversions (for ecosystem visualization)
    static hslToRgb(h, s, l) {
        h = h % 360;
        s = MathUtils.clamp01(s);
        l = MathUtils.clamp01(l);
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        
        if (max === min) {
            return { h: 0, s: 0, l: l * 100 };
        }
        
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        let h;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    // Timing and frame rate utilities
    static deltaTime(lastTime, currentTime) {
        return (currentTime - lastTime) / 1000; // Convert to seconds
    }

    static fps(deltaTime) {
        return deltaTime > 0 ? 1 / deltaTime : 0;
    }

    static smoothFPS(currentFPS, newFPS, smoothing = 0.1) {
        return MathUtils.lerp(currentFPS, newFPS, smoothing);
    }

    // Physics helpers
    static springForce(position, target, springConstant, dampening = 0.9) {
        const displacement = target - position;
        return displacement * springConstant * dampening;
    }

    static friction(velocity, frictionCoefficient) {
        const speed = Math.abs(velocity);
        if (speed < MathUtils.EPSILON) return 0;
        
        const direction = velocity / speed;
        const frictionForce = Math.min(speed, frictionCoefficient);
        return -direction * frictionForce;
    }

    // Ecosystem balance calculations
    static populationPressure(currentPop, carryingCapacity) {
        if (carryingCapacity <= 0) return 1;
        return currentPop / carryingCapacity;
    }

    static predationRate(predatorPop, preyPop, efficiency = 1) {
        if (preyPop <= 0) return 0;
        return efficiency * predatorPop * preyPop / (preyPop + 1);
    }

    static competitionCoefficient(pop1, pop2, resourceOverlap = 1) {
        return resourceOverlap * pop1 * pop2 / (pop1 + pop2 + 1);
    }

    // Environmental gradient calculations
    static temperatureGradient(distance, sourceTemp, ambientTemp, falloff = 1) {
        const factor = Math.exp(-distance * falloff);
        return MathUtils.lerp(ambientTemp, sourceTemp, factor);
    }

    static humidityDiffusion(distance, sourceHumidity, ambientHumidity, diffusionRate = 0.5) {
        const factor = Math.exp(-distance * diffusionRate);
        return MathUtils.lerp(ambientHumidity, sourceHumidity, factor);
    }

    // Migration probability calculations
    static migrationProbability(populationPressure, environmentalSuitability, distance) {
        const pressureFactor = MathUtils.sigmoid(populationPressure - 1, 2);
        const suitabilityFactor = MathUtils.clamp01(environmentalSuitability);
        const distanceFactor = Math.exp(-distance * 0.1);
        
        return pressureFactor * suitabilityFactor * distanceFactor;
    }

    // Genetic diversity calculations
    static geneticDrift(populationSize, generations) {
        // Simplified model of genetic drift
        const effectivePopSize = Math.max(1, populationSize);
        return 1 - Math.exp(-generations / (2 * effectivePopSize));
    }

    static mutationRate(baseRate, environmentalStress) {
        return baseRate * (1 + environmentalStress);
    }

    // Resource distribution
    static resourceDecay(amount, decayRate, deltaTime) {
        return amount * Math.exp(-decayRate * deltaTime);
    }

    static resourceCompetition(resourceAmount, competitors) {
        if (competitors.length === 0) return resourceAmount;
        
        const totalDemand = competitors.reduce((sum, comp) => sum + comp.demand, 0);
        if (totalDemand <= resourceAmount) {
            return competitors.map(comp => comp.demand);
        }
        
        // Proportional distribution when resources are scarce
        const ratio = resourceAmount / totalDemand;
        return competitors.map(comp => comp.demand * ratio);
    }

    // Utility validation functions
    static isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }

    static sanitizeNumber(value, defaultValue = 0) {
        return MathUtils.isValidNumber(value) ? value : defaultValue;
    }

    static roundToPlaces(value, places) {
        const factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    }

    static formatNumber(value, places = 2) {
        return MathUtils.roundToPlaces(value, places).toFixed(places);
    }

    // Performance testing utilities
    static benchmark(func, iterations = 1000) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            func();
        }
        const end = performance.now();
        return {
            totalTime: end - start,
            averageTime: (end - start) / iterations,
            iterations: iterations
        };
    }

    // Debug and visualization helpers
    static mapToRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    static quantize(value, steps) {
        return Math.floor(value * steps) / steps;
    }

    static oscillate(time, frequency = 1, amplitude = 1, offset = 0) {
        return offset + amplitude * Math.sin(MathUtils.TWO_PI * frequency * time);
    }

    // Complex number operations (for advanced calculations)
    static complexAdd(a, b) {
        return { real: a.real + b.real, imag: a.imag + b.imag };
    }

    static complexMultiply(a, b) {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }

    static complexMagnitude(z) {
        return Math.sqrt(z.real * z.real + z.imag * z.imag);
    }

    // Final utility: Create a seeded random number generator
    static createSeededRandom(seed) {
        let state = seed % 2147483647;
        if (state <= 0) state += 2147483646;
        
        return {
            next() {
                state = (state * 16807) % 2147483647;
                return (state - 1) / 2147483646;
            },
            range(min, max) {
                return min + this.next() * (max - min);
            },
            int(min, max) {
                return Math.floor(this.range(min, max + 1));
            }
        };
    }
}