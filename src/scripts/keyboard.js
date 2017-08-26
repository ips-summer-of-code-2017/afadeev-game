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
        this.keyStatus = new Map();
        window.addEventListener("keydown", this.press.bind(this));
        window.addEventListener("keyup", this.unpress.bind(this));
        this.callbacks = new Map();
    }

    /**
     * @method addHotkey
     * @description Assigns callback to the key 
     * @param {string} keyCode - Code of key
     * @param {Function} callback - Callback function
     */
    addHotkey(keyCode, callback) {
        if (!this.callbacks.get(keyCode)) { //if undefined
            this.callbacks.set(keyCode, new Set());
        }
        this.callbacks.get(keyCode).add(callback);
    }

    /**
     * @private @method useHotKey
     * @description Calls all callbacks assigned to the key
     * @param {string} keyCode - Code of key
     */
    useHotkey(keyCode) {
        if (this.callbacks.get(keyCode)) {
            for (let callback of this.callbacks.get(keyCode)) {
                callback();
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
        let keyStatus = this.keyStatus.get(keyCode);
        if (!keyStatus) { // if undefined
            this.keyStatus.set(keyCode, keyStatusEnum.Unpressed);
        }
        if (keyStatus == keyStatusEnum.Unpressed) {
            this.keyStatus.set(keyCode, keyStatusEnum.PressStarted);
            this.useHotkey(keyCode);
            // console.log(`${keyCode} is pressed`);
        } else {
            this.keyStatus.set(keyCode, keyStatusEnum.Pressed);
        }
    }

    /**
     * @private @method press
     * @desc Key up event handler
     * @param {KeyboardEvent} event 
     */
    unpress(event) {
        const keyCode = event.code;
        this.keyStatus.set(keyCode, keyStatusEnum.Unpressed);
    }

    /**
     * @method isPressed
     * @desc Checks if button with requested key code is pressed
     * @param {string} keyCode
     * @returns {boolean} 
     */
    isPressed(keyCode) {
        const keyStatus = this.keyStatus.get(keyCode);
        if (!keyStatus) { // if undefined
            return false;
        }
        return (keyStatus == keyStatusEnum.Pressed || keyStatus == keyStatusEnum.PressStarted);
    }

    anyPressed(keyCodes) {
        for (let keyCode of keyCodes) {
            if (this.isPressed(keyCode)) {
                return true;
            }
        }
        return false;
    }

    allPressed(keyCodes) {
        for (let keyCode of keyCodes) {
            if (!this.isPressed(keyCode)) {
                return false;
            }
        }
        return true;
    }
}