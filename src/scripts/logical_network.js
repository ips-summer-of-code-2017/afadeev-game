/**
 * @file logical_network.js
 * @fileoverview Contains classes related to logical network
 */

let Combiner = new Enum(
    "manual",
    "anyof",
    "allof",
    "noneof"
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

    onSignalUpdate() {
        // do nothing
    }

    _setIsActive(isActive) {
        if (isActive != this.isActive) {
            this.isActive = isActive;
            this.onSignalUpdate();
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
     * @param {NetworkElement} element 
     * @param {Array<String>} signals
     * @param {String} combiner - combiner function name, see Combiner enum
     */
    addElement(element, name, signals, combiner) {
        this.elements.set(name, {
            element: element,
            signals: signals.map(Utils.trim),
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
    }
}