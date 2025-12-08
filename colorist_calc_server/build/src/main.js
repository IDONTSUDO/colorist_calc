import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
extensions();
const socketSubscribers = [];
new App(httpRoutes, socketSubscribers).listen();
