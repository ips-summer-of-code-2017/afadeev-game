/**
 * @file utils.js
 * @fileoverview Contains Utils object
 */

'use strict';

/**
 * @type {Object}
 * @desc Provides utility methods
 */
let Utils = {
    /**
     * @method isNull
     * @desc Returns true if value is null
     * @param {*} value - Value to check
     * @returns {boolean}
     */
    isNull(value) {
        return Object.is(value, null);
    },
    /**
     * @method lerp
     * @desc Returns linear
     * @param {number} x1 
     * @param {number} x2 
     * @param {number} alpha 
     */
    lerp(x1, x2, alpha) {
        return (x1 * (1 - alpha) + x2 * alpha);
    },
    /**
     * @method splitIntoLines
     * @description Returns lines from string as array of strings
     * @param {string} text - Text to split into lines
     * @return {Array.<string>}
     */
    splitIntoLines(text) {
        let newline = /\r\n|\n\r|\n|\r/g;
        return text.replace(newline, "\n").split("\n");
    },
    /**
     * @method substringAfter
     * @description Returns substring from text followed by string to search
     * @param {string} text - Original string
     * @param {string} searchString - String preceding substring
     * @returns {string}
     */
    substringAfter(text, searchString) {
        return text.substring(text.indexOf(searchString) + 1)
    }
}