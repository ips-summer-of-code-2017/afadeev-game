/**
 * @file utilities.js
 * @fileoverview Contains helper methods and classes
 */

'use strict';

/**
 * @enum {string}
 */
// let keyStatusEnum = {
//     Unpressed: "unpressed",
//     PressStarted: "pressStarted",
//     Pressed: "pressed",
// }

/**
 * @enum {symbol}
 */
let keyStatusEnum = new Enum(
    "Unpressed",
    "PressStarted",
    "Pressed"
);

/**
 * @class Keyboard
 * @description Wrapper for keyboard
 */
class Keyboard {
    /**
     * @method @constructs Keyboard
     */
    constructor() {
        this.pressed = {};
        this.keyStatus = {};
        ["keydown", "keyup"].forEach((e) => {
            window.addEventListener(e, this.update.bind(this));
        });
        this.callbacks = {};
    }

    /**
     * @method addHotkey
     * @description Assigns callback to the key 
     * @param {string} keyCode - Code of key
     * @param {Function} callback - Callback function
     */
    addHotkey(keyCode, callback) {
        if (this.callbacks[keyCode]) {
            this.callbacks[keyCode].push(callback);
        } else {
            this.callbacks[keyCode] = [callback];
        }
    }

    /**
     * @private @method useHotKey
     * @description Calls all callbacks assigned to the key
     * @param {string} keyCode - Code of key
     */
    useHotkey(keyCode) {
        if (this.callbacks[keyCode]) {
            for (let index = 0; index < this.callbacks[keyCode].length; index++) {
                this.callbacks[keyCode][index]();
            }
        }
    }

    /**
     * @private @method changeKeyStatus
     * @description Changes status of the key
     * @param {string} keyCode - Code of key
     * @param {string} status - New status of key
     */
    changeKeyStatus(keyCode, status) {
        this.keyStatus[keyCode] = status;
    }

    press(event) {
        const keyCode = event.code;
        let keyStatus = this.keyStatus[keyCode];
        if (!keyStatus) {
            this.keyStatus[keyCode] = keyStatusEnum.Unpressed;
        }
        if (keyStatus == keyStatusEnum.Unpressed) {
            this.keyStatus[keyCode] = keyStatusEnum.PressStarted;
            this.useHotkey(keyCode);
            // console.log(`${keyCode} is pressed`);
        } else {
            this.keyStatus[keyCode] = keyStatusEnum.Pressed;
        }
    }

    unpress(event) {
        const keyCode = event.code;
        this.keyStatus[keyCode] = keyStatusEnum.Unpressed;
    }

    update(event) {
        const keyCode = event.code;
        const eventType = event.type;
        const keyIsPressed = (eventType == "keydown");
        let keyStatus = this.keyStatus[keyCode];
        if (!keyStatus) {
            this.changeKeyStatus(keyCode, keyStatusEnum.Unpressed);
            keyStatus = keyStatusEnum.Unpressed;
        }
        if (keyIsPressed) {
            if (keyStatus == keyStatusEnum.Unpressed) {
                this.changeKeyStatus(keyCode, keyStatusEnum.PressStarted);
                this.useHotkey(keyCode);
                // console.log(`${keyCode} is pressed`);
            } else {
                this.changeKeyStatus(keyCode, keyStatusEnum.Pressed);
            }
        } else {
            this.changeKeyStatus(keyCode, keyStatusEnum.Unpressed);
            // console.log(`${keyCode} is unpressed`);
        }
    }

    isPressed(keyCode) {
        const keyStatus = this.keyStatus[keyCode];
        if (!keyStatus)
            return false;
        return (keyStatus == keyStatusEnum.Pressed || keyStatus == keyStatusEnum.PressStarted);
    }
}

class MovementController {
    constructor(keyboard) {
        this.keyboard = keyboard;
    }

    get direction() {
        let vec = new Vector(0, 0);
        if (this.keyboard.isPressed("KeyW")) vec.y -= 1;
        if (this.keyboard.isPressed("KeyS")) vec.y += 1;
        if (this.keyboard.isPressed("KeyA")) vec.x -= 1;
        if (this.keyboard.isPressed("KeyD")) vec.x += 1;
        vec.normalize();
        return vec;
    }
}

class Mouse {
    constructor(element) {
        if (element) {
            this.element = element;
        } else {
            this.element = window.document;
        }
        this.position = new Vector(0, 0);
        this.mouseOver = false;
        this.mousePressed = false;

        ["mousemove", "touchstart", "touchmove"].forEach((eventType) => {
            this.element.addEventListener(eventType, this.update.bind(this));
        });
        ["mousedown", "touchstart"].forEach((eventType) => {
            this.element.addEventListener(eventType, () => {
                this.mousePressed = true;
            });
        });
        ["mouseup", "touchend"].forEach((eventType) => {
            window.addEventListener(eventType, () => {
                this.mousePressed = false;
            });
        });
        this.element.addEventListener("mouseover", () => {
            this.mouseOver = true;
        });
        this.element.addEventListener("mouseout", () => {
            this.mouseOver = false;
        });
    }

    update(event) {
        let b = this.element.getBoundingClientRect();
        const w = this.element.clientWidth;
        const h = this.element.clientHeight;
        if (event.touches) {
            const x = (event.touches[0].clientX - b.left) / w * 16 / 9;
            const y = (event.touches[0].clientY - b.top) / h;
            if (x < 0 || x > w || y < 0 || y > h) {
                this.mouseOver = false;
            } else {
                this.mouseOver = true;
            }
            this.position.x = x;
            this.position.y = y;
        } else {
            this.position.x = (event.clientX - b.left) / w * 16 / 9;
            this.position.y = (event.clientY - b.top) / h;
        }
    }

    get isActive() {
        return (this.mousePressed && this.mouseOver);
    }
}