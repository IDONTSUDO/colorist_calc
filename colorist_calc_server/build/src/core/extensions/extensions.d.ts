declare global {
    interface Array<T> {
        equals(array: Array<T>, strict: boolean): boolean;
        lastElement(): T | undefined;
        firstElement(): T | undefined;
        isEmpty(): boolean;
        isNotEmpty(): boolean;
    }
    interface String {
        isEmpty(): boolean;
        isNotEmpty(): boolean;
        lastElement(): string;
        hasPattern(pattern: string): boolean;
        hasNoPattern(pattern: string): boolean;
        pathNormalize(): string;
        isEqual(str: string): boolean;
        isEqualMany(str: string[]): boolean;
    }
}
export declare const extensions: () => void;
