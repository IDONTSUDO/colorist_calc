import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { createServer } from "http";
import { dirname } from "path";
import { TypedEvent } from "../helpers/typed_event";
export var ServerStatus;
(function (ServerStatus) {
    ServerStatus["init"] = "init";
    ServerStatus["finished"] = "finished";
    ServerStatus["error"] = "error";
})(ServerStatus || (ServerStatus = {}));
export var Environment;
(function (Environment) {
    Environment["DEV"] = "DEV";
    Environment["E2E_TEST"] = "E2E_TEST";
})(Environment || (Environment = {}));
export class App extends TypedEvent {
    constructor(routes = [], socketSubscribers = [], env = Environment.DEV) {
        super();
        this.init(routes, socketSubscribers, env);
    }
    init(routes, socketSubscribers, env) {
        this.port = 4001;
        this.socketSubscribers = socketSubscribers;
        this.env = env;
        this.app = express();
        this.setServerStatus(ServerStatus.init);
        this.loadAppDependencies().then(() => {
            this.initializeMiddlewares();
            this.initializeRoutes(routes);
            if (this.status !== ServerStatus.error) {
                this.setServerStatus(ServerStatus.finished);
            }
        });
    }
    listen() {
        const httpServer = createServer(this.app);
        const io = new Server(httpServer, {
            cors: { origin: "*" },
        });
        io.on("connection", (socket) => {
            var _a;
            (_a = this.socketSubscribers) === null || _a === void 0 ? void 0 : _a.map((el) => {
                el.emitter.on((e) => {
                    socket.emit(el.event, e);
                });
            });
        });
        httpServer.listen(this.port, () => {
            console.info(`=================================`);
            console.info(`======= ENV: ${this.env} =======`);
            console.info(`🚀 HTTP http://localhost:${this.port}`);
            console.info(`🚀 WS ws://localhost:${this.port}`);
            console.info(`=================================`);
        });
        this.io = io;
    }
    setServerStatus(status) {
        this.emit(status);
        this.status = status;
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        var _a, _b, _c, _d, _e;
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.use(cors());
        (_b = this.app) === null || _b === void 0 ? void 0 : _b.use(express.json());
        (_c = this.app) === null || _c === void 0 ? void 0 : _c.use(express.urlencoded({ extended: true }));
        (_d = this.app) === null || _d === void 0 ? void 0 : _d.use(express.static(App.staticFilesStoreDir()));
        (_e = this.app) === null || _e === void 0 ? void 0 : _e.use(fileUpload({
            createParentPath: true,
        }));
    }
    initializeRoutes(routes) {
        routes.forEach((route) => {
            var _a;
            (_a = this === null || this === void 0 ? void 0 : this.app) === null || _a === void 0 ? void 0 : _a.use("/", route.router);
        });
    }
    async loadAppDependencies() {
        // const dataBaseName = this.env === Environment.E2E_TEST ? "e2e_test" : "dev";
        // // TODO(IDONTSUDO):maybe convert it to a class and map it there
        // const result = await new DataBaseConnectUseCase().call(dataBaseName);
        // await result.fold(
        //     async (_s) => {
        //         await new CheckAndCreateStaticFilesFolderUseCase().call();
        //         // await new SetLastActivePipelineToRealTimeServiceScenario().call();
        //     },
        //     async (_e) => {
        //         this.setServerStatus(ServerStatus.error);
        //     }
        // );
    }
}
App.staticFilesStoreDir = () => {
    const dir = dirname(__filename);
    const rootDir = dir.slice(0, dir.length - 20);
    return rootDir + "public/";
};
