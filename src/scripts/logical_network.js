/**
 * @file logical_network.js
 * @fileoverview Contains classes related to logical network
 */

let Combiner = new Enum(
    "manual",
    "anyof",
    "allof",
    "noneof",
);

class AbstractCombiner {
    shouldBeActive(emitters) {
        throw new Error("method shouldBeActive is absract");
    }

    canForceActivation() {
        return false;
    }

    isEmitterActive(emitter) {
        return emitter.isActive
    }
}

class ManualCombiner extends AbstractCombiner {
    shouldBeActive(emitters) {
        throw new Error("manual activated element cannot have emitters");
    }

    canForceActivation() {
        return true;
    }
}

class NoneOfCombiner extends AbstractCombiner {
    shouldBeActive(emitters) {
        for (let item of emitters) {
            if (item.isActive) {
                return false;
            }
        }
        return true;
    }
}

class AnyOfCombiner extends AbstractCombiner {
    shouldBeActive(emitters) {
        for (let item of emitters) {
            if (item.isActive) {
                return true;
            }
        }
        return false;
    }
}

class AllOfCombiner extends AbstractCombiner {
    shouldBeActive(emitters) {
        for (let item of emitters) {
            if (!item.isActive) {
                return false;
            }
        }
        return true;
    }
}

class NetworkElement {
    constructor() {
        this.combiner = null;
        this.emitters = new Set();
        this.receivers = new Set();
        this.isActive = false;
    }

    setCombiner(combiner) {
        this.combiner = combiner;
    }

    addEmitter(object) {
        this.emitters.add(object);
        object._addReceiver(this);
    }

    /**
     * Called when any emitter changes input signal
     */
    signal() {
        const active = this.combiner.shouldBeActive(this.emitters);
        this._setIsActive(active);
    }

    forceIsActive(isActive) {
        if (!this.combiner.canForceActivation()) {
            throw new Error("cannot force activation for this element");
        }
        this._setIsActive(isActive)
    }

    _setIsActive(isActive) {
        if (isActive != this.isActive) {
            this.isActive = isActive;
            for (let receiver of this.receivers) {
                receiver.signal()
            }
        }
    }

    _addReceiver(object) {
        this.receivers.add(object);
    }
}

class NetworkBuilder {
    constructor() {
        this.elements = new Map();
    }

    /**
     * 
     * @param {NetworkElement} elem 
     * @param {Array<String>} signals
     * @param {String} combiner - combiner function name, see Combiner enum
     */
    addElement(element, name, signals, combiner) {
        this.elements.set(name, {
            element: element,
            signals: signals,
            combiner: combiner,
        });
    }

    getElement(name) {
        return this.elements.get(name).element;
    }

    /**
     * Connects elements with each other.
     */
    buildNetwork() {
        let combiners = {
            "manual": new ManualCombiner(),
            "anyof": new AnyOfCombiner(),
            "allof": new AllOfCombiner(),
            "noneof": new NoneOfCombiner(),
        }

        for (let entry of this.elements) {
            let elementData = entry[1];
            let element = elementData.element;
            for (let signal of elementData.signals) {
                this.getElement(signal).addEmitter(element);
            }
            element.setCombiner(combiners[elementData.combiner]);
        }
        // TODO: implement me
    }
}

let networkBuilder = new NetworkBuilder();
networkBuilder.addElement(
    new NetworkElement(),
    "lever1", ["lamp2", "lift1", "gate1"],
    "manual"
);
networkBuilder.addElement(
    new NetworkElement(),
    "lever2", ["lamp1", "piston1", "piston2", "gate1"],
    "manual"
);
networkBuilder.addElement(new NetworkElement(), "lamp1", [], "anyof");
networkBuilder.addElement(new NetworkElement(), "lamp2", [], "anyof");
networkBuilder.addElement(new NetworkElement(), "lift1", [], "anyof");
networkBuilder.addElement(new NetworkElement(), "gate1", [], "anyof");
networkBuilder.addElement(new NetworkElement(), "piston1", [], "anyof");
networkBuilder.addElement(new NetworkElement(), "piston2", [], "anyof");

networkBuilder.buildNetwork();
console.log("Network Builder:", networkBuilder);

/*
class LogicalLink {
    constructor(emitter, receiver) {
        emitter.addOutput(this);
        receiver.addInput(this);

        this.receiver = receiver;
        this.isActive = false;
    }

    enable() {
        if (!this.isActive) {
            this.isActive = true;
            this.receiver.update(this);
        }
    }

    disable() {
        if (this.isActive) {
            this.isActive = false;
            this.receiver.update(this);
        }
    }
}

class LogicalElement {
    constructor() {
        this.inputs = new Set();
        this.outputs = new Set();
    }

    update(link) {
        //do nothing
    }

    addInput(link) {
        this.inputs.add(link);
    }

    addOutput(link) {
        this.outputs.add(link);
    }
}

class LogicalAnyOfCombiner extends LogicalElement {
    constructor() {
        super();
        this.signalStrength = 0;
    }

    update(link) {
        if (link.isActive) {
            this.signalStrength += 1;
            if (this.signalStrength == 1) { // 0 -> 1
                for (let output of this.outputs) {
                    output.enable();
                }
            }
        } else {
            this.signalStrength -= 1;
            if (this.signalStrength == 0) { // 1 -> 0
                for (let output of this.outputs) {
                    output.disable();
                }
            }
        }
    }
}

class LogicalNetwork {
    constructor() {
        this.channels = new Map();
    }

    findOrInsertChannel(name) {
        if (!this.channels.get(name)) {
            this.channels.set(name, new LogicalAnyOfCombiner());
        }
        return this.channels.get(name);
    }
}

let testLink = null;

class LogicalTest extends LogicalElement {
    constructor(network) {
        super();
        this.network = network;
    }

    update(link) {
        if (link.isActive) {
            console.log("I'm enabled");
        } else {
            console.log("I'm disabled");
        }
    }

    addChannel(name) {
        testLink = new LogicalLink(this, network.findOrInsertChannel(name));
        new LogicalLink(network.findOrInsertChannel(name), this);
    }
}

let network = new LogicalNetwork();
let test = new LogicalTest(network);
test.findOrInsertChannel("test");
testLink.enable();
testLink.disable();
testLink.enable();
testLink.disable();
testLink.enable();
testLink.disable();
testLink.enable();
testLink.disable();
*/