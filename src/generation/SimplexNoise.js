/**
 * SimplexNoise - 3D Simplex noise implementation
 * Used for natural cave deformation and organic shapes
 */

export class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.perm = this.buildPermutationTable(seed);
        
        // Gradients for 3D noise
        this.grad3 = [
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
            [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
            [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
        ];
    }
    
    /**
     * Build permutation table from seed
     */
    buildPermutationTable(seed) {
        const perm = [];
        
        // Initialize with values 0-255
        for (let i = 0; i < 256; i++) {
            perm[i] = i;
        }
        
        // Shuffle using seed
        let n = seed * 10000;
        for (let i = 255; i > 0; i--) {
            n = (n * 9301 + 49297) % 233280;
            const j = Math.floor((n / 233280) * i);
            
            // Swap
            const temp = perm[i];
            perm[i] = perm[j];
            perm[j] = temp;
        }
        
        // Duplicate for overflow
        for (let i = 0; i < 256; i++) {
            perm[i + 256] = perm[i];
        }
        
        return perm;
    }
    
    /**
     * 3D Simplex noise
     */
    noise3D(x, y, z) {
        // Skew the input space to determine which simplex cell we're in
        const F3 = 1.0 / 3.0;
        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        
        const G3 = 1.0 / 6.0;
        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;
        
        // Determine which simplex we are in
        let i1, j1, k1;
        let i2, j2, k2;
        
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
            } else {
                i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
            } else if (x0 < z0) {
                i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
            } else {
                i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            }
        }
        
        // Offsets for corners
        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;
        
        // Work out the hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
        const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
        const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
        
        // Calculate contribution from corners
        let n0, n1, n2, n3;
        
        const t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            n0 = Math.pow(t0, 4) * this.dot3(this.grad3[gi0], x0, y0, z0);
        }
        
        const t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            n1 = Math.pow(t1, 4) * this.dot3(this.grad3[gi1], x1, y1, z1);
        }
        
        const t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            n2 = Math.pow(t2, 4) * this.dot3(this.grad3[gi2], x2, y2, z2);
        }
        
        const t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            n3 = Math.pow(t3, 4) * this.dot3(this.grad3[gi3], x3, y3, z3);
        }
        
        // Sum and scale result to [-1, 1]
        return 32.0 * (n0 + n1 + n2 + n3);
    }
    
    /**
     * Dot product for 3D gradient
     */
    dot3(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }
    
    /**
     * Octave noise for more detail
     */
    octaveNoise3D(x, y, z, octaves, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }
    
    /**
     * Ridged noise for more dramatic features
     */
    ridgedNoise3D(x, y, z, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            const n = 1 - Math.abs(this.noise3D(x * frequency, y * frequency, z * frequency));
            total += n * n * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        
        return total / maxValue;
    }
    
    /**
     * Turbulence noise for fluid-like distortion
     */
    turbulence3D(x, y, z, octaves = 4) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += Math.abs(this.noise3D(x * frequency, y * frequency, z * frequency)) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return total / maxValue;
    }
}