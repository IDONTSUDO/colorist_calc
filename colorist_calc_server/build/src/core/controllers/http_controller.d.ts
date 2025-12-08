import { Result } from "../helpers/result";
import { Request, Response } from "express";
import { CoreValidation } from "../validations/core_validation";
import { IRouteModel, Routes } from "../models/routes";
export type HttpMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "PATCH" | "HEAD";
export type ResponseBase = Promise<Result<any, any>>;
export declare abstract class CallbackStrategyWithEmpty {
    abstract call(): ResponseBase;
}
export declare abstract class CallbackStrategyWithValidationModel<V> {
    abstract validationModel: V;
    abstract call(model: V): ResponseBase;
}
export declare abstract class CallbackStrategyWithIdQuery {
    abstract idValidationExpression: CoreValidation;
    abstract call(id: string): ResponseBase;
}
export declare abstract class CallBackStrategyWithQueryPage {
    abstract validationPageExpression: RegExp | null;
    abstract call(page: string): ResponseBase;
}
export declare abstract class CallbackStrategyWithFileUpload {
    abstract checkingFileExpression: RegExp;
    abstract idValidationExpression: CoreValidation;
    abstract call(file: File, id: string): ResponseBase;
}
export declare abstract class CallbackStrategyWithFilesUploads {
    abstract chuckingFileExpressions: RegExp[];
    abstract call(files: File[]): ResponseBase;
}
export declare class SubRouter<A> implements ISubSetFeatureRouter<A> {
    method: HttpMethodType;
    subUrl: string;
    fn: CallbackStrategyWithValidationModel<A> | CallbackStrategyWithEmpty | CallbackStrategyWithIdQuery | CallBackStrategyWithQueryPage | CallbackStrategyWithFileUpload | CallbackStrategyWithFilesUploads;
    constructor(method: HttpMethodType, subUrl: string, fn: CallbackStrategyWithValidationModel<A> | CallbackStrategyWithEmpty | CallbackStrategyWithIdQuery | CallBackStrategyWithQueryPage | CallbackStrategyWithFileUpload | CallbackStrategyWithFilesUploads);
}
interface ISubSetFeatureRouter<A> {
    method: HttpMethodType;
    subUrl: string;
    fn: CallbackStrategyWithValidationModel<A> | CallbackStrategyWithEmpty | CallbackStrategyWithIdQuery | CallBackStrategyWithQueryPage | CallbackStrategyWithFileUpload | CallbackStrategyWithFilesUploads;
}
declare abstract class ICoreHttpController {
    abstract mainURL: string;
    router: import("express-serve-static-core").Router;
    abstract call(): Routes;
}
export declare class CoreHttpController<V> implements ICoreHttpController {
    mainURL: string;
    validationModel: any;
    subRoutes: ISubSetFeatureRouter<V>[];
    routes: any;
    router: import("express-serve-static-core").Router;
    constructor(routerModel: IRouteModel);
    responseHelper(res: Response, fn: ResponseBase): Promise<void>;
    call(): Routes;
    put(usecase: any): void;
    delete(usecase: any): void;
    requestResponseController<T>(req: Request, res: Response, usecase: CallbackStrategyWithValidationModel<T>): Promise<void>;
    post(usecase: any): void;
    get(usecase: any): void;
}
export {};
