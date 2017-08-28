'use strict';

/**
 * @class
 * Represents a game object
 */
class GameObject {
    constructor() {
        this._position = new Vector(0, 0);
        // this.position = new Position(new Vector(null, null));
        this._size = new Vector(0, 0);
        this.boundaryRectangle = new Rectangle(this._position, this.size);
    }

    set position(position) {
        this._position = position;
        this.boundaryRectangle = new Rectangle(this._position, this.size);
    }

    get position() {
        return this._position;
    }

    set size(size) {
        this._size = size;
        this.boundaryRectangle = new Rectangle(this._position, this.size);
    }

    get size() {
        return this._size;
    }

    get type() {
        return this.constructor.name;
    }

    update(deltaTime) {

    }

    collide(object) {

    }
}

/**
 * @enum {string}
 */
let DirectionEnum = new Enum(
    "Right",
    "Up",
    "Left",
    "Down"
);

class MovableObject extends GameObject {
    constructor() {
        super();
        this.speed = new Vector(0, 0);
        this.freeFallAcceleration = new Vector(0, 0);
        this.airResistance = new Vector(0, 0);
    }

    setFreeFallAcceleration(acceleration) {
        this.freeFallAcceleration = new Vector(0, acceleration);
    }

    setAirResistance(resistanceX, resistanceY = resistanceX) {
        this.airResistance = new Vector(resistanceX, resistanceY);
    }

    setMaxSpeed(maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    get acceleration() {
        const resistanceAcceleration = new Vector(
            this.speed.x * this.airResistance.x,
            this.speed.y * this.airResistance.y
        );
        return this.freeFallAcceleration.add(resistanceAcceleration);
    }

    update(deltaTime) {
        this.position = this.position
            .add(this.speed.multiply(deltaTime));
        this.speed = this.speed
            .add(this.acceleration.multiply(deltaTime));
        if (this.maxSpeed) {
            this.speed.x = Utils.bound(this.speed.x, -this.maxSpeed.x, this.maxSpeed.x);
            this.speed.y = Utils.bound(this.speed.y, -this.maxSpeed.y, this.maxSpeed.y);
        }
    }

    collisionDirection(other) {
        const rectA = this.boundaryRectangle;
        const rectB = other.boundaryRectangle;
        let shifts = {
            [DirectionEnum.Right]: new Vector(rectB.right - rectA.left, 0),
            [DirectionEnum.Up]: new Vector(0, rectB.up - rectA.down),
            [DirectionEnum.Left]: new Vector(rectB.left - rectA.right, 0),
            [DirectionEnum.Down]: new Vector(0, rectB.down - rectA.up),
        };
        let lengths = {};
        for (let direction of DirectionEnum) {
            lengths[direction] = shifts[direction].length;
        }
        let shortestDirection = DirectionEnum.Right;
        for (let direction of DirectionEnum) {
            if (lengths[direction] < lengths[shortestDirection]) {
                shortestDirection = direction;
            }
        }
        return shortestDirection;
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

    halfBump(other) {
        const direction = this.collisionDirection(other);
        if (direction == DirectionEnum.Up) {
            this.bump(other);
        } else if (direction != DirectionEnum.Down) {
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
                .add(shifts[indexOfMin].multiply(1 / 2));
            other.position = other.position
                .add(shifts[indexOfMin].multiply(-1 / 2));
            if (indexOfMin == 0 || indexOfMin == 2) {
                let sum = this.speed.x + other.speed.x;
                this.speed.x = sum / 2;
                other.speed.x = sum / 2;
            } else {
                let sum = this.speed.y + other.speed.y;
                this.speed.y = sum / 2;
                other.speed.y = sum / 2;
            }
        }
    }
}

class Character extends MovableObject {
    constructor() {
        super();
        this.dead = false;
        this.walkAccelerationScalar = 5000;
        this.stopAccelerationCoef = 10;
        this.jumpHeight = 72;
        this.canJump = true;
        this.movementController = null;
        this.animationController = null;
        this.setAirResistance(-10, 0);
        this.setFreeFallAcceleration(1000);
        this.setMaxSpeed(new Vector(400, 9000));
    }

    initAnimationController(animationsCollection) {
        this.animationController = new CharacterAnimationController(animationsCollection);
        this.animationController.setMovementController(this.movementController);
    }

    setMovementController(movementController) {
        this.movementController = movementController;
        if (this.animationController) {
            this.animationController.setMovementController(this.movementController);
        }
    }

    get walkAcceleration() {
        // const direction = this.movementController.direction;
        let acceleration = new Vector(0, 0);
        if (this.movementController.goingLeft) {
            acceleration = acceleration.add(new Vector(-this.walkAccelerationScalar, 0));
        } else if (this.movementController.goingRight) {
            acceleration = acceleration.add(new Vector(this.walkAccelerationScalar, 0));
        } else {
            let speedHorizontal = this.speed.clone;
            speedHorizontal.y = 0;
            acceleration = speedHorizontal.multiply(-this.stopAccelerationCoef);
        }
        return acceleration;
    }

    get acceleration() {
        return super.acceleration.add(this.walkAcceleration);
    }

    die() {
        this.dead = true;
    }

    bump(object) {
        if (this.collisionDirection(object) == DirectionEnum.Up) {
            this.canJump = true;
        }
        super.bump(object);
    }

    halfBump(object) {
        if (this.collisionDirection(object) == DirectionEnum.Up) {
            this.canJump = true;
        }
        super.halfBump(object);
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
            case objectTypeEnum.Piston:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Platform:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Spikes:
                {
                    this.die();
                    break;
                }
            case objectTypeEnum.Box:
                {
                    this.halfBump(object);
                    break;
                }
        }
    }

    get jumpSpeed() {
        const Vsqr = this.freeFallAcceleration.multiply(-2 * this.jumpHeight);
        const length = Vsqr.length;
        return Vsqr.multiply(1 / Math.sqrt(length));
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.canJump && this.movementController.jumping) {
            this.speed = this.speed.add(this.jumpSpeed);
        }
        this.canJump = false;
        if (this.animationController) {
            this.animationController.update(deltaTime);
        }
    }

