/**
 * @file graphics.js
 * @fileoverview Contains classes related to drawing the game
 */

'use strict';

class Sprite {
    constructor(context, image, spriteData) {
        this.context = context;
        this.image = image;
        this.position = spriteData.position;
        this.size = spriteData.size;
        this.offset = spriteData.offset;
        this.fullSize = spriteData.fullSize;
    }

    draw(location, mirrored) {
        let scale = new Vector(
            location.size.x / this.fullSize.x,
            location.size.y / this.fullSize.y
        );
        if (!Utils.isNull(this.image)) {
            if (mirrored) {
                this.context.save();
                this.context.scale(-1, 1);
                this.context.translate(-location.left * 2 - 2 * this.fullSize.x, 0);
            }
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
            if (mirrored) {
                this.context.restore();
            }
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
        // this.animations = new AnimationsAtlas();
        this.isLoaded = this.load();
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

    getSprite(name) {
        let sprite = this.sprites.get(name);
        return (sprite ? sprite : null);
    }

    fetchSprite(name) {
        return fetch(`sprites/${name}`).then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`Sprite "${name}" load failed with status ${response.status}`);
            }
        })
    }

    loadSpriteContent(text) {
        const lines = Utils.splitIntoLines(text);
        const imageFileName = Utils.substringAfter(lines[0], " ");

        let image = new Image();
        image.src = `sprites/${imageFileName}`;
        let promise = new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image);
            }
            image.onerror = () => {
                reject(new Error("Image load failed: " + imageFileName));
            }
        });

        return promise.then((image) => {
            for (let index = 1; index < lines.length - 1; index++) {
                const spriteData = this.parseSpriteData(lines[index]);
                const sprite = new Sprite(this.context, image, spriteData);
                this.sprites.set(spriteData.name, sprite);
            }
            console.log(`Spritesheet ${imageFileName} is loaded`)
        });
    }

    load() {
        return this.fetchSprite('index.txt').then((text) => {
            const lines = Utils.splitIntoNonEmptyLines(text);
            const sprites = lines.map((line) => {
                return this.fetchSprite(line).then((text) => {
                    return this.loadSpriteContent(text);
                });
            });
            return Promise.all(sprites);
        }).catch((error) => {
            alert(error);
            throw error;
        });
    }

    draw(spriteName, rectangle) {
        let sprite = this.getSprite(spriteName);
        if (sprite) {
            sprite.draw(rectangle);
        }
    }
}

/**
 * @class AnimationsCollection
 */
class AnimationsCollection {
    constructor(atlas) {
        this.atlas = atlas;
        this.animations = new Map();
        this.onload = () => {};
        this.isLoaded = new Promise((resolve, reject) => {
            this.onload = resolve;
        });
        this.load();
    }

    async load() {
        await this.atlas.isLoaded;
        let animationPaths = new Set();
        for (let name of this.atlas.sprites.keys()) {
            const dir = Utils.getFileDirectory(name);
            if (this.isAnimationPath(dir)) {
                if (!animationPaths.has(dir)) {
                    console.log(`Found animation ${dir}`);
                }
                animationPaths.add(dir);
            }
        }

        for (let path of animationPaths) {
            this.animations.set(path, new Animation(this.atlas, path));
        }

        this.onload();
    }

    getAnimation(name) {
        return this.animations.get(name);
    }

    isAnimationPath(dir) {
        const dirComponents = dir.split('/');
        if (dirComponents.length >= 2) {
            const indexOfAnimationName = dirComponents.length - 2;
            const keyword = "anim";
            return (dirComponents[indexOfAnimationName].indexOf(keyword) == 0);
        } else {
            return false;
        }
    }
}

class Animation {
    constructor(atlas, name) {
        this.atlas = atlas;
        this.name = name;
        this.sprites = [];
        this.isInitialized = false;
        this.initalize();
    }

    async initalize() {
        await this.atlas.isLoaded;
        let sprite = this.atlas.getSprite(`${this.name}${this.length}.png`);
        do {
            this.sprites.push(sprite);
            sprite = this.atlas.getSprite(`${this.name}${this.length}.png`);
        } while (sprite);
        this.isInitialized = true;
    }

