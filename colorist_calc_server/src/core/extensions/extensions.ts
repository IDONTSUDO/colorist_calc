import { ArrayExtensions } from "./array";
import { BufferExtensions } from "./buffer";

import { StringExtensions } from "./string";

declare global {
  interface Array<T> {
    // @strict: The parameter is determined whether the arrays must be exactly the same in content and order of this relationship or simply follow the same requirements.
    equals(array: Array<T>, strict: boolean): boolean;
    lastElement(): T | undefined;
    firstElement(): T | undefined;
    isEmpty(): boolean;
    isNotEmpty(): boolean;
    removeFromEnd(): Array<T>;
    findAllIndex(
      predicate: (value: T, index: number, array: T[]) => boolean
    ): Array<Number>;
    addUniqValue(value: T): Array<T>;
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
    allReplace(search: string, replace: string);
  }
  interface BufferConstructor {
    joinBuffers(buffers: Array<Buffer>, delimiter?: string);
  }
}
export const extensions = () => {
  ArrayExtensions();
  StringExtensions();
  BufferExtensions();
};
