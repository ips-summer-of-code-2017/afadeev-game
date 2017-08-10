/**
 * @file graphics.js
 * @fileoverview Contains classes related to drawing the game
 */

'use strict';

class ImageLoader {
    constructor(filePath) {
        this.image = new Image();
        this.image.src = filePath;
        this.promise = new Promise((resolve, reject) => {
            this.image.onload = () => {
                resolve(this.image);
            }
            this.image.onerror = () => {
                reject(new Error("Image load failed: " + filePath));
            }
        });
    }

    get value() {
        return this.promise;
    }

    then(...args) {
        return this.promise.then.apply(this.promise, args);
    }

    catch (...args) {
        return this.promise.catch.apply(this.promise, args);
    }
}

class NewSprite {
    constructor(context, image, spriteData) {
        this.context = context;
        this.image = image;
        this.position = spriteData.position;
        this.size = spriteData.size;
        this.offset = spriteData.offset;
        this.fullSize = spriteData.fullSize;
    }

    draw(location) {
        let scale = new Vector(
            location.size.x / this.fullSize.x,
            location.size.y / this.fullSize.y
        );
        if (!Utils.isNull(this.image)) {
            const dstWidth = this.size.x * scale.x;
            const dstHeight = this.size.y * scale.y;
            const dstX = Math.round(location.position.x) + this.offset.x * scale.x;
            const dstY = Math.round(location.position.y) + this.offset.y * scale.y;
            const srcWidth = this.size.x;
            const srcHeight = this.size.y;
            const srcX = this.position.x;
            const srcY = this.position.y;
            this.context.drawImage(
                this.image,
                srcX, srcY, srcWidth, srcHeight,
                dstX, dstY, dstWidth, dstHeight
            );
        } else {
            const dstX = Math.round(position.x);
            const dstY = Math.round(position.y);
            const width = size.x;
            const height = size.y;
            this.context.fillStyle = "gray";
            this.context.fillRect(dstX, dstY, width, height);
        }
    }
}

class SpriteAtlas {
    constructor(context, atlasName) {
        this.context = context;
        this.name = atlasName;
        this.sprites = new Map();
        //this.isLoaded = this.load();
        this.isLoadedFlag = false;
        this.isLoaded = new Promise((resolve, reject) => {
            let timer = setInterval(() => {
                if (this.isLoadedFlag) {
                    resolve(true);
                    clearInterval(timer);
                }
            }, 1000 / 60);
        });
    }

    parseSpriteData(text) {
        let values = text.split("\t");
        let data = {
            name: values[0],
            position: new Vector(parseInt(values[1]), parseInt(values[2])),
            size: new Vector(parseInt(values[3]), parseInt(values[4])),
            offset: new Vector(parseInt(values[5]), parseInt(values[6])),
            fullSize: new Vector(parseInt(values[7]), parseInt(values[8])),
        };
        return data;
    }

    async addSprites(text) {
        const lines = Utils.splitIntoLines(text);
        const imageFileName = Utils.substringAfter(lines[0], " ");
        let image = await new ImageLoader(`sprites/${imageFileName}`);
        console.log(image);
        for (let index = 1; index < lines.length - 1; index++) {
            const spriteData = this.parseSpriteData(lines[index]);
            let sprite = new NewSprite(this.context, image, spriteData);
            console.log(sprite);
            this.sprites.set(spriteData.name, sprite);
        }
        return Promise.resolve();
    }

    getSprite(name) {
        let sprite = this.sprites.get(name);
        return (sprite ? sprite : null);
    }

    async load(index = 1) {
        let text = await fetch(`sprites/${this.name}_${index}.atlas`)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    this.isLoadedFlag = true;
                    return null;
                }
            });
        if (!Utils.isNull(text)) {
            await this.addSprites(text);
            this.load(index + 1);
            console.log(text);
        }
    }

    draw(spriteName, location) {
        let sprite = this.getSprite(spriteName);
        if (sprite) {
            sprite.draw(location);
        }
    }
}

/**
 * @class SpriteSheet
 * @description Represents a sprite sheet
 */
class SpriteSheet {
    /**
     * @method @constructs SpriteSheet
     * @param {CanvasRenderingContext2D} context - Drawing context
     * @param {string} imageFilePath - Path to image file
     * @param {number} tileWidth - Width of sprites
     * @param {number=} tileHeight - Height of sprites
     */
    constructor(context, imageFilePath, tileWidth, tileHeight = tileWidth) {
        this.context = context;
        this.imageFilePath = imageFilePath;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.image = new Image();
        this.tiles = [];
        this.isCompiled = false;
        this.load();
    }