    get length() {
        return this.sprites.length;
    }

    draw(index, rectangle, mirrored) {
        if (this.isInitialized) {
            this.sprites[index].draw(rectangle, mirrored);
        }
    }
}

class AnimationController {
    constructor(animationsCollection) {
        this.animationsCollection = animationsCollection;
        this.currentAnimation = null;
        this.frameIndex = null;
        // progress of current frame in range [0..1]
        this.progress = null;
        this.isMirrored = false;
        this.setFramerate(15);
    }

    async setAnimation(name) {
        await this.animationsCollection.isLoaded;
        let animation = this.animationsCollection.getAnimation(name);
        if (animation != this.currentAnimation) {
            this.currentAnimation = animation;
            this.frameIndex = 0;
            this.progress = 0;
        }
    }

    setFramerate(framerate) {
        this.framerate = framerate;
    }

    update(deltaTime) {
        if (this.currentAnimation) {
            this.progress += deltaTime;
            const deltaFrames = Math.floor(this.progress * this.framerate);
            this.progress %= (1 / this.framerate);
            this.frameIndex += deltaFrames;
            this.frameIndex %= this.currentAnimation.length;
        }
    }

    draw(rectangle) {
        if (this.currentAnimation && !Utils.isNull(this.frameIndex)) {
            this.currentAnimation.draw(this.frameIndex, rectangle, this.isMirrored);
        }
    }
}

class CharacterAnimationController extends AnimationController {
    constructor(animationsCollection) {
        super(animationsCollection);
        this.movementController = null;
    }

    setMovementController(movementController) {
        this.movementController = movementController;
    }

    idle() {
        this.setAnimation("character/anim_idle/");
    }

    walkRight() {
        this.setAnimation("character/anim_walk/");
        this.isMirrored = false;
    }

    walkLeft() {
        this.setAnimation("character/anim_walk/");
        this.isMirrored = true;
    }

    update(deltaTime) {

        if (this.movementController) {
            if (this.movementController.goingLeft) {
                this.walkLeft();
            } else if (this.movementController.goingRight) {
                this.walkRight();
            } else {
                this.idle();
            }
        }
        super.update(deltaTime);
    }
}

class LampAnimationController extends AnimationController {
    setIsActive(isActive) {
        if (isActive) {
            this.setAnimation("lamp/anim_on/");
        } else {
            this.setAnimation("lamp/anim_off/");
        }
    }
}

class PlateAnimationController extends AnimationController {
    setIsActive(isActive) {
        if (isActive) {
            this.setAnimation("plate/anim_on/");
        } else {
            this.setAnimation("plate/anim_off/");
        }
    }
}

class LevelAnimationController extends AnimationController {
    setIsActive(isActive) {
        if (isActive) {
            this.setAnimation("lever/anim_on/");
        } else {
            this.setAnimation("lever/anim_off/");
        }
    }
}

class PistonAnimationController extends AnimationController {
    setIsActive(isActive) {
        if (isActive) {
            this.setAnimation("piston/anim_on/");
        } else {
            this.setAnimation("piston/anim_off/");
        }
    }
}

