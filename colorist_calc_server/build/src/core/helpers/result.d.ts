export type Result<ErrorType, OkType, RollbackFn extends RollbackFunction = any> = Ok<ErrorType, OkType, RollbackFn> | Err<ErrorType, OkType, RollbackFn>;
interface IResult<ErrorType, OkType> {
    isSuccess(): this is Ok<ErrorType, OkType, any>;
    isFailure(): this is Err<ErrorType, OkType, any>;
    getOrNull(): OkType | null;
    toString(): string;
    inspect(): string;
    fold<R>(onSuccess: (value: OkType) => R, onFailure: (error: ErrorType) => R): R;
    fold<R>(onSuccess: (value: OkType) => Promise<R>, onFailure: (error: ErrorType) => Promise<R>): Promise<R>;
    getOrDefault(defaultValue: OkType): OkType;
    getOrElse(onFailure: (error: ErrorType) => OkType): OkType;
    getOrElse(onFailure: (error: ErrorType) => Promise<OkType>): Promise<OkType>;
    getOrThrow(): OkType;
    map<T>(fn: (value: OkType) => Promise<T>): Promise<JoinErrorTypes<ErrorType, T extends Result<any, any, any> ? T : Result<Error, T, any>>>;
    map<T>(fn: (value: OkType) => T): JoinErrorTypes<ErrorType, T extends Result<any, any, any> ? T : Result<Error, T, any>>;
    rollback(): Result<Error, void> | Promise<Result<Error, void>>;
}
type InferErrorType<T extends Result<any, any, any>> = T extends Result<infer Errortype, any, any> ? Errortype : never;
type InferOkType<T extends Result<any, any, any>> = T extends Result<any, infer OkType, any> ? OkType : never;
type JoinErrorTypes<ErrorType, B extends Result<any, any, any>> = Result<ErrorType | InferErrorType<B>, InferOkType<B>, any>;
type ExtractErrorTypes<Tuple extends any[]> = {
    [Index in keyof Tuple]: Tuple[Index] extends Result<any, any, any> ? InferErrorType<Tuple[Index]> : never;
}[number];
type MapResultTupleToOkTypeTuple<Tuple extends any[]> = {
    [Index in keyof Tuple]: Tuple[Index] extends Result<any, any, any> ? InferOkType<Tuple[Index]> : never;
};
type RollbackFunction = (() => void) | (() => Promise<void>);
type HasAsyncRollbackFunction<T extends any[]> = {
    [Index in keyof T]: T[Index] extends () => Promise<infer U> | infer U ? U extends Result<any, any, () => Promise<void>> ? true : false : false;
}[number] extends false ? false : true;
type UnwrapThunks<T extends any[]> = {
    [Index in keyof T]: T[Index] extends () => Promise<infer U> ? U : T[Index] extends () => infer U ? U : T[Index];
};
type HasAsyncThunk<T extends any[]> = {
    [Index in keyof T]: T[Index] extends () => Promise<any> ? true : false;
}[number] extends false ? false : true;
type PromiseReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U> ? U : never;
export declare namespace Result {
    export function ok<ErrorType extends unknown, OkType, RollbackFn extends RollbackFunction = any>(value?: OkType, rollbackFn?: RollbackFn): Result<ErrorType, OkType, RollbackFn>;
    export function error<ErrorType extends unknown, OkType extends unknown, RollbackFn extends RollbackFunction = any>(error: ErrorType, rollbackFn?: RollbackFn): Result<ErrorType, OkType, RollbackFn>;
    type SafeReturnType<E, T> = T extends Result<any, any, any> ? Result<E | InferErrorType<T>, InferOkType<T>, never> : Result<E, T, never>;
    export function safe<T>(fn: () => Promise<T>): Promise<SafeReturnType<Error, T>>;
    export function safe<T>(fn: () => T): SafeReturnType<Error, T>;
    export function safe<ErrorType, T>(err: ErrorType | (new (...args: any[]) => ErrorType), fn: () => Promise<T>): Promise<SafeReturnType<ErrorType, T>>;
    export function safe<ErrorType, T>(err: ErrorType | (new (...args: any[]) => ErrorType), fn: () => T): SafeReturnType<ErrorType, T>;
    type CombineResult<T extends (unknown | (() => unknown) | (() => Promise<unknown>))[]> = Result<ExtractErrorTypes<UnwrapThunks<T>>, MapResultTupleToOkTypeTuple<UnwrapThunks<T>>, HasAsyncRollbackFunction<T> extends true ? () => Promise<void> : () => void>;
    export function combine<T extends (unknown | (() => unknown) | (() => Promise<unknown>))[]>(...items: T): HasAsyncThunk<T> extends true ? Promise<CombineResult<T>> : CombineResult<T>;
    export function wrap<Fn extends (...args: any) => Promise<any>>(fn: Fn): (...args: Parameters<Fn>) => Promise<Result<Error, PromiseReturnType<Fn>, never>>;
    export function wrap<Fn extends (...args: any) => any>(fn: Fn): (...args: Parameters<Fn>) => Result<Error, ReturnType<Fn>, never>;
    export {};
}
declare abstract class Base<ErrorType extends unknown, OkType extends unknown, RollbackFn extends RollbackFunction> implements IResult<ErrorType, OkType> {
    protected readonly rollbackFn?: RollbackFn;
    constructor(rollbackFn?: RollbackFn);
    errorOrNull(): ErrorType | null;
    getOrNull(): OkType | null;
    toString(): string;
    inspect(): string;
    fold<R>(onSuccess: (value: OkType) => R, onFailure: (error: ErrorType) => R): R;
    fold<R>(onSuccess: (value: OkType) => Promise<R>, onFailure: (error: ErrorType) => Promise<R>): Promise<R>;
    getOrDefault(defaultValue: OkType): OkType;
    getOrElse(onFailure: (error: ErrorType) => OkType): OkType;
    getOrElse(onFailure: (error: ErrorType) => Promise<OkType>): Promise<OkType>;
    getOrThrow(): OkType;
    isSuccess(): this is Ok<ErrorType, OkType, RollbackFn>;
    isFailure(): this is Err<ErrorType, OkType, RollbackFn>;
    map<T>(fn: (value: OkType) => Promise<T>): Promise<JoinErrorTypes<ErrorType, T extends Result<any, any, any> ? T : Result<Error, T, any>>>;
    map<T>(fn: (value: OkType) => T): JoinErrorTypes<ErrorType, T extends Result<any, any, any> ? T : Result<Error, T, any>>;
    rollback(): RollbackFn extends RollbackFunction ? RollbackFn extends () => Promise<void> ? Promise<Result<Error, void>> : Result<Error, void> : void;
}
declare class Ok<ErrorType extends unknown, OkType extends unknown, RollbackFn extends RollbackFunction> extends Base<ErrorType, OkType, RollbackFn> {
    readonly value: OkType;
    constructor(val: OkType, rollbackFn?: RollbackFn);
    isSuccess(): this is Ok<ErrorType, OkType, RollbackFn>;
    isFailure(): this is Err<ErrorType, OkType, RollbackFn>;
    toString(): string;
    forward(): Result<any, OkType, RollbackFn>;
}
declare class Err<ErrorType extends unknown, OkType extends unknown, RollbackFn extends RollbackFunction> extends Base<ErrorType, OkType, RollbackFn> {
    readonly error: ErrorType;
    constructor(err: ErrorType, rollbackFn?: RollbackFn);
    isSuccess(): this is Ok<ErrorType, OkType, RollbackFn>;
    isFailure(): this is Err<ErrorType, OkType, RollbackFn>;
    toString(): string;
    forward(): Result<ErrorType, any, RollbackFn>;
}
export {};
