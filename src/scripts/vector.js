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
    get normalized() {
        let vec = new Vector(this.x, this.y);
        const length = vec.length;
        if (length != 0) {
            vec.x /= length;
            vec.y /= length;
        }
        return vec;
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

    get clone() {
        return new Vector(this.x, this.y);
    }
}