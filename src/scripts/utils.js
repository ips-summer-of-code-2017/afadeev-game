/**
 * @file utils.js
 * @fileoverview Contains Utils object
 */

'use strict';

/**
 * @type {Object}
 * @desc Provides utility methods
 */
class Utils {
    constructor() {
        throw new Error("Cannot construct Utils");
    }

    /**
     * @method isNull
     * @desc Returns true if value is null
     * @param {*} value - Value to check
     * @returns {boolean}
     */
    static isNull(value) {
        return Object.is(value, null);
    }

    /**
     * @method lerp
     * @desc Returns result of linear interpolation from value x1 to value x1 with progress alpha 
     * @param {number} x1 
     * @param {number} x2 
     * @param {number} alpha 
     */
    static lerp(x1, x2, alpha) {
        return (x1 * (1 - alpha) + x2 * alpha);
    }

    /**
     * @method splitIntoLines
     * @description Splits text into lines and returns them as array of strings
     * @param {string} text - Text to split into lines
     * @return {Array.<string>}
     */
    static splitIntoLines(text) {
        let newline = /\r\n|\n\r|\n|\r/g;
        return text.replace(newline, "\n").split("\n");
    }

    /**
     * @method splitIntoNonEmptyLines
     * @desc Splits text into non empty lines and returns them as array of strings
     * @param {string} text 
     * @return {Array.<string>}
     */
    static splitIntoNonEmptyLines(text) {
        // TODO: use foreach+filter
        const lines = Utils.splitIntoLines(text);
        let result = []
        for (let line of lines) {
            line = line.trim();
            if (line.length != 0) {
                result.push(line);
            }
        }
        return result;
    }

    /**
     * @method substringAfter
     * @description Returns substring from text followed by string to search
     * @param {string} text - Original string
     * @param {string} searchString - String preceding substring
     * @returns {string}
     */
    static substringAfter(text, searchString) {
        const index = text.lastIndexOf(searchString);
        if (index != -1) {
            return text.substring(index + 1);
        } else {
            return "";
        }
    }

    /**
     * @method substringBefore
     * @description Returns substring from text preceding string to search
     * @param {string} text - Original string
     * @param {string} searchString - String after substring
     * @returns {string}
     */
    static substringBefore(text, searchString) {
        const index = text.indexOf(searchString);
        if (index != -1) {
            return text.substring(0, index);
        } else {
            return "";
        }
    }

    /**
     * 
     * @param {string} path 
     */
    static getFileDirectory(path) {
        const indexOfLastSlash = path.lastIndexOf('/');
        return path.substring(0, indexOfLastSlash + 1);
    }

    /**
     * 
     * @param {string} path 
     */
    static getFileName(path) {
        const indexOfLastSlash = path.lastIndexOf('/');
        return path.substring(indexOfLastSlash + 1);
    }

    /**
     * @method copyProperties
     * @desc Copies own properties from source object to target object
     * @param {Object} target 
     * @param {Object} source 
     */
    static copyProperties(target = {}, source = {}) {
        const ownPropertyNames = Object.getOwnPropertyNames(source);

        ownPropertyNames
            .filter(key => !/^(prototype|name|constructor)$/.test(key))
            .forEach(key => {
                const desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            });
    }

    /**
     * @method mix
     * @desc Returns combination of classes from arguments list
     * @param {...function()} mixins - List of classes
     * @returns {function()}
     */
    static mix(...mixins) {
        class Mix {
            constructor(...args) {
                for (let mixin of mixins) {
                    const newMixin = new mixin(...args);
                    Utils.copyProperties(this, newMixin);
                    Utils.copyProperties(this.prototype, newMixin.prototype);
                }
            }
        }

        for (let mixin of mixins) {
            Utils.copyProperties(Mix, mixin);
            Utils.copyProperties(Mix.prototype, mixin.prototype);
        }

        return Mix;
    }

    static trim(string) {
        return string.trim();
    }

    static bound(value, min, max) {
        return Math.min(max, Math.max(value, min));
    }
}