    load() {
        fetch(this.imageFilePath).then((response) => {
            return response.blob();
        }).then((blob) => {
            let imageURL = URL.createObjectURL(blob);
            this.image.src = imageURL;
            this.compile();
            console.log(`Sprite ${this.imageFilePath.substring(this.imageFilePath.lastIndexOf('/') + 1)} is loaded`);
        });
    }

    /**
     * @private @method compile
     * @description Splits image into sectors
     */
    compile() {
        const rows = Math.floor(this.image.height / this.tileHeight);
        const cols = Math.floor(this.image.width / this.tileWidth);
        if (rows && cols) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const index = row * cols + col;
                    this.tiles[index] = {
                        x: col * this.tileWidth,
                        y: row * this.tileHeight
                    };
                }
            }
            this.isCompiled = true;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @method draw
     * @param {number} index - Index of sprite
     * @param {number} x - X coordinate of drawing position
     * @param {number} y - Y coordinate of drawing position
     * @description Draws sprite by index at needed point
     */
    draw(index, x, y) {
        const dstX = Math.round(x);
        const dstY = Math.round(y);
        const width = this.tileWidth;
        const height = this.tileHeight;
        if (this.isCompiled || this.compile()) {
            const srcX = this.tiles[index].x;
            const srcY = this.tiles[index].y;
            this.context.drawImage(
                this.image,
                srcX, srcY, width, height,
                dstX, dstY, width, height
            );
        } else {
            this.context.fillStyle = "gray";
            this.context.fillRect(dstX, dstY, width, height);
        }
    }
}

class NewAnimation {
    constructor(atlas, name) {
        this.atlas = atlas;
        this.name = name;
        this.sprites = [];
        this.isInitialized = false;
        this.initalize();
    }

    async initalize() {
        await this.atlas.isLoaded;
        let sprite;
        do {
            sprite = this.atlas.getSprite(`${this.name}/${this.length}.png`);
            this.sprites.push(sprite);
            this.length += 1;
        } while (sprite);
        this.isInitialized = true;
    }

    get length() {
        return this.sprites.length;
    }

    draw(index, location) {
        if (this.isInitialized) {
            this.sprite[index].draw(location);
        }
    }
}

class AnimationController {
    constructor() {
        this.animations = new Map();
        this.currentAnimation = null;
        this.frameIndex = null;
        this.progress = null;
    }

    addAnimation(name, animation) {
        this.animations.add(name, animation);
    }

    setAnimation(name) {
        this.currentAnimation = this.animations.get(name);
        this.frameIndex = 0;
        this.progress = 0;
    }

    setFramerate(framerate) {
        this.framerate = framerate;
    }

    update(deltaTime) {
        this.progress += deltaTime;
        const deltaFrames = Math.floor(this.progress * this.framerate);
        this.progress %= (1 / this.framerate);
        this.frameIndex += deltaFrames;
        this.frameIndex %= this.currentAnimation.length;
    }

    draw(location) {
        if (this.currentAnimation) {
            this.currentAnimation.draw(this.frameIndex, location);
        }
    }
}

/**
 * @enum {string}
 * @description Enum for camera modes
 */
let CameraModeEnum = {
    Free: "free",
    Following: "following",
}

/**
 * @class Camera
 * @description Represents a camera
 */
class Camera {
    constructor(position = new Vector(0, 0)) {
        this.motion = new Motion(position);
        this.position = position;
        this.targetPosition = position;
        this.alpha = 0.25;
        this.mode = CameraModeEnum.Free;
        this.movementController = null;
        this.followedObject = null;
        this.freeMovementSpeed = 25;
    }

    get x() {
        return this.motion.position.x;
    }

    get y() {
        return this.motion.position.y;
    }

    switchMode() {
        if (this.mode == CameraModeEnum.Free) {
            this.mode = CameraModeEnum.Following;
        } else {
            this.mode = CameraModeEnum.Free;
        }
    }

    setMovementController(movementController) {
        this.movementController = movementController;
    }

    follow(object) {
        this.followedObject = object;
        this.mode = CameraModeEnum.Following;
    }

