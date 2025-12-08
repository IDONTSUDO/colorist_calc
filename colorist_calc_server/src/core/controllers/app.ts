import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { createServer } from "http";
import { dirname } from "path";
import { TypedEvent } from "../helpers/typed_event";
import { Routes } from "../models/routes";
import { PrivateSocketSubscriber } from "./private_socket_subscriber";
import jwt from "jsonwebtoken";

export enum ServerStatus {
  init = "init",
  finished = "finished",
  error = "error",
}
export enum Environment {
  DEV = "DEV",
  E2E_TEST = "E2E_TEST",
}

export class App extends TypedEvent<ServerStatus> {
  public app?: express.Application;
  public port?: number;
  public env?: Environment;
  public socketSubscribers?: PrivateSocketSubscriber<any>[];
  public io?: Server;
  status?: ServerStatus;

  constructor(
    routes: Routes[] = [],
    socketSubscribers: PrivateSocketSubscriber<any>[] = [],
    env = Environment.DEV
  ) {
    super();
    this.init(routes, socketSubscribers, env);
  }

  public init(
    routes: Routes[],
    socketSubscribers: PrivateSocketSubscriber<any>[],
    env: Environment
  ) {
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
  authConnectionsWeb: Map<string, number> = new Map();
  authConnectionsWebV2: Map<number, string> = new Map();
  authConnectionsVsCode: Map<string, number> = new Map();
  authConnectionsVsCodeV2: Map<number, string> = new Map();
  public listen() {
    const httpServer = createServer(this.app);
    const io = new Server(httpServer, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      socket.on("auth", async (payload) => {
        if (payload.jwt === undefined) {
          return;
        }

        jwt.verify(
          payload.jwt as string,
          process.env.USER_JWT_SECRET,
          (err: any, user: { userId: string }) => {
            if (err !== null) {
              return;
            }
            if (payload.env === "web") {
              this.authConnectionsWebV2.set(Number(user.userId), socket.id);
              this.authConnectionsWeb.set(socket.id, Number(user.userId));
            }
            if (payload.env === "vscode") {
              this.authConnectionsVsCodeV2.set(Number(user.userId), socket.id);
              this.authConnectionsVsCode.set(socket.id, Number(user.userId));
            }
          }
        );
      });
      this.socketSubscribers?.map((el) => {
        el.emitter.on((e) => {
          if (this.authConnectionsWebV2.get(e.userId) === socket.id) {
            socket.emit(el.event, e);
          }
          if (this.authConnectionsVsCodeV2.get(e.userId) === socket.id) {
            socket.emit(el.event, e);
          }
        });
      });
      socket.on("disconnect", (reason) => {
        this.authConnectionsWebV2.delete(
          this.authConnectionsWeb.get(socket.id)
        );
        this.authConnectionsWeb.delete(socket.id);

        this.authConnectionsVsCodeV2.delete(
          this.authConnectionsVsCode.get(socket.id)
        );
        this.authConnectionsVsCode.delete(socket.id);
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
  setServerStatus(status: ServerStatus) {
    this.emit(status);
    this.status = status;
  }
  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app?.use(cors());
    this.app?.use(express.json());
    this.app?.use(express.urlencoded({ extended: true }));
    this.app?.use(express.static(App.staticFilesStoreDir()));

    this.app?.use(
      fileUpload({
        createParentPath: true,
      })
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this?.app?.use("/", route.router);
    });
  }

  async loadAppDependencies(): Promise<void> {
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

  static staticFilesStoreDir = () => {
    const dir = dirname(__filename);
    const rootDir = dir.slice(0, dir.length - 20);

    return rootDir + "public/";
  };
}
