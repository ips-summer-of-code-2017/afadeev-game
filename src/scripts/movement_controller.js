/**
 * @file movement_сontroller.js
 * @fileoverview Contains movement controller class
 */

'use strict';

class MovementController {
    constructor(keyboard) {
        this.keyboard = keyboard;
    }

    get direction() {
        let vec = new Vector(0, 0);
        if (this.keyboard.isPressed("KeyW") || this.keyboard.isPressed("ArrowUp")) {
            vec.y -= 1;
        }
        if (this.keyboard.isPressed("KeyS") || this.keyboard.isPressed("ArrowDown")) {
            vec.y += 1;
        }
        if (this.keyboard.isPressed("KeyA") || this.keyboard.isPressed("ArrowLeft")) {
            vec.x -= 1;
        }
        if (this.keyboard.isPressed("KeyD") || this.keyboard.isPressed("ArrowRight")) {
            vec.x += 1;
        };
        vec.normalize();
        return vec;
    }
}