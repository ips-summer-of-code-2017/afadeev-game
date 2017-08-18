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
     * @description Splits text into lines and returns them as array of strings
     * @param {string} text - Text to split into lines
     * @return {Array.<string>}
     */
    splitIntoLines(text) {
        let newline = /\r\n|\n\r|\n|\r/g;
        return text.replace(newline, "\n").split("\n");
    },

    /**
     * @method splitIntoNonEmptyLines
     * @desc Splits text into non empty lines and returns them as array of strings
     * @param {string} text 
     * @return {Array.<string>}
     */
    splitIntoNonEmptyLines(text) {
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
    },

    /**
     * @method substringAfter
     * @description Returns substring from text followed by string to search
     * @param {string} text - Original string
     * @param {string} searchString - String preceding substring
     * @returns {string}
     */
    substringAfter(text, searchString) {
        return text.substring(text.indexOf(searchString) + 1);
    },

    /**
     * @method substringBefore
     * @description Returns substring from text preceding string to search
     * @param {string} text - Original string
     * @param {string} searchString - String after substring
     * @returns {string}
     */
    substringBefore(text, searchString) {
        return text.substring(0, text.indexOf(searchString));
    },

    /**
     * 
     * @param {string} path 
     */
    getFileDirectory(path) {
        const indexOfLastSlash = path.lastIndexOf('/');
        if (indexOfLastSlash >= 0) {
            return path.substring(0, indexOfLastSlash + 1);
        } else {
            return "/";
        }
    },

    /**
     * 
     * @param {string} path 
     */
    getFileName(path) {

    }
}