import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
import { PrivateSocketSubscriber } from "./core/controllers/private_socket_subscriber";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
extensions();

const socketSubscribers: PrivateSocketSubscriber<any>[] = [
 
];

(async () => {
  new App(
    await Promise.all(httpRoutes.map(async (el) => await el.call())),
    socketSubscribers
  ).listen();
})();