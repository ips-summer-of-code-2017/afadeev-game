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
        this._left = position.x;
        this._right = position.x + size.x;
        this._up = position.y;
        this._down = position.y + size.y;
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

    set left(left) {
        this._left = left;
        this._right = Math.max(this.right, this.left);
        this.position.x = this.left;
        this.size.x = this.right - this.left;
    }

    set right(right) {
        this._right = right;
        this._left = Math.min(this.left, this.right);
        this.position.x = this.left;
        this.size.x = this.right - this.left;
    }

    set up(up) {
        this._up = up;
        this._down = Math.max(this.down, this.up);
        this.position.y = this.up;
        this.size.y = this.down - this.up;
    }

    set down(down) {
        this._down = down;
        this._up = Math.min(this.up, this.down);
        this.position.y = this.up;
        this.size.y = this.down - this.up;
    }

    get left() {
        return this._left;
    }

    get right() {
        return this._right;
    }

    get up() {
        return this._up;
    }

    get down() {
        return this._down;
    }

    get width() {
        return this.size.x;
    }

    get height() {
        return this.size.y;
    }
}