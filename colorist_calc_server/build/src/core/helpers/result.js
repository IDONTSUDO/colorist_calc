/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-namespace */
function isAsyncFn(fn) {
    return fn.constructor.name === "AsyncFunction";
}
function isResult(value) {
    return value instanceof Ok || value instanceof Err;
}
function syncThenable() {
    function then(cb) {
        const result = cb();
        if (result instanceof Promise) {
            return result;
        }
        return syncThenable();
    }
    return {
        isSync: true,
        then,
    };
}
function forEachValueThunkOrPromise(items, execFn, foldFn) {
    let shouldBreak = false;
    const result = items.reduce((prev, valueOrThunk) => {
        return prev.then(() => {
            if (shouldBreak) {
                return null;
            }
            function run(value) {
                const isSuccess = execFn(value);
                if (!isSuccess) {
                    shouldBreak = true;
                }
            }
            const valueOrPromise = typeof valueOrThunk === "function" ? valueOrThunk() : valueOrThunk;
            if (valueOrPromise instanceof Promise) {
                return valueOrPromise.then(run);
            }
            return run(valueOrPromise);
        });
    }, syncThenable());
    if (result.isSync) {
        return foldFn();
    }
    return result.then(() => {
        return foldFn();
    });
}
export var Result;
(function (Result) {
    function ok(value, rollbackFn) {
        return new Ok(value || null, rollbackFn);
    }
    Result.ok = ok;
    function error(error, rollbackFn) {
        return new Err(error, rollbackFn);
    }
    Result.error = error;
    function safe(errOrFn, fn) {
        const hasCustomError = fn !== undefined;
        const execute = hasCustomError ? fn : errOrFn;
        function getError(caughtError) {
            if (!hasCustomError) {
                return caughtError;
            }
            if (typeof errOrFn === "function") {
                return new errOrFn(caughtError);
            }
            return errOrFn;
        }
        try {
            const resultOrPromise = execute();
            if (resultOrPromise instanceof Promise) {
                return resultOrPromise
                    .then((okValue) => {
                    return isResult(okValue) ? okValue : Result.ok(okValue);
                })
                    .catch((caughtError) => error(getError(caughtError)));
            }
            return isResult(resultOrPromise) ? resultOrPromise : Result.ok(resultOrPromise);
        }
        catch (caughtError) {
            return error(getError(caughtError));
        }
    }
    Result.safe = safe;
    function combine(...items) {
        if (!items.length) {
            throw new Error("Expected at least 1 argument");
        }
        const values = [];
        const rollbacks = [];
        let error = null;
        function rollback() {
            const reversedRollbacks = rollbacks.reverse();
            const wrappedRollbackFns = reversedRollbacks.map((fn) => Result.wrap(fn));
            let error = null;
            return forEachValueThunkOrPromise(wrappedRollbackFns, (result) => {
                if (result.isFailure()) {
                    error = Result.error(result.error);
                    return false;
                }
                return true;
            }, () => error || ok());
        }
        return forEachValueThunkOrPromise(items, (result) => {
            if (result.isFailure()) {
                error = Result.error(result.error, rollback);
                return false;
            }
            values.push(result.value);
            rollbacks.push(() => result.rollback());
            return true;
        }, () => error || ok(values, rollback));
    }
    Result.combine = combine;
    function wrap(fn) {
        return function wrapped(...args) {
            try {
                const resultOrPromise = fn(...args);
                if (resultOrPromise instanceof Promise) {
                    return resultOrPromise.then((okValue) => Result.ok(okValue)).catch((err) => error(err));
                }
                return ok(resultOrPromise);
            }
            catch (err) {
                return error(err);
            }
        };
    }
    Result.wrap = wrap;
})(Result || (Result = {}));
class Base {
    constructor(rollbackFn) {
        this.rollbackFn = rollbackFn;
    }
    errorOrNull() {
        if (this.isSuccess()) {
            return null;
        }
        return this.error;
    }
    getOrNull() {
        if (this.isFailure()) {
            return null;
        }
        return this.value;
    }
    toString() {
        throw new Error("Method not implemented.");
    }
    inspect() {
        return this.toString();
    }
    fold(onSuccess, onFailure) {
        if (this.isFailure()) {
            return onFailure(this.error);
        }
        return onSuccess(this.value);
    }
    getOrDefault(defaultValue) {
        if (this.isSuccess()) {
            return this.value;
        }
        return defaultValue;
    }
    getOrElse(onFailure) {
        if (this.isSuccess()) {
            return isAsyncFn(onFailure) ? Promise.resolve(this.value) : this.value;
        }
        return onFailure(this.error);
    }
    getOrThrow() {
        if (this.isFailure()) {
            throw this.error;
        }
        return this.value;
    }
    isSuccess() {
        throw new Error("Method not implemented.");
    }
    isFailure() {
        throw new Error("Method not implemented.");
    }
    map(fn) {
        if (this.isFailure()) {
            return isAsyncFn(fn) ? Promise.resolve(this) : this;
        }
        const result = Result.safe(() => fn(this.value));
        return result;
    }
    rollback() {
        if (this.rollbackFn) {
            return this.rollbackFn();
        }
        return null;
    }
}
class Ok extends Base {
    constructor(val, rollbackFn) {
        super(rollbackFn);
        this.value = val;
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
    toString() {
        return `Result.Ok(${this.value})`;
    }
    forward() {
        return Result.ok(this.value);
    }
}
class Err extends Base {
    constructor(err, rollbackFn) {
        super(rollbackFn);
        this.error = err;
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
    toString() {
        return `Result.Error(${this.error})`;
    }
    forward() {
        return Result.error(this.error);
    }
}
