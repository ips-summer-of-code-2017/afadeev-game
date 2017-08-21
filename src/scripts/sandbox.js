/**
 * @file sandbox.js
 * @fileoverview Contains experimental code
 */

'use strict';

/**
 * @class Position
 * @description Represents an accelerated motion
 * @todo Add methods to modify speed and acceleration
 * @property {Vector} position - Radius vector
 */
class Motion {
    /**
     * @method @constructs Motion
     * @param {Vector} position - Radius vector
     * @param {Vector=} speed - Speed vector
     * @param {Vector=} acceleration - Acceleration vector
     */
    constructor(position, speed = new Vector(0, 0), acceleration = new Vector(0, 0)) {
        /**
         * @type {Vector}
         * @description Radius vector
         */
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }

    /**
     * @method update
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.position = this.position
            .add(this.speed.multiply(deltaTime))
        // .add(this.acceleration.multiply(deltaTime * deltaTime / 2));
        this.speed = this.speed
            .add(this.acceleration.multiply(deltaTime));
    }
}

let EntityPropertyEnum = new Enum(
    "Appearance",
    "Position",
    "Size"
);

let EntityCategoryEnum = new Enum(
    "Box",
    "Character",
    "Spikes",
    "Wall"
);

// class Entity {
//     constructor() {
//         this.components = new Map();
//     }

//     setProperty(name, value) {
//         this.components.set(name, value);
//     }

//     getProperty(name) {
//         return this.components.get(name);
//     }

//     deleteProperty(name) {
//         this.components.delete(name);
//     }

//     update(deltaTime) {
//         switch (this.getProperty(category)) {
//             case EntityCategoryEnum.Box:
//                 this.updateBox();
//                 break;
//             case EntityCategoryEnum.Character:
//                 this.updateCharacter();
//                 break;
//         }
//     }

//     updateBox() {

//     }

//     updateCharacter() {

//     }
// }

// class EntityFactory {
//     constructor(params) {
//         this.params = params;
//     }

//     getBasicEntity(params) {
//         let entity = new Entity();
//         entity.setProperty(position, params.position);
//         entity.setProperty(size, params.position);
//     }

//     getWall(params) {
//         let entity = getBasicEntity(params);
//         entity.setProperty(category, EntityCategoryEnum.Wall);
//         entity.setProperty(appearance, params.graphics.atlas.sprites["tiles/wall.png"]);
//     }

//     getEntity(category, params) {
//         switch (category) {
//             case EntityCategoryEnum.Wall:
//                 return getWall(params);
//             case EntityCategoryEnum.Box:
//                 return getBox(params);
//             case EntityCategoryEnum.Character:
//                 return getCharacter(params);
//             case EntityCategoryEnum.Spikes:
//                 return getSpikes(params);
//         }
//     }
// }

// class RenderSystem {
//     constructor() {

//     }
// }