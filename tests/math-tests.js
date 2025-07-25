/**
 * Browser-based Math Library Tests
 * This file is imported by main.js for development mode testing
 */

import { Vector3 } from '../src/math/Vector3.js';
import { Matrix4 } from '../src/math/Matrix4.js';
import { Quaternion } from '../src/math/Quaternion.js';
import { MathUtils } from '../src/math/MathUtils.js';

// Simple test framework for browser
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
        console.log('🧮 Running browser math library tests...\n');
        
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

runner.test('MathUtils - Ecosystem Functions', function() {
    const pressure = MathUtils.populationPressure(50, 100);
    this.assertApprox(pressure, 0.5, 1e-6, 'Population pressure calculation failed');
    
    const decay = MathUtils.exponentialDecay(100, 0.1, 1);
    this.assertApprox(decay, 100 * Math.exp(-0.1), 1e-6, 'Exponential decay failed');
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

// Export the runner
export { runner };