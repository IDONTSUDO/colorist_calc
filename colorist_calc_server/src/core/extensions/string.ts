export const StringExtensions = () => {
  if ("".isEmpty === undefined) {
    String.prototype.isEmpty = function () {
      return this.length === 0;
    };
  }
  if ("".pathNormalize === undefined) {
    String.prototype.pathNormalize = function () {
      return this.replace("//", "/");
    };
  }
  if ("".isNotEmpty === undefined) {
    String.prototype.isNotEmpty = function () {
      return this.length !== 0;
    };
  }
  if ("".lastElement === undefined) {
    String.prototype.lastElement = function () {
      return this[this.length - 1];
    };
  }
  if ("".hasPattern === undefined) {
    String.prototype.hasPattern = function (pattern) {
      return new RegExp(pattern).test(this);
    };
  }
  if ("".hasNoPattern === undefined) {
    String.prototype.hasNoPattern = function (pattern) {
      return !this.hasPattern(pattern);
    };
  }
  if ("".isEqual === undefined) {
    String.prototype.isEqual = function (str: string) {
      return this === str;
    };
  }
  if ("".isEqualMany === undefined) {
    String.prototype.isEqualMany = function (str: string[]) {
      for (const el of str) {
        if (el === this) {
          return true;
        }
      }
      return false;
    };
  }
  if ("".allReplace === undefined) {
    String.prototype.allReplace = function replaceAll(search: string, replace: string): string {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // экранируем спецсимволы
      const regex = new RegExp(escapedSearch, 'g');
      return this.replace(regex, replace);
    }
  }
};
