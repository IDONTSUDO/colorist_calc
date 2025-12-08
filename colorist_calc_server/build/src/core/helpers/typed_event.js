export class TypedEvent {
    constructor() {
        this.listeners = [];
        this.listenersOnces = [];
        this.on = (listener) => {
            this.listeners.push(listener);
            return {
                dispose: () => this.off(listener),
            };
        };
        this.once = (listener) => {
            this.listenersOnces.push(listener);
        };
        this.off = (listener) => {
            const callbackIndex = this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                this.listeners.splice(callbackIndex, 1);
        };
        this.emit = (event) => {
            this.listeners.forEach((listener) => listener(event));
            if (this.listenersOnces.length > 0) {
                const toCall = this.listenersOnces;
                this.listenersOnces = [];
                toCall.forEach((listener) => listener(event));
            }
        };
        this.pipe = (te) => {
            return this.on((e) => te.emit(e));
        };
    }
    waitedEvent(predicate) {
        return new Promise((resolve, _reject) => {
            this.on((e) => {
                const isContinueWatching = predicate(e);
                if (!isContinueWatching) {
                    resolve(e);
                }
            });
        });
    }
}
