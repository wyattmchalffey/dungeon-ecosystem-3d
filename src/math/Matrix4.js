/**
 * Matrix4 - 4x4 Matrix Mathematics
 * Core transformation matrix for 3D graphics operations
 */

import { Vector3 } from './Vector3.js';

export class Matrix4 {
    constructor() {
        // Matrix stored in column-major order (WebGL standard)
        // [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]
        this.elements = new Float32Array(16);
        this.identity();
    }

    // Static factory methods
    static identity() {
        return new Matrix4();
    }

    static zero() {
        const m = new Matrix4();
        m.elements.fill(0);
        return m;
    }

    static fromArray(arr) {
        const m = new Matrix4();
        m.elements.set(arr);
        return m;
    }

    static fromValues(
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    ) {
        const m = new Matrix4();
        const e = m.elements;
        e[0] = m00; e[4] = m01; e[8] = m02; e[12] = m03;
        e[1] = m10; e[5] = m11; e[9] = m12; e[13] = m13;
        e[2] = m20; e[6] = m21; e[10] = m22; e[14] = m23;
        e[3] = m30; e[7] = m31; e[11] = m32; e[15] = m33;
        return m;
    }

    // Basic matrix operations
    identity() {
        const e = this.elements;
        e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
        e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
        e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
        return this;
    }

    copy(m) {
        this.elements.set(m.elements);
        return this;
    }

    clone() {
        const m = new Matrix4();
        m.elements.set(this.elements);
        return m;
    }

    equals(m, epsilon = 1e-6) {
        for (let i = 0; i < 16; i++) {
            if (Math.abs(this.elements[i] - m.elements[i]) >= epsilon) {
                return false;
            }
        }
        return true;
    }

    // Matrix multiplication
    multiply(m) {
        const result = new Matrix4();
        this.multiplyMatrices(this, m, result);
        return result;
    }

    multiplyInPlace(m) {
        this.multiplyMatrices(this, m, this);
        return this;
    }

    premultiply(m) {
        const result = new Matrix4();
        this.multiplyMatrices(m, this, result);
        return result;
    }

    premultiplyInPlace(m) {
        this.multiplyMatrices(m, this, this);
        return this;
    }

