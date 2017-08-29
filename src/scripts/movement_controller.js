/**
 * @file movement_сontroller.js
 * @fileoverview Contains movement controller class
 */

'use strict';

class MovementController {
    constructor(keyboard) {
        this.keyboard = keyboard;
        this.keysLeft = ["KeyA", "ArrowLeft"];
        this.keysRight = ["KeyD", "ArrowRight"];
        this.keysUp = ["KeyW", "ArrowUp", "Space"];
        this.keysDown = ["KeyS", "ArrowDown"];
        this.keysActivate = ["KeyE"];
    }

    get direction() {
        let vec = new Vector(0, 0);
        if (this.keyboard.anyPressed(this.keysUp)) {
            vec.y -= 1;
        }
        if (this.keyboard.anyPressed(this.keysDown)) {
            vec.y += 1;
        }
        if (this.keyboard.anyPressed(this.keysLeft)) {
            vec.x -= 1;
        }
        if (this.keyboard.anyPressed(this.keysRight)) {
            vec.x += 1;
        };
        vec = vec.normalized;
        return vec;
    }

    get _goingLeft() {
        return this.keyboard.anyPressed(this.keysLeft);
    }

    get _goingRight() {
        return this.keyboard.anyPressed(this.keysRight);
    }

    get goingLeft() {
        return (this._goingLeft && !this._goingRight);
    }

    get goingRight() {
        return (!this._goingLeft && this._goingRight);
    }

    get jumping() {
        return this.keyboard.anyPressed(this.keysUp);
    }

    get goingDown() {
        return this.keyboard.anyPressed(this.keysDown);
    }

    get activating() {
        return this.keyboard.anyPressed(this.keysActivate);
    }
}