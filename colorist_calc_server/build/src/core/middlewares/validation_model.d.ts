import { RequestHandler } from "express";
export declare const validationModelMiddleware: (type: any, value?: string, skipMissingProperties?: boolean, whitelist?: boolean, forbidNonWhitelisted?: boolean) => RequestHandler;
