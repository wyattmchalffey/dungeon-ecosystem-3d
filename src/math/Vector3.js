/**
 * Vector3 - 3D Vector Mathematics
 * Core math utility for 3D operations in the dungeon ecosystem engine
 */

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Static factory methods
    static zero() {
        return new Vector3(0, 0, 0);
    }

    static one() {
        return new Vector3(1, 1, 1);
    }

    static up() {
        return new Vector3(0, 1, 0);
    }

    static right() {
        return new Vector3(1, 0, 0);
    }

    static forward() {
        return new Vector3(0, 0, -1); // Negative Z is forward in right-handed system
    }

    static random() {
        return new Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
    }

    static randomUnitSphere() {
        let v;
        do {
            v = Vector3.random();
        } while (v.lengthSquared() > 1);
        return v;
    }

    static randomOnUnitSphere() {
        return Vector3.randomUnitSphere().normalize();
    }

    // Basic operations
    add(v) {
        if (typeof v === 'number') {
            return new Vector3(this.x + v, this.y + v, this.z + v);
        }
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        if (typeof v === 'number') {
            return new Vector3(this.x - v, this.y - v, this.z - v);
        }
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(v) {
        if (typeof v === 'number') {
            return new Vector3(this.x * v, this.y * v, this.z * v);
        }
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    divide(v) {
        if (typeof v === 'number') {
            const inv = 1 / v;
            return new Vector3(this.x * inv, this.y * inv, this.z * inv);
        }
        return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    }

    // In-place operations (for performance-critical code)
    addInPlace(v) {
        if (typeof v === 'number') {
            this.x += v;
            this.y += v;
            this.z += v;
        } else {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    }

    subtractInPlace(v) {
        if (typeof v === 'number') {
            this.x -= v;
            this.y -= v;
            this.z -= v;
        } else {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    }

    multiplyInPlace(v) {
        if (typeof v === 'number') {
            this.x *= v;
            this.y *= v;
            this.z *= v;
        } else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
        }
        return this;
    }

    divideInPlace(v) {
        if (typeof v === 'number') {
            const inv = 1 / v;
            this.x *= inv;
            this.y *= inv;
            this.z *= inv;
        } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
        }
        return this;
    }

    // Vector-specific operations
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    distanceSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    normalize() {
        const len = this.length();
        if (len === 0) {
            return new Vector3(0, 0, 0);
        }
        const inv = 1 / len;
        return new Vector3(this.x * inv, this.y * inv, this.z * inv);
    }

    normalizeInPlace() {
        const len = this.length();
        if (len === 0) {
            this.x = this.y = this.z = 0;
            return this;
        }
        const inv = 1 / len;
        this.x *= inv;
        this.y *= inv;
        this.z *= inv;
        return this;
    }

    negate() {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    negateInPlace() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    applyMatrix4(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;

        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        return this;
    }

    // Interpolation
    lerp(v, t) {
        const invT = 1 - t;
        return new Vector3(
            this.x * invT + v.x * t,
            this.y * invT + v.y * t,
            this.z * invT + v.z * t
        );
    }

    slerp(v, t) {
        // Spherical linear interpolation for unit vectors
        const dot = this.dot(v);
        
        // If the dot product is negative, slerp won't take the shorter path
        let v2 = v;
        let dotClamped = dot;
        if (dot < 0) {
            v2 = v.negate();
            dotClamped = -dot;
        }
        
        // If the inputs are too close for comfort, linearly interpolate
        if (dotClamped > 0.9995) {
            return this.lerp(v2, t).normalize();
        }
        
        const theta0 = Math.acos(Math.abs(dotClamped));
        const theta = theta0 * t;
        const sinTheta = Math.sin(theta);
        const sinTheta0 = Math.sin(theta0);
        
        const s0 = Math.cos(theta) - dotClamped * sinTheta / sinTheta0;
        const s1 = sinTheta / sinTheta0;
        
        return this.multiply(s0).add(v2.multiply(s1));
    }

    // Utility methods
    reflect(normal) {
        // Reflect this vector across the given normal
        const dot2 = this.dot(normal) * 2;
        return this.subtract(normal.multiply(dot2));
    }

    project(onto) {
        // Project this vector onto another vector
        const scalar = this.dot(onto) / onto.lengthSquared();
        return onto.multiply(scalar);
    }

    projectOnPlane(planeNormal) {
        // Project this vector onto a plane defined by its normal
        return this.subtract(this.project(planeNormal));
    }

    angle(v) {
        // Angle between this vector and another (in radians)
        const denominator = Math.sqrt(this.lengthSquared() * v.lengthSquared());
        if (denominator === 0) return 0;
        
        const dot = this.dot(v) / denominator;
        return Math.acos(Math.max(-1, Math.min(1, dot)));
    }

    // Comparison methods
    equals(v, epsilon = 1e-6) {
        return Math.abs(this.x - v.x) < epsilon &&
               Math.abs(this.y - v.y) < epsilon &&
               Math.abs(this.z - v.z) < epsilon;
    }

    isZero(epsilon = 1e-6) {
        return this.lengthSquared() < epsilon * epsilon;
    }

    isUnit(epsilon = 1e-6) {
        return Math.abs(this.lengthSquared() - 1) < epsilon;
    }

    // Coordinate system utilities
    toSpherical() {
        // Convert to spherical coordinates (radius, theta, phi)
        const radius = this.length();
        if (radius === 0) {
            return { radius: 0, theta: 0, phi: 0 };
        }
        
        const theta = Math.atan2(this.x, this.z); // Azimuth angle
        const phi = Math.acos(this.y / radius);    // Polar angle
        
        return { radius, theta, phi };
    }

    static fromSpherical(radius, theta, phi) {
        const sinPhi = Math.sin(phi);
        return new Vector3(
            radius * sinPhi * Math.sin(theta),
            radius * Math.cos(phi),
            radius * sinPhi * Math.cos(theta)
        );
    }

    // Array conversion
    toArray() {
        return [this.x, this.y, this.z];
    }

    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z]);
    }

    static fromArray(arr) {
        return new Vector3(arr[0] || 0, arr[1] || 0, arr[2] || 0);
    }

    // Cloning and copying
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    // String representation
    toString() {
        return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
    }

    // Ecosystem-specific utilities
    static randomInBounds(min, max) {
        return new Vector3(
            min.x + Math.random() * (max.x - min.x),
            min.y + Math.random() * (max.y - min.y),
            min.z + Math.random() * (max.z - min.z)
        );
    }

    clamp(min, max) {
        return new Vector3(
            Math.max(min.x, Math.min(max.x, this.x)),
            Math.max(min.y, Math.min(max.y, this.y)),
            Math.max(min.z, Math.min(max.z, this.z))
        );
    }

    // Flocking behavior utilities (for creature AI)
    seek(target, maxSpeed = 1) {
        return target.subtract(this).normalize().multiply(maxSpeed);
    }

    flee(target, maxSpeed = 1) {
        return this.subtract(target).normalize().multiply(maxSpeed);
    }

    // Environmental calculation helpers
    manhattanDistance(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }

    chebyshevDistance(v) {
        return Math.max(
            Math.abs(this.x - v.x),
            Math.abs(this.y - v.y),
            Math.abs(this.z - v.z)
        );
    }
}