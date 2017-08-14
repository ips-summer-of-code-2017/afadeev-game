/**
 * @file timer.js
 * @fileoverview Contains timer class
 */

'use strict';

/**
 * @class Timer
 * @classdesc Represents a timer
 */
class Timer {
    /**
     * @method @constructs Timer 
     */
    constructor() {
        this.startTime = new Date();
        this.pauseTime = null;
        this.isPaused = false;
        this.idleTime = 0;
        document.addEventListener("visibilitychange", this.handleVisiblityChange.bind(this))
    }

    /**
     * @private @method pause
     * @desc Pauses the timer
     */
    pause() {
        if (!this.isPaused) {
            this.pauseTime = new Date();
            this.isPaused = true;
        }
    }

    /**
     * @private @method continue
     * @desc Unpauses the timer
     */
    continue () {
        if (!this.isPaused) {
            this.pauseTime = this.startTime;
        }
        const time = new Date();
        const deltaTime = time - this.pauseTime;
        this.idleTime += deltaTime;
        this.pauseTime = null;
        this.isPaused = false;
    }

    /**
     * @method reset
     * @desc Resets the timer
     */
    reset() {
        this.startTime = new Date();
        this.pauseTime = null;
        this.idleTime = 0;
    }

    /**
     * @private @method handleVisibilityChange
     * @desc Handles document visibility change events
     * @param {Event} event - Visibility change event
     */
    handleVisiblityChange(event) {
        if (document.hidden) {
            this.pause();
        } else {
            this.continue();
        }
    }

    /**
     * @method deltaTime
     * @desc - Returns seconds of activity passed from start/reset of the timer
     * @returns {number}
     */
    get deltaTime() {
        if (this.isPaused) {
            return (this.pauseTime - this.startTime - this.idleTime) / 1000;
        } else {
            const time = new Date();
            return (time - this.startTime - this.idleTime) / 1000;
        }
    }
}