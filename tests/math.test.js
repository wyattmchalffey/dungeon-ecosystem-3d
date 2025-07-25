/**
 * Jest Math Library Tests
 * Run with: npm test
 */

import { Vector3 } from '../src/math/Vector3.js';
import { Matrix4 } from '../src/math/Matrix4.js';
import { Quaternion } from '../src/math/Quaternion.js';
import { MathUtils } from '../src/math/MathUtils.js';

describe('Vector3', () => {
  test('basic operations', () => {
    const v1 = new Vector3(1, 2, 3);
    const v2 = new Vector3(4, 5, 6);
    
    const sum = v1.add(v2);
    expect(sum.x).toBe(5);
    expect(sum.y).toBe(7);
    expect(sum.z).toBe(9);
    
    const diff = v2.subtract(v1);
    expect(diff.x).toBe(3);
    expect(diff.y).toBe(3);
    expect(diff.z).toBe(3);
    
    const scaled = v1.multiply(2);
    expect(scaled.x).toBe(2);
    expect(scaled.y).toBe(4);
    expect(scaled.z).toBe(6);
  });

  test('dot and cross products', () => {
    const v1 = new Vector3(1, 0, 0);
    const v2 = new Vector3(0, 1, 0);
    
    const dot = v1.dot(v2);
    expect(dot).toBe(0);
    
    const cross = v1.cross(v2);
    expect(cross.equals(new Vector3(0, 0, 1))).toBe(true);
  });

  test('length and normalization', () => {
    const v = new Vector3(3, 4, 0);
    
    expect(v.length()).toBeCloseTo(5, 6);
    
    const normalized = v.normalize();
    expect(normalized.length()).toBeCloseTo(1, 6);
  });

  test('distance calculations', () => {
    const v1 = new Vector3(0, 0, 0);
    const v2 = new Vector3(3, 4, 0);
    
    expect(v1.distance(v2)).toBeCloseTo(5, 6);
    expect(v1.distanceSquared(v2)).toBeCloseTo(25, 6);
  });
});

describe('Matrix4', () => {
  test('identity and basic operations', () => {
    const identity = Matrix4.identity();
    const v = new Vector3(1, 2, 3);
    
    const transformed = identity.transformVector3(v);
    expect(transformed.equals(v)).toBe(true);
  });

  test('translation', () => {
    const translation = Matrix4.translation(new Vector3(5, 10, 15));
    const point = new Vector3(1, 2, 3);
    
    const transformed = translation.transformVector3(point);
    const expected = new Vector3(6, 12, 18);
    
    expect(transformed.equals(expected)).toBe(true);
  });

  test('scaling', () => {
    const scaling = Matrix4.scaling(new Vector3(2, 3, 4));
    const point = new Vector3(1, 1, 1);
    
    const transformed = scaling.transformVector3(point);
    const expected = new Vector3(2, 3, 4);
    
    expect(transformed.equals(expected)).toBe(true);
  });

  test('matrix multiplication', () => {
    const m1 = Matrix4.translation(new Vector3(1, 2, 3));
    const m2 = Matrix4.scaling(new Vector3(2, 2, 2));
    
    const combined = m1.multiply(m2);
    const point = new Vector3(1, 1, 1);
    
    const transformed = combined.transformVector3(point);
    const expected = new Vector3(3, 4, 5); // Scale then translate
    
    expect(transformed.equals(expected)).toBe(true);
  });

  test('matrix inverse', () => {
    const translation = Matrix4.translation(new Vector3(5, 10, 15));
    const inverse = translation.inverse();
    
    const combined = translation.multiply(inverse);
    const identity = Matrix4.identity();
    
    expect(combined.equals(identity, 1e-5)).toBe(true);
  });
});

describe('Quaternion', () => {
  test('identity and basic operations', () => {
    const identity = Quaternion.identity();
    const v = new Vector3(1, 2, 3);
    
    const rotated = identity.rotateVector3(v);
    expect(rotated.equals(v)).toBe(true);
  });

  test('axis-angle construction', () => {
    const axis = new Vector3(0, 0, 1);
    const angle = Math.PI / 2; // 90 degrees
    
    const quat = Quaternion.fromAxisAngle(axis, angle);
    const point = new Vector3(1, 0, 0);
    
    const rotated = quat.rotateVector3(point);
    const expected = new Vector3(0, 1, 0);
    
    expect(rotated.equals(expected, 1e-6)).toBe(true);
  });

  test('euler conversion', () => {
    const euler = new Vector3(0, 0, Math.PI / 2); // 90 degrees around Z
    const quat = Quaternion.fromEuler(euler.x, euler.y, euler.z);
    
    const point = new Vector3(1, 0, 0);
    const rotated = quat.rotateVector3(point);
    const expected = new Vector3(0, 1, 0);
    
    expect(rotated.equals(expected, 1e-6)).toBe(true);
  });

  test('normalization and length', () => {
    const quat = new Quaternion(1, 2, 3, 4);
    const normalized = quat.normalize();
    
    expect(normalized.length()).toBeCloseTo(1, 6);
  });

  test('inverse and conjugate', () => {
    const quat = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
    const inverse = quat.inverse();
    
    const combined = quat.multiply(inverse);
    const identity = Quaternion.identity();
    
    expect(combined.equals(identity, 1e-6)).toBe(true);
  });
});

