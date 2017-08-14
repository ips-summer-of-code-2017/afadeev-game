/**
 * @file enum.js
 * @fileoverview Contains enum class
 */

'use strict';

/**
 * @unrestricted @class Enum
 * @desc Represents an enum
 */
class Enum {
    /**
     * @method @constructs Enum
     * @param {...string} values - Values to enumerate
     */
    constructor(...values) {
        for (let value of values) {
            this[value] = Symbol(value);
        }
        Object.freeze(this);
    }

    /**
     * @method Symbol.iterator
     * @desc Returns a default iterator for enum
     * @returns {Generator}
     */
    *[Symbol.iterator]() {
        for (let key in this) {
            yield this[key];
        }
    }
}