    draw() {
        this.animationController.draw(this.boundaryRectangle);
    }
}

class Box extends MovableObject {
    constructor() {
        super();
        this.setAirResistance(-10, 0);
        this.setFreeFallAcceleration(2500);
    }

    /**
     * @override
     */
    collide(object) {
        switch (object.type) {
            case objectTypeEnum.Character:
                {
                    this.halfBump(object);
                    break;
                }
            case objectTypeEnum.Piston:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Platform:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Wall:
                {
                    this.bump(object);
                    break;
                }
            case objectTypeEnum.Box:
                {
                    this.halfBump(object);
                    break;
                }
        }
    }
}

class Wall extends GameObject {}

class Spikes extends GameObject {}

class Gate extends GameObject {
    constructor() {
        super();
        this.nextLevel = null;
        this.entered = false;
    }

    configure(nextLevel) {
        this.nextLevel = nextLevel;

    }

    /**
     * @override
     */
    collide(object) {
        switch (object.type) {
            case objectTypeEnum.Character:
                {
                    this.entered = true;
                    break;
                }
        }
    }

    draw() {
        //draw nothing
    }
}

class NetworkGameObject extends Utils.mix(GameObject, NetworkElement) {
    onSignalUpdate() {
        this.animationController.setIsActive(this.isActive);
    }

    draw() {
        this.animationController.draw(this.boundaryRectangle);
    }
}

class Plate extends NetworkGameObject {
    initAnimationController(animationsCollection) {
        this.animationController = new PlateAnimationController(animationsCollection);
        this.onSignalUpdate();
        this.wasActivated = false;
    }

    update(deltaTime) {
        if (!this.wasActivated) {
            this.forceIsActive(false);
        }
        this.wasActivated = false;
    }

    collide(object) {
        switch (object.type) {
            case objectTypeEnum.Character:
                {
                    this.forceIsActive(true);
                    this.wasActivated = true;
                    break;
                }
            case objectTypeEnum.Box:
                {
                    this.forceIsActive(true);
                    this.wasActivated = true;
                    break;
                }
        }
    }
}

class Lever extends NetworkGameObject {
    initAnimationController(animationsCollection) {
        this.animationController = new LeverAnimationController(animationsCollection);
        this.onSignalUpdate();
    }

    update(deltaTime) {
        this.forceIsActive(false);
    }

    collide(object) {
        switch (object.type) {
            case objectTypeEnum.Character:
                {
                    this.forceIsActive(true);
                    break;
                }
            case objectTypeEnum.Box:
                {
                    this.forceIsActive(true);
                    break;
                }
        }
    }
}

class Lamp extends NetworkGameObject {
    constructor() {
        super();
    }

    initAnimationController(animationsCollection) {
        this.animationController = new LampAnimationController(animationsCollection);
        this.onSignalUpdate();
    }
}

