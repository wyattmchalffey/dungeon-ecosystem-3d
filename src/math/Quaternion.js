/**
 * Quaternion - Quaternion Mathematics for 3D Rotations
 * Efficient rotation representation without gimbal lock
 */

import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';

export class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    // Static factory methods
    static identity() {
        return new Quaternion(0, 0, 0, 1);
    }

    static fromAxisAngle(axis, angle) {
        const halfAngle = angle * 0.5;
        const s = Math.sin(halfAngle);
        const normalizedAxis = axis.normalize();
        
        return new Quaternion(
            normalizedAxis.x * s,
            normalizedAxis.y * s,
            normalizedAxis.z * s,
            Math.cos(halfAngle)
        );
    }

    static fromEuler(x, y, z, order = 'XYZ') {
        const cx = Math.cos(x * 0.5);
        const cy = Math.cos(y * 0.5);
        const cz = Math.cos(z * 0.5);
        const sx = Math.sin(x * 0.5);
        const sy = Math.sin(y * 0.5);
        const sz = Math.sin(z * 0.5);

        switch (order) {
            case 'XYZ':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'YXZ':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            case 'ZXY':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'ZYX':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            case 'YZX':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'XZY':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            default:
                throw new Error(`Unknown rotation order: ${order}`);
        }
    }

    static fromMatrix4(m) {
        const e = m.elements;
        const m11 = e[0], m12 = e[4], m13 = e[8];
        const m21 = e[1], m22 = e[5], m23 = e[9];
        const m31 = e[2], m32 = e[6], m33 = e[10];

        const trace = m11 + m22 + m33;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            return new Quaternion(
                (m32 - m23) * s,
                (m13 - m31) * s,
                (m21 - m12) * s,
                0.25 / s
            );
        } else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            return new Quaternion(
                0.25 * s,
                (m12 + m21) / s,
                (m13 + m31) / s,
                (m32 - m23) / s
            );
        } else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            return new Quaternion(
                (m12 + m21) / s,
                0.25 * s,
                (m23 + m32) / s,
                (m13 - m31) / s
            );
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            return new Quaternion(
                (m13 + m31) / s,
                (m23 + m32) / s,
                0.25 * s,
                (m21 - m12) / s
            );
        }
    }

    static fromLookDirection(forward, up = Vector3.up()) {
        const right = up.cross(forward).normalize();
        const recalcUp = forward.cross(right).normalize();
        
        const m = Matrix4.fromValues(
            right.x, recalcUp.x, forward.x, 0,
            right.y, recalcUp.y, forward.y, 0,
            right.z, recalcUp.z, forward.z, 0,
            0, 0, 0, 1
        );
        
        return Quaternion.fromMatrix4(m);
    }

    static lookRotation(forward, up = Vector3.up()) {
        return Quaternion.fromLookDirection(forward.normalize(), up.normalize());
    }

    // Basic operations
    add(q) {
        return new Quaternion(this.x + q.x, this.y + q.y, this.z + q.z, this.w + q.w);
    }

    subtract(q) {
        return new Quaternion(this.x - q.x, this.y - q.y, this.z - q.z, this.w - q.w);
    }

    multiply(q) {
        if (typeof q === 'number') {
            return new Quaternion(this.x * q, this.y * q, this.z * q, this.w * q);
        }
        
        return new Quaternion(
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        );
    }

    // In-place operations
    addInPlace(q) {
        this.x += q.x;
        this.y += q.y;
        this.z += q.z;
        this.w += q.w;
        return this;
    }

    subtractInPlace(q) {
        this.x -= q.x;
        this.y -= q.y;
        this.z -= q.z;
        this.w -= q.w;
        return this;
    }

    multiplyInPlace(q) {
        if (typeof q === 'number') {
            this.x *= q;
            this.y *= q;
            this.z *= q;
            this.w *= q;
        } else {
            const x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
            const y = this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x;
            const z = this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w;
            const w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;
            
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        return this;
    }

    // Quaternion properties
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    normalize() {
        const len = this.length();
        if (len === 0) {
            return new Quaternion(0, 0, 0, 1);
        }
        const inv = 1 / len;
        return new Quaternion(this.x * inv, this.y * inv, this.z * inv, this.w * inv);
    }

    normalizeInPlace() {
        const len = this.length();
        if (len === 0) {
            this.x = this.y = this.z = 0;
            this.w = 1;
            return this;
        }
        const inv = 1 / len;
        this.x *= inv;
        this.y *= inv;
        this.z *= inv;
        this.w *= inv;
        return this;
    }

    conjugate() {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    conjugateInPlace() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    inverse() {
        const lenSq = this.lengthSquared();
        if (lenSq === 0) {
            return new Quaternion(0, 0, 0, 1);
        }
        const inv = 1 / lenSq;
        return new Quaternion(-this.x * inv, -this.y * inv, -this.z * inv, this.w * inv);
    }

    inverseInPlace() {
        const lenSq = this.lengthSquared();
        if (lenSq === 0) {
            this.x = this.y = this.z = 0;
            this.w = 1;
            return this;
        }
        const inv = 1 / lenSq;
        this.x *= -inv;
        this.y *= -inv;
        this.z *= -inv;
        this.w *= inv;
        return this;
    }

    dot(q) {
        return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
    }

    // Rotation operations
    rotateVector3(v) {
        // Efficient vector rotation: v' = q * v * q^-1
        const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
        const vx = v.x, vy = v.y, vz = v.z;

        // Calculate quat * vector
        const ix = qw * vx + qy * vz - qz * vy;
        const iy = qw * vy + qz * vx - qx * vz;
        const iz = qw * vz + qx * vy - qy * vx;
        const iw = -qx * vx - qy * vy - qz * vz;

        // Calculate result * inverse quat
        return new Vector3(
            ix * qw + iw * -qx + iy * -qz - iz * -qy,
            iy * qw + iw * -qy + iz * -qx - ix * -qz,
            iz * qw + iw * -qz + ix * -qy - iy * -qx
        );
    }

    // Interpolation
    lerp(q, t) {
        const invT = 1 - t;
        return new Quaternion(
            this.x * invT + q.x * t,
            this.y * invT + q.y * t,
            this.z * invT + q.z * t,
            this.w * invT + q.w * t
        ).normalize();
    }

    slerp(q, t) {
        let dot = this.dot(q);
        
        // If the dot product is negative, slerp won't take the shorter path
        let q2 = q;
        if (dot < 0) {
            q2 = q.multiply(-1);
            dot = -dot;
        }
        
        // If the inputs are too close for comfort, linearly interpolate
        if (dot > 0.9995) {
            return this.lerp(q2, t);
        }
        
        const theta0 = Math.acos(Math.abs(dot));
        const theta = theta0 * t;
        const sinTheta = Math.sin(theta);
        const sinTheta0 = Math.sin(theta0);
        
        const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
        const s1 = sinTheta / sinTheta0;
        
        return this.multiply(s0).add(q2.multiply(s1));
    }

    // Conversion methods
    toAxisAngle() {
        if (this.w > 1) {
            this.normalizeInPlace();
        }
        
        const angle = 2 * Math.acos(this.w);
        const s = Math.sqrt(1 - this.w * this.w);
        
        if (s < 1e-6) {
            // Avoid division by zero
            return {
                axis: new Vector3(1, 0, 0),
                angle: 0
            };
        }
        
        return {
            axis: new Vector3(this.x / s, this.y / s, this.z / s),
            angle: angle
        };
    }

    toEuler(order = 'XYZ') {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        switch (order) {
            case 'XYZ':
                return new Vector3(
                    Math.atan2(2 * (yz + wx), 1 - 2 * (xx + yy)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (xz - wy)))),
                    Math.atan2(2 * (xy + wz), 1 - 2 * (yy + zz))
                );
            case 'YXZ':
                return new Vector3(
                    Math.asin(Math.max(-1, Math.min(1, 2 * (yz - wx)))),
                    Math.atan2(2 * (xz + wy), 1 - 2 * (xx + yy)),
                    Math.atan2(2 * (xy + wz), 1 - 2 * (xx + zz))
                );
            case 'ZXY':
                return new Vector3(
                    Math.atan2(2 * (yz + wx), 1 - 2 * (xx + zz)),
                    Math.atan2(2 * (xz + wy), 1 - 2 * (yy + zz)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (xy - wz))))
                );
            case 'ZYX':
                return new Vector3(
                    Math.atan2(2 * (yz + wx), 1 - 2 * (xx + yy)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (xz - wy)))),
                    Math.atan2(2 * (xy + wz), 1 - 2 * (yy + zz))
                );
            case 'YZX':
                return new Vector3(
                    Math.atan2(2 * (yz - wx), 1 - 2 * (yy + zz)),
                    Math.atan2(2 * (xz - wy), 1 - 2 * (xx + zz)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (xy + wz))))
                );
            case 'XZY':
                return new Vector3(
                    Math.asin(Math.max(-1, Math.min(1, 2 * (yz + wx)))),
                    Math.atan2(2 * (xz - wy), 1 - 2 * (xx + zz)),
                    Math.atan2(2 * (xy - wz), 1 - 2 * (xx + yy))
                );
            default:
                throw new Error(`Unknown rotation order: ${order}`);
        }
    }

    toMatrix4() {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        return Matrix4.fromValues(
            1 - (yy + zz), xy - wz, xz + wy, 0,
            xy + wz, 1 - (xx + zz), yz - wx, 0,
            xz - wy, yz + wx, 1 - (xx + yy), 0,
            0, 0, 0, 1
        );
    }

    // Comparison methods
    equals(q, epsilon = 1e-6) {
        return Math.abs(this.x - q.x) < epsilon &&
               Math.abs(this.y - q.y) < epsilon &&
               Math.abs(this.z - q.z) < epsilon &&
               Math.abs(this.w - q.w) < epsilon;
    }

    isIdentity(epsilon = 1e-6) {
        return Math.abs(this.x) < epsilon &&
               Math.abs(this.y) < epsilon &&
               Math.abs(this.z) < epsilon &&
               Math.abs(Math.abs(this.w) - 1) < epsilon;
    }

    // Utility methods
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    copy(q) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }

    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    }

    static fromArray(arr) {
        return new Quaternion(arr[0] || 0, arr[1] || 0, arr[2] || 0, arr[3] !== undefined ? arr[3] : 1);
    }

    toString() {
        return `Quaternion(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.w.toFixed(3)})`;
    }

    // Advanced rotation utilities
    static angleAxis(angle, axis) {
        return Quaternion.fromAxisAngle(axis, angle);
    }

    static rotationBetween(from, to) {
        const fromNorm = from.normalize();
        const toNorm = to.normalize();
        
        const dot = fromNorm.dot(toNorm);
        
        // Vectors are nearly opposite
        if (dot < -0.999999) {
            // Find an axis perpendicular to from
            let axis = Vector3.up().cross(fromNorm);
            if (axis.lengthSquared() < 1e-6) {
                axis = Vector3.right().cross(fromNorm);
            }
            axis.normalizeInPlace();
            return Quaternion.fromAxisAngle(axis, Math.PI);
        }
        
        // Vectors are nearly the same
        if (dot > 0.999999) {
            return Quaternion.identity();
        }
        
        const axis = fromNorm.cross(toNorm);
        const w = 1 + dot;
        
        return new Quaternion(axis.x, axis.y, axis.z, w).normalize();
    }

    // Swing-twist decomposition (useful for constraints)
    swingTwist(twistAxis) {
        const projection = new Vector3(
            this.x * twistAxis.x + this.y * twistAxis.y + this.z * twistAxis.z,
            this.w
        );
        
        const twist = new Quaternion(
            twistAxis.x * projection.x,
            twistAxis.y * projection.x,
            twistAxis.z * projection.x,
            projection.y
        ).normalize();
        
        const swing = this.multiply(twist.inverse());
        
        return { swing, twist };
    }

    // Ecosystem-specific utilities for creature orientation
    static randomRotation() {
        // Generate uniform random rotation
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        
        const sqrt1MinusU1 = Math.sqrt(1 - u1);
        const sqrtU1 = Math.sqrt(u1);
        const twoPiU2 = 2 * Math.PI * u2;
        const twoPiU3 = 2 * Math.PI * u3;
        
        return new Quaternion(
            sqrt1MinusU1 * Math.sin(twoPiU2),
            sqrt1MinusU1 * Math.cos(twoPiU2),
            sqrtU1 * Math.sin(twoPiU3),
            sqrtU1 * Math.cos(twoPiU3)
        );
    }

    // Creature movement helpers
    static fromDirection(direction, up = Vector3.up()) {
        if (direction.lengthSquared() < 1e-6) {
            return Quaternion.identity();
        }
        return Quaternion.lookRotation(direction, up);
    }

    // Smooth rotation towards target (for AI)
    rotateTowards(target, maxRadians) {
        const angle = this.angle(target);
        if (angle < 1e-6) return target.clone();
        
        const t = Math.min(1, maxRadians / angle);
        return this.slerp(target, t);
    }

    angle(other) {
        const dot = Math.abs(this.dot(other));
        return Math.acos(Math.min(1, dot)) * 2;
    }

    // Environmental rotation helpers
    static fromUpDirection(up) {
        if (up.equals(Vector3.up())) {
            return Quaternion.identity();
        }
        if (up.equals(Vector3.up().negate())) {
            return Quaternion.fromAxisAngle(Vector3.right(), Math.PI);
        }
        
        const axis = Vector3.up().cross(up).normalize();
        const angle = Math.acos(Vector3.up().dot(up));
        return Quaternion.fromAxisAngle(axis, angle);
    }

    // Constraint helpers for physics
    constrainToAxis(axis) {
        const axisQuat = new Quaternion(axis.x, axis.y, axis.z, 0);
        const dot = this.dot(axisQuat);
        
        if (Math.abs(dot) < 1e-6) {
            return Quaternion.identity();
        }
        
        const projected = axisQuat.multiply(dot).normalize();
        return projected;
    }

    // Stability helpers for creature animation
    stabilize(epsilon = 1e-6) {
        if (Math.abs(this.w) < epsilon) {
            this.w = this.w < 0 ? -epsilon : epsilon;
            this.normalizeInPlace();
        }
        
        // Ensure w is positive for canonical representation
        if (this.w < 0) {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            this.w = -this.w;
        }
        
        return this;
    }
}