'use strict';

/**
 * @class
 * Represents a game object
 */
class GameObject {
    constructor() {
        this.position = new Vector(0, 0);
        // this.position = new Position(new Vector(null, null));
        this.size = new Vector(0, 0);
    }

    get type() {
        return this.constructor.name;
    }

    get boundaryRectangle() {
        return new Rectangle(this.position, this.size);
    }

    collide(object) {

    }
}

class MovableObject extends GameObject {
    constructor() {
        super();
        this.speed = new Vector(0, 0);
        this.freeFallAcceleration = new Vector(0, 0);
        this.airResistance = 0;
    }

    setFreeFallAcceleration(acceleration) {
        this.freeFallAcceleration = new Vector(0, acceleration);
    }

    setAirResistance(resistance) {
        this.airResistance = resistance;
    }

    get acceleration() {
        return this.freeFallAcceleration.add(this.speed.multiply(this.airResistance));
    }

    update(deltaTime) {
        this.position = this.position
            .add(this.speed.multiply(deltaTime));
        this.speed = this.speed
            .add(this.acceleration.multiply(deltaTime));
    }

    /**
     * Pushes away this from other object on contact
     * @param {GameObject} other
     */
    bump(other) {
        const rectA = this.boundaryRectangle;
        const rectB = other.boundaryRectangle;
        let shifts = [
            new Vector(rectB.right - rectA.left, 0), // right
            new Vector(0, rectB.up - rectA.down), // up
            new Vector(rectB.left - rectA.right, 0), // left
            new Vector(0, rectB.down - rectA.up), // down
        ];
        let lengths = shifts.map((vec) => vec.length);
        let indexOfMin = 0;
        for (let index = 1; index < lengths.length; index++) {
            if (lengths[index] < lengths[indexOfMin]) {
                indexOfMin = index;
            }
        }
        this.position = this.position
            .add(shifts[indexOfMin]);
        if (indexOfMin == 0 || indexOfMin == 2) {
            this.speed.x = 0;
        } else {
            this.speed.y = 0;
        }
    }
}

class Character extends MovableObject {
    constructor() {
        super();
        this.dead = false;
        this.walkAcceleration = 5000;
        this.movementController = null;
    }

    setMovementController(movementController) {
        this.movementController = movementController;
    }

    get acceleration() {
        const direction = this.movementController.direction;
        return super.acceleration.add(direction.multiply(this.walkAcceleration))
    }

    die() {
        this.dead = true;
        console.log("Character is dead")
    }

    /**
     * @override
     */
    collide(object) {
        switch (object.type) {
            case objectTypeEnum.Wall:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Spikes:
                {
                    this.die();
                    break;
                }
        }
    }
}

class Box extends GameObject {
    constructor() {
        super();
    }
}

class Wall extends GameObject {
    constructor() {
        super();
    }
}

class Spikes extends GameObject {
    constructor() {
        super();
    }
}

class ObjectFactory {
    constructor(params) {
        this.keyboard = params.keyboard;
        this.movementController = params.movementController;
    }

    getObject(type, position, size) {
        let objectClass = objectClassEnum[type];
        let object = new objectClass();
        object.position = position;
        object.size = size;
        if (type == "Character") {
            object.setMovementController(this.movementController);
            object.setAirResistance(-10);
            object.setFreeFallAcceleration(2500);
        }
        return object;
    }
}

/**
 * @enum {class}
 * @description Transforms object type to object class
 */
let objectClassEnum = {
    Character: Character,
    Box: Box,
    Wall: Wall,
    Spikes: Spikes,
}

console.log(typeof Character)

/**
 * @enum {string}
 * @description Transforms object type to object type string
 */
let objectTypeEnum = {
    Character: Character.name,
    Box: Box.name,
    Wall: Wall.name,
    Spikes: Spikes.name,
}

/**
 * @class
 * @description Represents a level
 * @property {string} levelFilePath  
 * @property {XMLHttpRequest} request 
 */
class GameLevel {
    /**
     * @public 
     * @method 
     * @constructs Level
     * @param {string} levelFilePath 
     */
    constructor(levelFilePath) {
        this.levelFilePath = levelFilePath;
        this.data = null;
        this.load();
    }

    /**
     * @private @method load
     * @description Loads the level data and parses it
     */
    load() {
        fetch(this.levelFilePath).then((response) => {
            return response.json();
        }).then((levelData) => {
            this.data = levelData;
            console.log(`Level ${this.levelFilePath.substring(this.levelFilePath.lastIndexOf('/') + 1)} is loaded`);
            // console.log("Tiled level data:", this.data);
        });
    }
}

class WorldState {
    constructor() {
        this.objects = [];
        this.character = null;
        this.width = null;
        this.height = null;
        this.passed = false;
    }

    addObject(object) {
        this.objects.push(object);
        if (object.type == objectTypeEnum.Character) {
            this.character = object;
        }
    }

