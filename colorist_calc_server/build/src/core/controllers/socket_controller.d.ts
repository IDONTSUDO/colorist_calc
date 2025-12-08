import { TypedEvent } from "../helpers/typed_event";
export declare class SocketSubscriber<T> {
    emitter: TypedEvent<T>;
    event: string;
    constructor(emitter: TypedEvent<T>, event: string);
}