class Piston extends NetworkGameObject {
    constructor() {
        super();
        this.progress = 0;
        this.speed = -1;
        this.deltaLength = null;
        this.direction = null;
        this.startCoordinate = null;
    }

    initAnimationController(animationsCollection) {
        this.animationController = new PistonAnimationController(animationsCollection);
        this.onSignalUpdate();
    }

    setProgress(progress) {
        if (this.direction) {
            this.progress = progress;
            this.progress = Utils.bound(this.progress, 0, 1);
            const newCoordinate = this.startCoordinate + this.deltaLength * this.progress;
            this.boundaryRectangle[this.direction] = newCoordinate;
        }
    }

    configure(direction, deltaLength) {
        this.setProgress(0);
        this.direction = direction;
        this.deltaLength = deltaLength;
        this.startCoordinate = this.boundaryRectangle[direction];
    }

    onSignalUpdate() {
        super.onSignalUpdate();
        if (this.direction) {
            if (this.isActive) {
                this.speed = Math.abs(this.speed);
            } else {
                this.speed = -Math.abs(this.speed);
            }
        }
    }

    update(deltaTime) {
        if (this.direction) {
            this.setProgress(this.progress + this.speed * deltaTime);
        }
    }
}

class Platform extends NetworkGameObject {
    constructor() {
        super();
        this.progress = 0;
        this.speed = -1 / 7;
        this.shift = null;
    }

    set position(position) {
        this._position = position;
        this.boundaryRectangle = new Rectangle(this._position, this.size);
        this.startPosition = position;
    }

    initAnimationController(animationsCollection) {
        this.animationController = new PlatformAnimationController(animationsCollection);
        this.onSignalUpdate();
    }

    setProgress(progress) {
        if (this.shift) {
            this.progress = progress;
            this.progress = Utils.bound(this.progress, 0, 1);
            const newPosition = this.startPosition.add(this.shift.multiply(this.progress));
            this._position = newPosition;
            this.boundaryRectangle = new Rectangle(newPosition, this.size);
        }
    }

    configure(shiftX, shiftY) {
        this.setProgress(0);
        this.shift = new Vector(shiftX, shiftY);
    }

    onSignalUpdate() {
        super.onSignalUpdate();
        if (this.shift) {
            if (this.isActive) {
                this.speed = Math.abs(this.speed);
            } else {
                this.speed = -Math.abs(this.speed);
            }
        }
    }

    update(deltaTime) {
        if (this.shift) {
            this.setProgress(this.progress + this.speed * deltaTime);
        }
    }
}

class Connector extends Utils.mix(GameObject, NetworkElement) {
    constructor() {
        super();
        this.polyline = null;
    }

    setPolyline(polyline) {
        let shift = new Vector(0, 0);
        let size = new Vector(0, 0);
        for (let point of polyline) {
            shift.x = Math.min(shift.x, point.x);
            shift.y = Math.min(shift.y, point.y);
            size.x = Math.max(size.x, point.x);
            size.y = Math.max(size.y, point.y);
        }
        this.polyline = [];
        for (let point of polyline) {
            let radiusVector = new Vector(point.x, point.y);
            this.polyline.push(radiusVector.add(shift.negate()));
            // point.x -= shift.x;
            // point.y -= shift.y;
        }
        size = size.add(shift.negate());
        this.position = this.position.add(shift);
        this.size = size;
    }

    get color() {
        return this.isActive ? "rgba(0,255,255,0.25)" : "rgba(255,255,255,0.25)";
    }
}

class ObjectFactory {
    constructor(params) {
        this.keyboard = params.keyboard;
        this.movementController = params.movementController;
        this.animationsCollection = params.animationsCollection;
    }

