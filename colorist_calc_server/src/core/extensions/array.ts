/* eslint-disable @typescript-eslint/no-this-alias */
export const ArrayExtensions = () => {
  if ([].firstElement === undefined) {
    Array.prototype.firstElement = function () {
      return this[0];
    };
  }
  if ([].equals === undefined) {
    Array.prototype.equals = function (array, strict = true) {
      if (!array) return false;

      if (arguments.length === 1) strict = true;

      if (this.length !== array.length) return false;

      for (let i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
          if (!this[i].equals(array[i], strict)) return false;
        } else if (strict && this[i] !== array[i]) {
          return false;
        } else if (!strict) {
          return this.sort().equals(array.sort(), true);
        }
      }
      return true;
    };
  }
  if ([].lastElement === undefined) {
    Array.prototype.lastElement = function () {
      const instanceCheck = this;
      if (instanceCheck === undefined) {
        return undefined;
      } else {
        const instance = instanceCheck as [];
        return instance[instance.length - 1];
      }
    };
  }
  if ([].isEmpty === undefined) {
    Array.prototype.isEmpty = function () {
      return this.length === 0;
    };
  }
  if ([].isNotEmpty === undefined) {
    Array.prototype.isNotEmpty = function () {
      return this.length !== 0;
    };
  }
  if ([].removeFromEnd === undefined) {
    Array.prototype.removeFromEnd = function () {
      this.pop();
      return this;
    };
  }
  if ([].findAllIndex === undefined) {
    Array.prototype.findAllIndex = function findAllIndex<T>(
      predicate: (value: T, index: number, array: T[]) => boolean
    ): number[] {
      const result: number[] = [];
      for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i, this)) {
          result.push(i);
        }
      }
      return result;
    };
  }
  if ([].addUniqValue === undefined) {
    Array.prototype.addUniqValue = function addUniqValue(element) {
      if (this.includes(element)) {
        return this;
      }
      this.push(element);
      return this;
    };
  }
};