    update(deltaTime) {
        if (this.mode == CameraModeEnum.Free && this.movementController) {
            let direction = this.movementController.direction;
            this.targetPosition = this.targetPosition
                .add(direction.multiply(this.freeMovementSpeed));
        } else if (this.mode == CameraModeEnum.Following && this.followedObject) {
            this.targetPosition = this.followedObject.position;
        }
        this.position.x = Utils.lerp(this.position.x, this.targetPosition.x, this.alpha);
        this.position.y = Utils.lerp(this.position.y, this.targetPosition.y, this.alpha);
    }
}

/**
 * @class GameGraphics
 * @description Represents game's graphics controller
 */
class GameGraphics {
    /**
     * @method @constructs GameGraphics 
     * @param {Element} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.testSpriteSheet = new SpriteSheet(this.context, "sprites/tilesets/test.png", 64);
        this.textures = {};
        this.camera = null;

        this.atlas = new SpriteAtlas(this.context, "sprites");
        this.isInitalized = false;
        this.initalize()

        this.fullScreen = false;
        this.width = 0;
        this.height = 0;
        this.size = new Vector(this.width, this.height);
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
    }

    async initalize() {
        await this.atlas.isLoaded;
        this.textures[Box.name] = this.atlas.sprites.get("test/1.png");
        this.textures[Wall.name] = this.atlas.sprites.get("tiles/wall.png");
        this.textures[Spikes.name] = this.atlas.sprites.get("tiles/spikes.png");
        this.textures[GameObject.name] = this.atlas.sprites.get("test/4.png");
        this.textures[Character.name] = this.atlas.sprites.get("character/idle/0.png");
        this.textures.background = this.atlas.sprites.get("tiles/background.png");
        this.isInitalized = true;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen();
            } else if (this.canvas.msRequestFullscreen) {
                this.canvas.msRequestFullscreen();
            } else if (this.canvas.mozRequestFullScreen) {
                this.canvas.mozRequestFullScreen();
            } else if (this.canvas.webkitRequestFullscreen) {
                this.canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            // TODO: listen for event 'fullscreenchange'
            this.fullScreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            this.fullScreen = false;
        }
        this.resize();
    }

    resize() {
        const padding = 75;
        this.width = this.fullScreen ? window.innerWidth : window.innerWidth - 2 * padding;
        this.height = this.fullScreen ? window.innerHeight : window.innerHeight - 2 * padding;
        this.size = new Vector(this.width, this.height);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
    }

    setCamera(camera) {
        this.camera = camera;
    }

    drawObject(object) {
        this.textures[object.type].draw(object.boundaryRectangle);
    }

    drawBackground() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.width, this.height);
        let offset = this.getCameraOffset();
        const tileSize = 64;
        const size = new Vector(tileSize, tileSize);
        this.context.translate(offset.x / 2 % 64, offset.y / 2 % 64);
        for (let row = -1; row <= this.height / tileSize + 1; row++) {
            for (let col = -1; col <= this.width / tileSize + 1; col++) {
                const position = new Vector(col * tileSize, row * tileSize);
                let rect = new Rectangle(position, size);
                this.textures.background.draw(rect);
            }
        }
    }

    drawWorldState(worldState) {
        if (worldState && this.camera) {
            let offset = this.getCameraOffset();
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            // this.context.clearRect(0, 0, this.width, this.height);
            this.context.translate(offset.x, offset.y);

            let cameraRectangle = this.cameraRectangle;
            for (let index = 0; index < worldState.objects.length; index++) {
                let object = worldState.objects[index];
                if (cameraRectangle.intersectsWith(object.boundaryRectangle)) {
                    this.drawObject(object);
                }
            }
            this.drawObject(worldState.character);
        }
    }

    drawGameState(gameState) {
        if (this.isInitalized) {
            this.drawBackground();
            this.drawWorldState(gameState.worldState);
        }
    }

    get cameraRectangle() {
        return new Rectangle(
            this.camera.motion.position.add(this.size.multiply(-1 / 2)),
            this.size
        );
    }

    getCameraOffset() {
        let offset = new Vector(
            Math.round(this.width / 2 - this.camera.x),
            Math.round(this.height / 2 - this.camera.y)
            // Math.round(this.width / 2 - character.position.x - character.size.x / 2),
            // Math.round(this.height / 2 - character.position.y - character.size.y / 2)
        );
        return offset;
    }
}