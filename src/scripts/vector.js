/**
 * @file vector.js
 * @fileoverview Contains vector class
 */

'use strict';

/**
 * @class Vector
 * @description Represents a 2D vector
 */
class Vector {
    /**
     * @method @constructs Vector
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @method length 
     * @returns {number} 
     * @description Returns length of the vector
     */
    get length() {
        return Math.hypot(this.x, this.y);
    }

    /**
     * @method normalize
     * @description Normalizes the vector
     */
    normalize() {
        const length = this.length;
        if (length) {
            this.x /= length;
            this.y /= length;
        }
    }

    /**
     * @method add 
     * @returns {Vector}
     * @description Returns sum with another vector
     * @param {Vector} vec - Vector to add 
     */
    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    /**
     * @method multiply 
     * @returns {Vector}
     * @description Returns product with number
     * @param {number} value - Value to multiply vector to
     */
    multiply(value) {
        return new Vector(this.x * value, this.y * value);
    }

    /**
     * @method negate
     * @returns {Vector}
     * @description Returns negated vector
     */
    negate() {
        return this.multiply(-1);
    }

    /**
     * @method scalarProduct
     * @return {number}
     * @description Return scalar product with another vector
     * @param {Vector} vec - Vector to multiply with
     */
    scalarProduct(vec) {
        return (this.x * vec.x + this.y * vec.y);
    }
}