describe('MathUtils', () => {
  test('basic functions', () => {
    expect(MathUtils.clamp(5, 0, 10)).toBe(5);
    expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
    expect(MathUtils.clamp(15, 0, 10)).toBe(10);
    
    expect(MathUtils.lerp(0, 10, 0.5)).toBeCloseTo(5, 6);
  });

  test('angular functions', () => {
    expect(MathUtils.degToRad(180)).toBeCloseTo(Math.PI, 6);
    expect(MathUtils.radToDeg(Math.PI)).toBeCloseTo(180, 6);
    
    const normalized = MathUtils.normalizeAngle(3 * Math.PI);
    expect(normalized).toBeCloseTo(Math.PI, 6);
  });

  test('random functions', () => {
    const rand1 = MathUtils.randomRange(5, 10);
    expect(rand1).toBeGreaterThanOrEqual(5);
    expect(rand1).toBeLessThanOrEqual(10);
    
    const randInt = MathUtils.randomInt(1, 5);
    expect(Number.isInteger(randInt)).toBe(true);
    expect(randInt).toBeGreaterThanOrEqual(1);
    expect(randInt).toBeLessThanOrEqual(5);
  });

  test('easing functions', () => {
    expect(MathUtils.easeInQuad(0)).toBeCloseTo(0, 6);
    expect(MathUtils.easeInQuad(1)).toBeCloseTo(1, 6);
    
    expect(MathUtils.smoothStep(0, 1, 0.5)).toBeCloseTo(0.5, 6);
  });

  test('ecosystem functions', () => {
    const pressure = MathUtils.populationPressure(50, 100);
    expect(pressure).toBeCloseTo(0.5, 6);
    
    const decay = MathUtils.exponentialDecay(100, 0.1, 1);
    expect(decay).toBeCloseTo(100 * Math.exp(-0.1), 6);
  });

  test('statistical functions', () => {
    const arr = [1, 2, 3, 4, 5];
    
    expect(MathUtils.arraySum(arr)).toBe(15);
    expect(MathUtils.arrayAverage(arr)).toBeCloseTo(3, 6);
    expect(MathUtils.arrayMedian(arr)).toBeCloseTo(3, 6);
  });
});

describe('Integration Tests', () => {
  test('vector and matrix transform chain', () => {
    const point = new Vector3(1, 0, 0);
    
    // Rotate 90 degrees around Z, then translate
    const rotation = Matrix4.rotationZ(Math.PI / 2);
    const translation = Matrix4.translation(new Vector3(5, 5, 5));
    const transform = translation.multiply(rotation);
    
    const result = transform.transformVector3(point);
    const expected = new Vector3(5, 6, 5);
    
    expect(result.equals(expected, 1e-6)).toBe(true);
  });

  test('quaternion and matrix consistency', () => {
    const axis = new Vector3(0, 1, 0);
    const angle = Math.PI / 3;
    
    const quat = Quaternion.fromAxisAngle(axis, angle);
    const matrix = quat.toMatrix4();
    
    const point = new Vector3(1, 0, 1);
    
    const quatResult = quat.rotateVector3(point);
    const matrixResult = matrix.transformVector3Direction(point);
    
    expect(quatResult.equals(matrixResult, 1e-5)).toBe(true);
  });

  test('ecosystem simulation math', () => {
    // Test a simple predator-prey calculation
    const preyPop = 100;
    const predatorPop = 10;
    const carryingCapacity = 150;
    
    const pressure = MathUtils.populationPressure(preyPop, carryingCapacity);
    const predation = MathUtils.predationRate(predatorPop, preyPop, 0.01);
    const growth = MathUtils.logisticGrowth(preyPop, carryingCapacity, 0.1);
    
    expect(pressure).toBeGreaterThan(0);
    expect(pressure).toBeLessThan(1);
    expect(predation).toBeGreaterThan(0);
    expect(growth).toBeGreaterThan(0);
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('vector operations should be fast', () => {
    const start = performance.now();
    
    // Run 10000 vector operations
    for (let i = 0; i < 10000; i++) {
      const v1 = new Vector3(Math.random(), Math.random(), Math.random());
      const v2 = new Vector3(Math.random(), Math.random(), Math.random());
      v1.add(v2).normalize();
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
  });

  test('matrix operations should be fast', () => {
    const start = performance.now();
    
    // Run 1000 matrix multiplications
    for (let i = 0; i < 1000; i++) {
      const m1 = Matrix4.rotationX(Math.random());
      const m2 = Matrix4.rotationY(Math.random());
      m1.multiply(m2);
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50); // Should complete in under 50ms
  });
});