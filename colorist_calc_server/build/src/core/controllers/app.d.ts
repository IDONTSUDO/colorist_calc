import express from "express";
import { Server } from "socket.io";
import { TypedEvent } from "../helpers/typed_event";
import { Routes } from "../models/routes";
import { SocketSubscriber } from "./socket_controller";
export declare enum ServerStatus {
    init = "init",
    finished = "finished",
    error = "error"
}
export declare enum Environment {
    DEV = "DEV",
    E2E_TEST = "E2E_TEST"
}
export declare class App extends TypedEvent<ServerStatus> {
    app?: express.Application;
    port?: number;
    env?: Environment;
    socketSubscribers?: SocketSubscriber<any>[];
    io?: Server;
    status?: ServerStatus;
    constructor(routes?: Routes[], socketSubscribers?: SocketSubscriber<any>[], env?: Environment);
    init(routes: Routes[], socketSubscribers: SocketSubscriber<any>[], env: Environment): void;
    listen(): void;
    setServerStatus(status: ServerStatus): void;
    getServer(): express.Application;
    private initializeMiddlewares;
    private initializeRoutes;
    loadAppDependencies(): Promise<void>;
    static staticFilesStoreDir: () => string;
}