class PlatformAnimationController extends AnimationController {
    setIsActive(isActive) {
        if (isActive) {
            this.setAnimation("piston/anim_on/");
        } else {
            this.setAnimation("piston/anim_off/");
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
        this.camera = null;

        this.atlas = new SpriteAtlas(this.context, "sprites");
        this.animationsCollection = new AnimationsCollection(this.atlas);
        this.isInitalized = false;
        this.textures = {};
        this.initialize()

        this.fullScreen = false;
        this.width = 0;
        this.height = 0;
        this.size = new Vector(this.width, this.height);
        window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener("load", this.resize.bind(this));
    }

    async initialize() {
        await this.atlas.isLoaded;
        this.textures[Box.name] = this.atlas.sprites.get("test/1.png");
        this.textures[Wall.name] = this.atlas.sprites.get("tiles/wall.png");
        this.textures[Spikes.name] = this.atlas.sprites.get("tiles/spikes.png");
        this.textures[GameObject.name] = this.atlas.sprites.get("test/4.png");
        this.textures[Character.name] = this.atlas.sprites.get("character/anim_idle/0.png");
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
        // this.width = this.fullScreen ? window.innerWidth : window.innerWidth - 2 * padding;
        // this.height = this.fullScreen ? window.innerHeight : window.innerHeight - 2 * padding;
        this.width = this.canvas.scrollWidth;
        this.height = this.canvas.scrollHeight;
        this.size = new Vector(this.width, this.height);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // this.canvas.style.width = `${this.width}px`;
        // this.canvas.style.height = `${this.height}px`;
    }

    setCamera(camera) {
        this.camera = camera;
    }

    drawLine(pointA, pointB, color, position = new Vector(0, 0)) {
        this.context.strokeStyle = color;
        this.context.lineWidth = 3;
        this.context.beginPath();
        this.context.moveTo(pointA.x + position.x, pointA.y + position.y);
        this.context.lineTo(pointB.x + position.x, pointB.y + position.y);
        this.context.stroke();
        // debugger
    }

    drawPolyline(polyline, color, position = new Vector(0, 0)) {
        for (let index = 1; index < polyline.length; index++) {
            this.drawLine(polyline[index - 1], polyline[index], color, position);
        }
    }

    drawObject(object) {
        if (object.draw) {
            object.draw();
        } else if (object.polyline) {
            this.drawPolyline(object.polyline, object.color, object.position);
        } else {
            this.textures[object.type].draw(object.boundaryRectangle);
        }
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

    get UIScale() {
        const heightToWidthOptimalRatio = 9 / 16;
        const optimalHeight = Math.min(this.width * heightToWidthOptimalRatio, this.height);
        const scale = Math.min(optimalHeight / 720, 1);
        return scale;
    }

    drawHeart(rectangle) {
        this.context.strokeStyle = "#000000";
        this.context.strokeWeight = 3;
        this.context.lineWidth = 5.0;
        this.context.fillStyle = "#FF0000";
        const w = rectangle.width;
        const h = rectangle.height;
        const pX = rectangle.left;
        const pY = rectangle.up;
        this.context.beginPath();
        this.context.moveTo(pX, pY + h / 4);
        this.context.quadraticCurveTo(pX, pY, pX + w / 4, pY);
        this.context.quadraticCurveTo(pX + w / 2, pY, pX + w / 2, pY + h / 4);
        this.context.quadraticCurveTo(pX + w / 2, pY, pX + w * 3 / 4, pY);
        this.context.quadraticCurveTo(pX + w, pY, pX + w, pY + h / 4);
        this.context.quadraticCurveTo(pX + w, pY + h / 2, pX + w * 3 / 4, pY + h * 3 / 4);
        this.context.lineTo(pX + w / 2, pY + h);
        this.context.lineTo(pX + w / 4, pY + h * 3 / 4);
        this.context.quadraticCurveTo(pX, pY + h / 2, pX, pY + h / 4);
        this.context.stroke();
        this.context.fill();
    }

    drawLives(livesCount) {
        const heartSize = 64 * this.UIScale;
        const commonWidth = (1 + Math.log2(livesCount)) * heartSize;
        const offset = new Vector(16 * this.UIScale, 16 * this.UIScale);
        const deltaX = (livesCount == 1) ? 0 : (commonWidth - heartSize) / (livesCount - 1);
        const size = new Vector(heartSize, heartSize);
        for (let index = 0; index < livesCount; index++) {
            const position = new Vector(index * deltaX, 0).add(offset);
            this.drawHeart(new Rectangle(position, size));
        }
    }

    drawUI(gameState) {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.drawLives(gameState.lives);
    }

    drawLoadingScreen() {

    }

    drawGameOverScreen() {

    }

    drawGameState(gameState) {
        if (this.isInitalized) {
            if (gameState.status == GameStatusEnum.Loading) {
                this.drawLoadingScreen();
            } else if (gameState.status == GameStatusEnum.GameOver) {
                this.drawBackground();
                this.drawWorldState(gameState.worldState);
                this.drawGameOverScreen();
            } else {
                this.drawBackground();
                this.drawWorldState(gameState.worldState);
                this.drawUI(gameState);
            }
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