    multiplyMatrices(a, b, result) {
        const ae = a.elements;
        const be = b.elements;
        const re = result.elements;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        re[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        re[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        re[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        re[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        re[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        re[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        re[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        re[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        re[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        re[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        re[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        re[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        re[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        re[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        re[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        re[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    }

    // Transformation methods
    translate(v) {
        const result = this.clone();
        return result.translateInPlace(v);
    }

    translateInPlace(v) {
        const e = this.elements;
        e[12] += e[0] * v.x + e[4] * v.y + e[8] * v.z;
        e[13] += e[1] * v.x + e[5] * v.y + e[9] * v.z;
        e[14] += e[2] * v.x + e[6] * v.y + e[10] * v.z;
        e[15] += e[3] * v.x + e[7] * v.y + e[11] * v.z;
        return this;
    }

    scale(v) {
        const result = this.clone();
        return result.scaleInPlace(v);
    }

    scaleInPlace(v) {
        const e = this.elements;
        e[0] *= v.x; e[4] *= v.y; e[8] *= v.z;
        e[1] *= v.x; e[5] *= v.y; e[9] *= v.z;
        e[2] *= v.x; e[6] *= v.y; e[10] *= v.z;
        e[3] *= v.x; e[7] *= v.y; e[11] *= v.z;
        return this;
    }

    rotateX(angle) {
        const result = this.clone();
        return result.rotateXInPlace(angle);
    }

    rotateXInPlace(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;

        const m10 = e[1], m11 = e[5], m12 = e[9], m13 = e[13];
        const m20 = e[2], m21 = e[6], m22 = e[10], m23 = e[14];

        e[1] = m10 * c + m20 * s;
        e[5] = m11 * c + m21 * s;
        e[9] = m12 * c + m22 * s;
        e[13] = m13 * c + m23 * s;

        e[2] = m20 * c - m10 * s;
        e[6] = m21 * c - m11 * s;
        e[10] = m22 * c - m12 * s;
        e[14] = m23 * c - m13 * s;

        return this;
    }

    rotateY(angle) {
        const result = this.clone();
        return result.rotateYInPlace(angle);
    }

    rotateYInPlace(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;

        const m00 = e[0], m01 = e[4], m02 = e[8], m03 = e[12];
        const m20 = e[2], m21 = e[6], m22 = e[10], m23 = e[14];

        e[0] = m00 * c - m20 * s;
        e[4] = m01 * c - m21 * s;
        e[8] = m02 * c - m22 * s;
        e[12] = m03 * c - m23 * s;

        e[2] = m00 * s + m20 * c;
        e[6] = m01 * s + m21 * c;
        e[10] = m02 * s + m22 * c;
        e[14] = m03 * s + m23 * c;

        return this;
    }

    rotateZ(angle) {
        const result = this.clone();
        return result.rotateZInPlace(angle);
    }

    rotateZInPlace(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = this.elements;

        const m00 = e[0], m01 = e[4], m02 = e[8], m03 = e[12];
        const m10 = e[1], m11 = e[5], m12 = e[9], m13 = e[13];

        e[0] = m00 * c + m10 * s;
        e[4] = m01 * c + m11 * s;
        e[8] = m02 * c + m12 * s;
        e[12] = m03 * c + m13 * s;

        e[1] = m10 * c - m00 * s;
        e[5] = m11 * c - m01 * s;
        e[9] = m12 * c - m02 * s;
        e[13] = m13 * c - m03 * s;

        return this;
    }

    rotateAxis(axis, angle) {
        const result = this.clone();
        return result.rotateAxisInPlace(axis, angle);
    }

    rotateAxisInPlace(axis, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const x = axis.x, y = axis.y, z = axis.z;
        const tx = t * x, ty = t * y;

        const rotation = Matrix4.fromValues(
            tx * x + c, tx * y - s * z, tx * z + s * y, 0,
            tx * y + s * z, ty * y + c, ty * z - s * x, 0,
            tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1
        );

        return this.multiplyInPlace(rotation);
    }

    // Static transformation matrix creators
    static translation(v) {
        return Matrix4.fromValues(
            1, 0, 0, v.x,
            0, 1, 0, v.y,
            0, 0, 1, v.z,
            0, 0, 0, 1
        );
    }

    static scaling(v) {
        return Matrix4.fromValues(
            v.x, 0, 0, 0,
            0, v.y, 0, 0,
            0, 0, v.z, 0,
            0, 0, 0, 1
        );
    }

    static rotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Matrix4.fromValues(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    }

    static rotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Matrix4.fromValues(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
    }

    static rotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return Matrix4.fromValues(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    static rotationAxis(axis, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const x = axis.x, y = axis.y, z = axis.z;
        const tx = t * x, ty = t * y;

        return Matrix4.fromValues(
            tx * x + c, tx * y - s * z, tx * z + s * y, 0,
            tx * y + s * z, ty * y + c, ty * z - s * x, 0,
            tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1
        );
    }

    // Camera matrices
    static lookAt(eye, target, up) {
        const f = target.subtract(eye).normalize();
        const s = f.cross(up).normalize();
        const u = s.cross(f);

        return Matrix4.fromValues(
            s.x, s.y, s.z, -s.dot(eye),
            u.x, u.y, u.z, -u.dot(eye),
            -f.x, -f.y, -f.z, f.dot(eye),
            0, 0, 0, 1
        );
    }

    static perspective(fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);

        return Matrix4.fromValues(
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, (2 * far * near) * nf,
            0, 0, -1, 0
        );
    }

    static orthographic(left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);

        return Matrix4.fromValues(
            -2 * lr, 0, 0, (left + right) * lr,
            0, -2 * bt, 0, (top + bottom) * bt,
            0, 0, 2 * nf, (far + near) * nf,
            0, 0, 0, 1
        );
    }

    // Matrix operations
    transpose() {
        const result = new Matrix4();
        const e = this.elements;
        const re = result.elements;

        re[0] = e[0]; re[4] = e[1]; re[8] = e[2]; re[12] = e[3];
        re[1] = e[4]; re[5] = e[5]; re[9] = e[6]; re[13] = e[7];
        re[2] = e[8]; re[6] = e[9]; re[10] = e[10]; re[14] = e[11];
        re[3] = e[12]; re[7] = e[13]; re[11] = e[14]; re[15] = e[15];

        return result;
    }

    transposeInPlace() {
        const e = this.elements;
        let tmp;

        tmp = e[1]; e[1] = e[4]; e[4] = tmp;
        tmp = e[2]; e[2] = e[8]; e[8] = tmp;
        tmp = e[3]; e[3] = e[12]; e[12] = tmp;
        tmp = e[6]; e[6] = e[9]; e[9] = tmp;
        tmp = e[7]; e[7] = e[13]; e[13] = tmp;
        tmp = e[11]; e[11] = e[14]; e[14] = tmp;

        return this;
    }

    determinant() {
        const e = this.elements;

        const m00 = e[0], m01 = e[4], m02 = e[8], m03 = e[12];
        const m10 = e[1], m11 = e[5], m12 = e[9], m13 = e[13];
        const m20 = e[2], m21 = e[6], m22 = e[10], m23 = e[14];
        const m30 = e[3], m31 = e[7], m32 = e[11], m33 = e[15];

        return (
            m00 * (m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31)) -
            m01 * (m10 * (m22 * m33 - m23 * m32) - m12 * (m20 * m33 - m23 * m30) + m13 * (m20 * m32 - m22 * m30)) +
            m02 * (m10 * (m21 * m33 - m23 * m31) - m11 * (m20 * m33 - m23 * m30) + m13 * (m20 * m31 - m21 * m30)) -
            m03 * (m10 * (m21 * m32 - m22 * m31) - m11 * (m20 * m32 - m22 * m30) + m12 * (m20 * m31 - m21 * m30))
        );
    }

    inverse() {
        const result = new Matrix4();
        if (this.invertTo(result)) {
            return result;
        }
        return null; // Matrix is not invertible
    }

    invertInPlace() {
        const temp = new Matrix4();
        if (this.invertTo(temp)) {
            this.copy(temp);
            return this;
        }
        return null; // Matrix is not invertible
    }

    invertTo(result) {
        const e = this.elements;
        const re = result.elements;

        const m00 = e[0], m01 = e[4], m02 = e[8], m03 = e[12];
        const m10 = e[1], m11 = e[5], m12 = e[9], m13 = e[13];
        const m20 = e[2], m21 = e[6], m22 = e[10], m23 = e[14];
        const m30 = e[3], m31 = e[7], m32 = e[11], m33 = e[15];

        const det = this.determinant();
        if (Math.abs(det) < 1e-10) {
            return false; // Matrix is not invertible
        }

        const invDet = 1 / det;

        re[0] = (m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31)) * invDet;
        re[4] = -(m01 * (m22 * m33 - m23 * m32) - m02 * (m21 * m33 - m23 * m31) + m03 * (m21 * m32 - m22 * m31)) * invDet;
        re[8] = (m01 * (m12 * m33 - m13 * m32) - m02 * (m11 * m33 - m13 * m31) + m03 * (m11 * m32 - m12 * m31)) * invDet;
        re[12] = -(m01 * (m12 * m23 - m13 * m22) - m02 * (m11 * m23 - m13 * m21) + m03 * (m11 * m22 - m12 * m21)) * invDet;

        re[1] = -(m10 * (m22 * m33 - m23 * m32) - m12 * (m20 * m33 - m23 * m30) + m13 * (m20 * m32 - m22 * m30)) * invDet;
        re[5] = (m00 * (m22 * m33 - m23 * m32) - m02 * (m20 * m33 - m23 * m30) + m03 * (m20 * m32 - m22 * m30)) * invDet;
        re[9] = -(m00 * (m12 * m33 - m13 * m32) - m02 * (m10 * m33 - m13 * m30) + m03 * (m10 * m32 - m12 * m30)) * invDet;
        re[13] = (m00 * (m12 * m23 - m13 * m22) - m02 * (m10 * m23 - m13 * m20) + m03 * (m10 * m22 - m12 * m20)) * invDet;

        re[2] = (m10 * (m21 * m33 - m23 * m31) - m11 * (m20 * m33 - m23 * m30) + m13 * (m20 * m31 - m21 * m30)) * invDet;
        re[6] = -(m00 * (m21 * m33 - m23 * m31) - m01 * (m20 * m33 - m23 * m30) + m03 * (m20 * m31 - m21 * m30)) * invDet;
        re[10] = (m00 * (m11 * m33 - m13 * m31) - m01 * (m10 * m33 - m13 * m30) + m03 * (m10 * m31 - m11 * m30)) * invDet;
        re[14] = -(m00 * (m11 * m23 - m13 * m21) - m01 * (m10 * m23 - m13 * m20) + m03 * (m10 * m21 - m11 * m20)) * invDet;

        re[3] = -(m10 * (m21 * m32 - m22 * m31) - m11 * (m20 * m32 - m22 * m30) + m12 * (m20 * m31 - m21 * m30)) * invDet;
        re[7] = (m00 * (m21 * m32 - m22 * m31) - m01 * (m20 * m32 - m22 * m30) + m02 * (m20 * m31 - m21 * m30)) * invDet;
        re[11] = -(m00 * (m11 * m32 - m12 * m31) - m01 * (m10 * m32 - m12 * m30) + m02 * (m10 * m31 - m11 * m30)) * invDet;
        re[15] = (m00 * (m11 * m22 - m12 * m21) - m01 * (m10 * m22 - m12 * m20) + m02 * (m10 * m21 - m11 * m20)) * invDet;

        return true;
    }

    // Vector transformation
    transformVector3(v) {
        const e = this.elements;
        const x = v.x, y = v.y, z = v.z;

        return new Vector3(
            e[0] * x + e[4] * y + e[8] * z + e[12],
            e[1] * x + e[5] * y + e[9] * z + e[13],
            e[2] * x + e[6] * y + e[10] * z + e[14]
        );
    }

    transformVector3Direction(v) {
        // Transform direction vector (ignore translation)
        const e = this.elements;
        const x = v.x, y = v.y, z = v.z;

        return new Vector3(
            e[0] * x + e[4] * y + e[8] * z,
            e[1] * x + e[5] * y + e[9] * z,
            e[2] * x + e[6] * y + e[10] * z
        );
    }

    transformPoint(x, y, z, w = 1) {
        const e = this.elements;
        
        const rx = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
        const ry = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
        const rz = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
        const rw = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

        return { x: rx, y: ry, z: rz, w: rw };
    }

    // Decomposition
    decompose() {
        const e = this.elements;
        
        // Extract translation
        const translation = new Vector3(e[12], e[13], e[14]);
        
        // Extract scaling
        const sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
        const sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]);
        const sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10]);
        
        // Handle negative scaling (determinant check)
        const det = this.determinant();
        const scale = new Vector3(
            det < 0 ? -sx : sx,
            sy,
            sz
        );
        
        // Extract rotation matrix
        const invSx = 1 / scale.x;
        const invSy = 1 / scale.y;
        const invSz = 1 / scale.z;
        
        const rotation = Matrix4.fromValues(
            e[0] * invSx, e[4] * invSy, e[8] * invSz, 0,
            e[1] * invSx, e[5] * invSy, e[9] * invSz, 0,
            e[2] * invSx, e[6] * invSy, e[10] * invSz, 0,
            0, 0, 0, 1
        );
        
        return { translation, rotation, scale };
    }

    // Compose from TRS
    static compose(translation, rotation, scale) {
        const result = Matrix4.identity();
        
        result.scaleInPlace(scale);
        result.multiplyInPlace(rotation);
        result.translateInPlace(translation);
        
        return result;
    }

    // Utility methods
    getPosition() {
        const e = this.elements;
        return new Vector3(e[12], e[13], e[14]);
    }

    setPosition(v) {
        this.elements[12] = v.x;
        this.elements[13] = v.y;
        this.elements[14] = v.z;
        return this;
    }

    getScale() {
        const e = this.elements;
        return new Vector3(
            Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]),
            Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]),
            Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10])
        );
    }

    // Array conversion for WebGL
    toArray() {
        return Array.from(this.elements);
    }

    toFloat32Array() {
        return new Float32Array(this.elements);
    }

    // String representation
    toString() {
        const e = this.elements;
        return `Matrix4(\n` +
               `  [${e[0].toFixed(3)}, ${e[4].toFixed(3)}, ${e[8].toFixed(3)}, ${e[12].toFixed(3)}]\n` +
               `  [${e[1].toFixed(3)}, ${e[5].toFixed(3)}, ${e[9].toFixed(3)}, ${e[13].toFixed(3)}]\n` +
               `  [${e[2].toFixed(3)}, ${e[6].toFixed(3)}, ${e[10].toFixed(3)}, ${e[14].toFixed(3)}]\n` +
               `  [${e[3].toFixed(3)}, ${e[7].toFixed(3)}, ${e[11].toFixed(3)}, ${e[15].toFixed(3)}]\n` +
               `)`;
    }

    // Ecosystem-specific utilities
    static fromPositionRotationScale(position, rotation, scale) {
        return Matrix4.translation(position)
            .multiplyInPlace(rotation)
            .scaleInPlace(scale);
    }

    // Frustum extraction for culling
    extractFrustumPlanes() {
        const e = this.elements;
        const planes = [];

        // Left plane
        planes.push({
            normal: new Vector3(e[3] + e[0], e[7] + e[4], e[11] + e[8]),
            distance: e[15] + e[12]
        });

        // Right plane
        planes.push({
            normal: new Vector3(e[3] - e[0], e[7] - e[4], e[11] - e[8]),
            distance: e[15] - e[12]
        });

        // Bottom plane
        planes.push({
            normal: new Vector3(e[3] + e[1], e[7] + e[5], e[11] + e[9]),
            distance: e[15] + e[13]
        });

        // Top plane
        planes.push({
            normal: new Vector3(e[3] - e[1], e[7] - e[5], e[11] - e[9]),
            distance: e[15] - e[13]
        });

        // Near plane
        planes.push({
            normal: new Vector3(e[3] + e[2], e[7] + e[6], e[11] + e[10]),
            distance: e[15] + e[14]
        });

        // Far plane
        planes.push({
            normal: new Vector3(e[3] - e[2], e[7] - e[6], e[11] - e[10]),
            distance: e[15] - e[14]
        });

        // Normalize planes
        planes.forEach(plane => {
            const length = plane.normal.length();
            plane.normal.divideInPlace(length);
            plane.distance /= length;
        });

        return planes;
    }
}