    getObject(type, position, size, data) {
        const objectClass = objectClassEnum[type];
        let object = new objectClass();
        object.position = position;
        object.size = size;
        const animationControllerClass = animationControllerEnum[type];
        if (animationControllerClass) {
            object.initAnimationController(this.animationsCollection);
        }
        if (type == "Character") {
            object.setMovementController(this.movementController);
        }
        if (type == "Piston") {
            object.configure(
                data.properties.direction,
                data.properties.deltaLength
            );
        }
        if (type == "Platform") {
            object.configure(
                data.properties.shiftX,
                data.properties.shiftY
            );
        }
        if (type == "Connector") {
            object.setPolyline(data.polyline);
        }
        if (type == "Gate") {
            object.configure(data.properties.nextLevel);
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
    Gate: Gate,
    Lamp: Lamp,
    Plate: Plate,
    Piston: Piston,
    Connector: Connector,
    Platform: Platform
}

let animationControllerEnum = {
    Character: CharacterAnimationController,
    Lamp: LampAnimationController,
    Plate: PlateAnimationController,
    Piston: PistonAnimationController,
    Platform: PlatformAnimationController
}

/**
 * @enum {string}
 * @description Transforms object type to object type string
 */
let objectTypeEnum = {
    Character: Character.name,
    Box: Box.name,
    Wall: Wall.name,
    Spikes: Spikes.name,
    Gate: Gate.name,
    Lamp: Lamp.name,
    Plate: Plate.name,
    Piston: Piston.name,
    Platform: Platform.name
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
    constructor(levelName) {
        this.levelFilePath = `levels/${levelName}.json`;
        this.data = null;
        this.isLoaded = this.load();
    }

    /**
     * @private @method load
     * @description Loads the level data and parses it
     */
    async load() {
        return fetch(this.levelFilePath).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Level "${this.levelFilePath}" load failed with status ${response.status}`);
            }
        }).then((levelData) => {
            this.data = levelData;
            console.log(`Level ${this.levelFilePath.substring(this.levelFilePath.lastIndexOf('/') + 1)} is loaded`);
            // console.log("Tiled level data:", this.data);
        }).catch((error) => {
            alert(error);
            throw error;
        });
    }
}

let WorldStatus = new Enum(
    "InProgress",
    "Lost",
    "Passed"
);

class WorldState {
    constructor() {
        this.objects = [];
        this.character = null;
        this.width = null;
        this.height = null;
        this.gates = [];
        this.passed = false;
        this.status = WorldStatus.InProgress;
    }

    addObject(object) {
        this.objects.push(object);
        if (object.type == objectTypeEnum.Character) {
            this.character = object;
        }
        if (object.type == objectTypeEnum.Gate) {
            this.gates.push(object);
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

    get nextLevel() {
        for (let gate of this.gates) {
            if (gate.entered) {
                return gate.nextLevel;
            }
        }
        return null;
    }

    get levelPassed() {
        if (this.status == WorldStatus.Passed) {
            return true;
        }
        for (let gate of this.gates) {
            if (gate.entered) {
                return true;
            }
        }
        return false;
    }

    get levelLost() {
        if (this.status == WorldStatus.Lost) {
            return true;
        }
        if (this.character && this.character.dead) {
            return true;
        }
        return false;
    }

    updateStatus() {
        if (this.status == WorldStatus.InProgress) {
            if (this.levelPassed) {
                this.status = WorldStatus.Passed;
            } else if (this.levelLost) {
                this.status = WorldStatus.Lost;
            }
        }
    }

    update(deltaTime) {
        for (let object of this.objects) {
            object.update(deltaTime);
            if (object.type == objectTypeEnum.Character) {
                if (this.character.position.y > this.height) {
                    this.character.die();
                }
            }
        }
        this.checkCollisions();
        this.updateStatus();
    }
}

class WorldStateFactory {
    constructor(params) {
        this.objectFactory = new ObjectFactory(params);
    }

    get objects() {

    }

    getTileMapping(data) {
        let tileMapping = [];
        const tilesetsCount = data.tilesets.length
        for (let tilesetIndex = 0; tilesetIndex < tilesetsCount; tilesetIndex++) {
            const tileset = data.tilesets[tilesetIndex];
            // const tilesCount = tileset.tiles.length;
            const firstIndex = tileset.firstgid;
            const tiles = tileset.tiles;
            if (tiles) {
                for (let tileIndex = 0; tiles[tileIndex] !== undefined; tileIndex++) {
                    const tile = tiles[tileIndex];
                    const name = tile.type;
                    // const name = tile.objectgroup.name;
                    tileMapping[firstIndex + tileIndex] = name;
                }
            }
        }
        return tileMapping;
    }

    parseTiles(data, worldState) {
        let tileMapping = this.getTileMapping(data);

        const layersCount = data.layers.length;
        const tileWidth = data.tilewidth;
        const tileHeight = data.tileheight;
        for (let layerIndex = 0; layerIndex < layersCount; layerIndex++) {
            const layer = data.layers[layerIndex];
            const type = layer.type;
            if (type == "tilelayer") {
                const width = layer.width;
                const height = layer.height;
                worldState.width = width * tileWidth;
                worldState.height = height * tileHeight;
                const layerData = layer.data;
                for (let index = 0; index < width * height; index++) {
                    const type = tileMapping[layerData[index]];
                    if (type) {
                        const x = (index % width) * tileWidth;
                        const y = Math.floor(index / width) * tileHeight;
                        let position = new Vector(x, y);
                        let size = new Vector(tileWidth, tileHeight);
                        let object = this.objectFactory.getObject(type, position, size);
                        worldState.addObject(object);
                    }
                }
            }
        }
    }

    parseObjects(data, worldState) {
        let tileMapping = this.getTileMapping(data);
        let networkBuilder = new NetworkBuilder();

        const layersCount = data.layers.length;
        for (let layerIndex = 0; layerIndex < layersCount; layerIndex++) {
            const layer = data.layers[layerIndex];
            const type = layer.type;
            if (type == "objectgroup") {
                // const layerData = layer.data;
                for (const objectData of layer.objects) {
                    const type = objectData.name;
                    if (type) {
                        const size = new Vector(objectData.width, objectData.height);
                        const position = new Vector(objectData.x, objectData.y - (type == "Gate" ? 0 : size.y));
                        let object = this.objectFactory.getObject(type, position, size, objectData);
                        worldState.addObject(object);

                        if (objectData.properties && objectData.properties.id) {
                            let signalsString = objectData.properties.signals;
                            let signals = signalsString ? signalsString.split(',') : [];
                            networkBuilder.addElement(
                                object,
                                objectData.properties.id,
                                signals,
                                objectData.properties.combiner
                            )
                        }
                    }
                }
            }
        }

        networkBuilder.buildNetwork();
    }

    async toWorldState(level) {
        await level.isLoaded;

        const data = level.data;
        let state = new WorldState();

        this.parseTiles(data, state);
        this.parseObjects(data, state);

        let tileMapping = this.getTileMapping(data);

        return Promise.resolve(state);
    }
}

const GameStatusEnum = new Enum(
    "InProgress",
    "Loading",
    "GameOver"
);

class GameState {
    constructor(params) {
        this.worldStateFactory = new WorldStateFactory(params);
        this.worldState = null;
        this.levels = new Map();
        this.status = GameStatusEnum.Loading;
        this.isLoaded = false;
        this.loadLevel(this.firstLevelName);
        this.lives = 5;
    }

    get firstLevelName() {
        const URL = window.location.href;
        const paramsString = Utils.substringAfter(URL, '?');
        let params = new URLSearchParams(paramsString);
        const name = params.get("level");
        if (name) {
            return name;
        } else {
            return "level_1"
        }
    }

    getLevel(name) {
        return this.levels.get(name);
    }

    addLevel(name) {
        this.levels.set(name, new GameLevel(name));
    }

    async loadLevel(name) {
        this.isLoaded = false;
        this.level = this.getLevel(name);
        if (!this.level) {
            this.addLevel(name);
            this.level = this.getLevel(name);
            await this.level.isLoaded;
        }
        this.worldState = await this.worldStateFactory.toWorldState(this.level);
        this.isLoaded = true;
        return Promise.resolve();
    }

    async restart() {
        this.isLoaded = false;
        this.worldState = await this.worldStateFactory.toWorldState(this.level);
        this.isLoaded = true;
    }

    update(deltaTime) {
        if (this.isLoaded) {
            if (this.worldState.levelPassed) {
                this.loadLevel(this.worldState.nextLevel);
            } else if (this.worldState.levelLost) {
                this.lives -= 1;
                if (this.lives <= 0) {
                    this.status = GameStatusEnum.GameOver;
                } else {
                    this.status = GameStatusEnum.Loading;
                    this.restart();
                }
            } else {
                if (this.status != GameStatusEnum.GameOver) {
                    this.status = GameStatusEnum.InProgress;
                    this.worldState.update(deltaTime);
                }
            }
        } else {
            this.status = GameStatusEnum.Loading;
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
            animationsCollection: this.graphics.animationsCollection,
        });
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
        try {
            const minFPS = 30;
            const maxDeltaTime = 1 / minFPS;
            let deltaTime = Math.min(this.timer.deltaTime, maxDeltaTime);
            this.timer.reset();
            this.update(deltaTime);
        } catch (error) {
            console.log("fatal error:", error);
        }
        requestAnimationFrame(this.tick.bind(this));
    }

    start() {
        requestAnimationFrame(this.tick.bind(this));
    }
}