export interface Listener<T> {
    (event: T): any;
}
export interface Disposable {
    dispose(): void;
}
export declare class TypedEvent<T> {
    private listeners;
    listenersOnces: Listener<T>[];
    waitedEvent(predicate: (e: T) => boolean): Promise<T>;
    on: (listener: Listener<T>) => Disposable;
    once: (listener: Listener<T>) => void;
    off: (listener: Listener<T>) => void;
    emit: (event: T) => void;
    pipe: (te: TypedEvent<T>) => Disposable;
}
