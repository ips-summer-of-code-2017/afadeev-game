/**
 * @file keyboard.js
 * @fileoverview Contains keyboard class
 */

'use strict';

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
        // ["keydown", "keyup"].forEach((e) => {
        //     window.addEventListener(e, this.update.bind(this));
        // });
        window.addEventListener("keydown", this.press.bind(this));
        window.addEventListener("keyup", this.unpress.bind(this));
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

    /**
     * @private @method press
     * @desc Key down event handler
     * @param {KeyboardEvent} event 
     */
    press(event) {
        const keyCode = event.code;
        let keyStatus = this.keyStatus[keyCode];
        if (!keyStatus) { // undefined
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

    /**
     * @private @method press
     * @desc Key up event handler
     * @param {KeyboardEvent} event 
     */
    unpress(event) {
        const keyCode = event.code;
        this.keyStatus[keyCode] = keyStatusEnum.Unpressed;
    }

    /**
     * @method isPressed
     * @desc Checks if button with requested key code is pressed
     * @param {string} keyCode
     * @returns {boolean} 
     */
    isPressed(keyCode) {
        const keyStatus = this.keyStatus[keyCode];
        if (!keyStatus)
            return false;
        return (keyStatus == keyStatusEnum.Pressed || keyStatus == keyStatusEnum.PressStarted);
    }
}