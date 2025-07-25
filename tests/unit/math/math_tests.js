/**
 * Unit Tests for Core Math Classes
 * Run these tests to verify the math foundation is working correctly
 */

import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';
import { Quaternion } from './Quaternion.js';
import { MathUtils } from './MathUtils.js';

// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFunc) {
        this.tests.push({ name, testFunc });
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertApprox(a, b, epsilon = 1e-6, message = '') {
        if (Math.abs(a - b) >= epsilon) {
            throw new Error(`${message} - Expected ${a} to approximately equal ${b}`);
        }
    }

    run() {
        console.log('Running math library tests...\n');
        
        for (const test of this.tests) {
            try {
                test.testFunc.call(this);
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Create test runner
const runner = new TestRunner();

// Vector3 Tests
runner.test('Vector3 - Basic Operations', function() {
    const v1 = new Vector3(1, 2, 3);
    const v2 = new Vector3(4, 5, 6);
    
    const sum = v1.add(v2);
    this.assert(sum.x === 5 && sum.y === 7 && sum.z === 9, 'Addition failed');
    
    const diff = v2.subtract(v1);
    this.assert(diff.x === 3 && diff.y === 3 && diff.z === 3, 'Subtraction failed');
    
    const scaled = v1.multiply(2);
    this.assert(scaled.x === 2 && scaled.y === 4 && scaled.z === 6, 'Scaling failed');
});

runner.test('Vector3 - Dot and Cross Products', function() {
    const v1 = new Vector3(1, 0, 0);
    const v2 = new Vector3(0, 1, 0);
    
    const dot = v1.dot(v2);
    this.assert(dot === 0, 'Dot product of perpendicular vectors should be 0');
    
    const cross = v1.cross(v2);
    this.assert(cross.equals(new Vector3(0, 0, 1)), 'Cross product failed');
});

runner.test('Vector3 - Length and Normalization', function() {
    const v = new Vector3(3, 4, 0);
    
    this.assertApprox(v.length(), 5, 1e-6, 'Length calculation failed');
    
    const normalized = v.normalize();
    this.assertApprox(normalized.length(), 1, 1e-6, 'Normalized vector should have unit length');
});

runner.test('Vector3 - Distance Calculations', function() {
    const v1 = new Vector3(0, 0, 0);
    const v2 = new Vector3(3, 4, 0);
    
    this.assertApprox(v1.distance(v2), 5, 1e-6, 'Distance calculation failed');
    this.assertApprox(v1.distanceSquared(v2), 25, 1e-6, 'Distance squared calculation failed');
});

// Matrix4 Tests
runner.test('Matrix4 - Identity and Basic Operations', function() {
    const identity = Matrix4.identity();
    const v = new Vector3(1, 2, 3);
    
    const transformed = identity.transformVector3(v);
    this.assert(transformed.equals(v), 'Identity matrix should not change vectors');
});

runner.test('Matrix4 - Translation', function() {
    const translation = Matrix4.translation(new Vector3(5, 10, 15));
    const point = new Vector3(1, 2, 3);
    
    const transformed = translation.transformVector3(point);
    const expected = new Vector3(6, 12, 18);
    
    this.assert(transformed.equals(expected), 'Translation failed');
});

runner.test('Matrix4 - Scaling', function() {
    const scaling = Matrix4.scaling(new Vector3(2, 3, 4));
    const point = new Vector3(1, 1, 1);
    
    const transformed = scaling.transformVector3(point);
    const expected = new Vector3(2, 3, 4);
    
    this.assert(transformed.equals(expected), 'Scaling failed');
});

runner.test('Matrix4 - Matrix Multiplication', function() {
    const m1 = Matrix4.translation(new Vector3(1, 2, 3));
    const m2 = Matrix4.scaling(new Vector3(2, 2, 2));
    
    const combined = m1.multiply(m2);
    const point = new Vector3(1, 1, 1);
    
    const transformed = combined.transformVector3(point);
    const expected = new Vector3(3, 4, 5); // Scale then translate
    
    this.assert(transformed.equals(expected), 'Matrix multiplication failed');
});

runner.test('Matrix4 - Inverse', function() {
    const translation = Matrix4.translation(new Vector3(5, 10, 15));
    const inverse = translation.inverse();
    
    const combined = translation.multiply(inverse);
    const identity = Matrix4.identity();
    
    this.assert(combined.equals(identity, 1e-5), 'Matrix inverse failed');
});

// Quaternion Tests
runner.test('Quaternion - Identity and Basic Operations', function() {
    const identity = Quaternion.identity();
    const v = new Vector3(1, 2, 3);
    
    const rotated = identity.rotateVector3(v);
    this.assert(rotated.equals(v), 'Identity quaternion should not change vectors');
});

runner.test('Quaternion - Axis-Angle Construction', function() {
    const axis = new Vector3(0, 0, 1);
    const angle = Math.PI / 2; // 90 degrees
    
    const quat = Quaternion.fromAxisAngle(axis, angle);
    const point = new Vector3(1, 0, 0);
    
    const rotated = quat.rotateVector3(point);
    const expected = new Vector3(0, 1, 0);
    
    this.assert(rotated.equals(expected, 1e-6), 'Axis-angle rotation failed');
});

runner.test('Quaternion - Euler Conversion', function() {
    const euler = new Vector3(0, 0, Math.PI / 2); // 90 degrees around Z
    const quat = Quaternion.fromEuler(euler.x, euler.y, euler.z);
    
    const point = new Vector3(1, 0, 0);
    const rotated = quat.rotateVector3(point);
    const expected = new Vector3(0, 1, 0);
    
    this.assert(rotated.equals(expected, 1e-6), 'Euler to quaternion conversion failed');
});

runner.test('Quaternion - Normalization and Length', function() {
    const quat = new Quaternion(1, 2, 3, 4);
    const normalized = quat.normalize();
    
    this.assertApprox(normalized.length(), 1, 1e-6, 'Normalized quaternion should have unit length');
});

runner.test('Quaternion - Inverse and Conjugate', function() {
    const quat = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
    const inverse = quat.inverse();
    
    const combined = quat.multiply(inverse);
    const identity = Quaternion.identity();
    
    this.assert(combined.equals(identity, 1e-6), 'Quaternion inverse failed');
});

// MathUtils Tests
runner.test('MathUtils - Basic Functions', function() {
    this.assert(MathUtils.clamp(5, 0, 10) === 5, 'Clamp within range failed');
    this.assert(MathUtils.clamp(-5, 0, 10) === 0, 'Clamp below range failed');
    this.assert(MathUtils.clamp(15, 0, 10) === 10, 'Clamp above range failed');
    
    this.assertApprox(MathUtils.lerp(0, 10, 0.5), 5, 1e-6, 'Linear interpolation failed');
});

runner.test('MathUtils - Angular Functions', function() {
    this.assertApprox(MathUtils.degToRad(180), Math.PI, 1e-6, 'Degrees to radians conversion failed');
    this.assertApprox(MathUtils.radToDeg(Math.PI), 180, 1e-6, 'Radians to degrees conversion failed');
    
    const normalized = MathUtils.normalizeAngle(3 * Math.PI);
    this.assertApprox(normalized, Math.PI, 1e-6, 'Angle normalization failed');
});

runner.test('MathUtils - Random Functions', function() {
    const rand1 = MathUtils.randomRange(5, 10);
    this.assert(rand1 >= 5 && rand1 <= 10, 'Random range failed');
    
    const randInt = MathUtils.randomInt(1, 5);
    this.assert(Number.isInteger(randInt) && randInt >= 1 && randInt <= 5, 'Random integer failed');
});

runner.test('MathUtils - Easing Functions', function() {
    this.assertApprox(MathUtils.easeInQuad(0), 0, 1e-6, 'Ease in quad at 0 failed');
    this.assertApprox(MathUtils.easeInQuad(1), 1, 1e-6, 'Ease in quad at 1 failed');
    
    this.assertApprox(MathUtils.smoothStep(0, 1, 0.5), 0.5, 1e-6, 'Smooth step failed');
});

runner.test('MathUtils - Ecosystem Functions', function() {
    const pressure = MathUtils.populationPressure(50, 100);
    this.assertApprox(pressure, 0.5, 1e-6, 'Population pressure calculation failed');
    
    const decay = MathUtils.exponentialDecay(100, 0.1, 1);
    this.assertApprox(decay, 100 * Math.exp(-0.1), 1e-6, 'Exponential decay failed');
});

runner.test('MathUtils - Statistical Functions', function() {
    const arr = [1, 2, 3, 4, 5];
    
    this.assert(MathUtils.arraySum(arr) === 15, 'Array sum failed');
    this.assertApprox(MathUtils.arrayAverage(arr), 3, 1e-6, 'Array average failed');
    this.assertApprox(MathUtils.arrayMedian(arr), 3, 1e-6, 'Array median failed');
});

// Integration Tests
runner.test('Integration - Vector and Matrix Transform Chain', function() {
    const point = new Vector3(1, 0, 0);
    
    // Rotate 90 degrees around Z, then translate
    const rotation = Matrix4.rotationZ(Math.PI / 2);
    const translation = Matrix4.translation(new Vector3(5, 5, 5));
    const transform = translation.multiply(rotation);
    
    const result = transform.transformVector3(point);
    const expected = new Vector3(5, 6, 5);
    
    this.assert(result.equals(expected, 1e-6), 'Vector-matrix transform chain failed');
});

runner.test('Integration - Quaternion and Matrix Consistency', function() {
    const axis = new Vector3(0, 1, 0);
    const angle = Math.PI / 3;
    
    const quat = Quaternion.fromAxisAngle(axis, angle);
    const matrix = quat.toMatrix4();
    
    const point = new Vector3(1, 0, 1);
    
    const quatResult = quat.rotateVector3(point);
    const matrixResult = matrix.transformVector3Direction(point);
    
    this.assert(quatResult.equals(matrixResult, 1e-5), 'Quaternion and matrix rotation inconsistent');
});

runner.test('Integration - Ecosystem Simulation Math', function() {
    // Test a simple predator-prey calculation
    const preyPop = 100;
    const predatorPop = 10;
    const carryingCapacity = 150;
    
    const pressure = MathUtils.populationPressure(preyPop, carryingCapacity);
    const predation = MathUtils.predationRate(predatorPop, preyPop, 0.01);
    const growth = MathUtils.logisticGrowth(preyPop, carryingCapacity, 0.1);
    
    this.assert(pressure > 0 && pressure < 1, 'Population pressure out of expected range');
    this.assert(predation > 0, 'Predation rate should be positive');
    this.assert(growth > 0, 'Population growth should be positive');
});

// Run all tests
console.log('='.repeat(50));
console.log('DUNGEON ECOSYSTEM ENGINE - MATH LIBRARY TESTS');
console.log('='.repeat(50));

const success = runner.run();

if (success) {
    console.log('\n🎉 All tests passed! Math foundation is ready.');
    console.log('Next step: Implement WebGL context and basic rendering.');
} else {
    console.log('\n⚠️  Some tests failed. Fix these issues before proceeding.');
}

export { runner };