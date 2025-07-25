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

    // Private static variables for Box-Muller transform
    static _hasSpare = false;
    static _spare = 0;

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
        // Box-Muller transform using class static variables
        if (MathUtils._hasSpare) {
            MathUtils._hasSpare = false;
            return MathUtils._spare * stdDev + mean;
        }
        
        MathUtils._hasSpare = true;
        const u = Math.random();
        const v = Math.random();
        const mag = stdDev * Math.sqrt(-2 * Math.log(u));
        MathUtils._spare = mag * Math.cos(MathUtils.TWO_PI * v);
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
}