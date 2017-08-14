/**
 * @file mouse.js
 * @fileoverview Contains mouse class
 */

'use strict';

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