    rectanglesOverlap(rectA, rectB) {
        return !(rectA.right <= rectB.left || rectA.left >= rectB.right) &&
            !(rectA.up >= rectB.down || rectA.down <= rectB.up);
    }

    checkCollisionsImpl(objects) {
        // let objects
    }

    checkCollisions() {
        for (let indexA = 0; indexA < this.objects.length; indexA++) {
            for (let indexB = indexA + 1; indexB < this.objects.length; indexB++) {
                let rectA = this.objects[indexA].boundaryRectangle;
                let rectB = this.objects[indexB].boundaryRectangle;
                if (this.rectanglesOverlap(rectA, rectB)) {
                    let objA = this.objects[indexA];
                    let objB = this.objects[indexB];
                    objA.collide(objB);
                    objB.collide(objA);
                }
            }
        }
    }

    update(deltaTime) {
        if (this.character) {
            this.character.update(deltaTime);
            if (this.character.position.y > this.height) {
                this.character.die();
            }
        }
        this.checkCollisions();
    }

    get levelPassed() {
        if (this.character) {
            this.passed = this.passed || (this.character.position.x + this.character.size.x > this.width);
        }
        return (this.passed);
    }
}

class WorldStateFactory {
    constructor(params) {
        this.objectFactory = new ObjectFactory(params);
    }

    get objects() {

    }

    toWorldState(level) {
        const data = level.data;
        if (data) {
            let state = new WorldState();

            let tileMapping = [];
            const tilesetsCount = data.tilesets.length
            for (let tilesetIndex = 0; tilesetIndex < tilesetsCount; tilesetIndex++) {
                const tileset = data.tilesets[tilesetIndex];
                // const tilesCount = tileset.tiles.length;
                const firstIndex = tileset.firstgid;
                const tiles = tileset.tiles;
                for (let tileIndex = 0; tiles[tileIndex] !== undefined; tileIndex++) {
                    const tile = tiles[tileIndex];
                    const name = tile.type;
                    // const name = tile.objectgroup.name;
                    tileMapping[firstIndex + tileIndex] = name;
                }
            }
            // console.log("toGameState - tile mapping:", tileMapping);

            const layersCount = data.layers.length;
            const tileWidth = data.tilewidth;
            const tileHeight = data.tileheight;
            for (let layerIndex = 0; layerIndex < layersCount; layerIndex++) {
                const layer = data.layers[layerIndex];
                const width = layer.width;
                const height = layer.height;
                state.width = width * tileWidth;
                state.height = height * tileHeight;
                const layerData = layer.data;
                for (let index = 0; index < width * height; index++) {
                    const type = tileMapping[layerData[index]];
                    if (type) {
                        const x = (index % width) * tileWidth;
                        const y = Math.floor(index / width) * tileHeight;
                        let position = new Vector(x, y);
                        let size = new Vector(tileWidth, tileHeight)
                        let object = this.objectFactory.getObject(type, position, size);
                        state.addObject(object);
                    }
                }
            }

            return state;
        } else {
            return null;
        }
    }
}

class GameState {
    constructor(params) {
        this.worldStateFactory = new WorldStateFactory(params);
        this.freshWorldState = null;
        this.worldState = null;
        this.level = new GameLevel("levels/level_2.json");
    }

    restart() {
        this.worldState = this.freshWorldState;
    }

    update(deltaTime) {
        if (this.worldState == null) {
            this.worldState = this.worldStateFactory.toWorldState(this.level);
        } else if (this.worldState.levelPassed) {
            this.level = new GameLevel(`levels/${this.level.data.properties.nextLevel}.json`)
            this.worldState = this.worldStateFactory.toWorldState(this.level);
        } else {
            this.worldState.update(deltaTime);
        }
    }
}

/**
 * Represents a game
 * @class
 */
class Game {
    /**
     * @constructs Game
     * @param {Element} canvas 
     */
    constructor(canvas) {
        this.graphics = new GameGraphics(canvas);
        this.keyboard = new Keyboard();
        this.timer = new Timer();
        this.movementController = new MovementController(this.keyboard);
        this.camera = new Camera();
        this.camera.setMovementController(this.movementController);
        this.graphics.setCamera(this.camera);
        this.state = new GameState({
            keyboard: this.keyboard,
            movementController: this.movementController,
        })
        this.initHotkeys();
    }

    initHotkeys() {
        this.keyboard.addHotkey("KeyF", this.graphics.toggleFullscreen.bind(this.graphics));
        this.keyboard.addHotkey("KeyR", this.camera.switchMode.bind(this.camera));
    }

    update(deltaTime) {
        this.state.update(deltaTime);
        this.camera.update(deltaTime);
        if (this.state.worldState) {
            this.camera.follow(this.state.worldState.character);
        }
        this.graphics.drawGameState(this.state);
    }

    tick() {
        let deltaTime = this.timer.deltaTime;
        this.timer.reset();
        this.update(deltaTime);
        requestAnimationFrame(this.tick.bind(this));
    }

    start() {
        requestAnimationFrame(this.tick.bind(this));
    }
}