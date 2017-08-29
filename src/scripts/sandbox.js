/**
 * @file sandbox.js
 * @fileoverview Contains experimental code
 */

'use strict';

/**
 * @class Position
 * @description Represents an accelerated motion
 * @todo Add methods to modify speed and acceleration
 * @property {Vector} position - Radius vector
 */
class Motion {
    /**
     * @method @constructs Motion
     * @param {Vector} position - Radius vector
     * @param {Vector=} speed - Speed vector
     * @param {Vector=} acceleration - Acceleration vector
     */
    constructor(position, speed = new Vector(0, 0), acceleration = new Vector(0, 0)) {
        /**
         * @type {Vector}
         * @description Radius vector
         */
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }

    /**
     * @method update
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.position = this.position
            .add(this.speed.multiply(deltaTime))
        // .add(this.acceleration.multiply(deltaTime * deltaTime / 2));
        this.speed = this.speed
            .add(this.acceleration.multiply(deltaTime));
    }
}