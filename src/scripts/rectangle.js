/**
 * @file rectangle.js
 * @fileoverview Contains rectangle class
 */

'use strict';

/**
 * @class Rectangle
 * @description Represents a rectangle
 */
class Rectangle {
    /**
     * @method @constructs Rectangle
     * @param {Vector} position 
     * @param {Vector} size 
     */
    constructor(position, size) {
        this.position = position;
        this.size = size;
        this.left = position.x;
        this.right = position.x + size.x;
        this.up = position.y;
        this.down = position.y + size.y;
        if (this.left > this.right) {
            [this.left, this.right] = [this.right, this.left];
        }
        if (this.up > this.down) {
            [this.up, this.down] = [this.down, this.up];
        }
    }

    /**
     * @method intersectsWith
     * @description Checks if intersects with other rectangle
     * @param {Rectange} rectange 
     */
    intersectsWith(rectange) {
        return (this.left < rectange.right) && (rectange.left < this.right) &&
            (this.up < rectange.down) && (rectange.up < this.down);
    }
}