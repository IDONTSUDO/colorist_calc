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
  // new SocketSubscriber(gptChatPresentation, "gpt"),
  // new SocketSubscriber(tasksSocketFeature, "current/task/lenght"),
];

(async () => {
  // await new PrismaClient().user.create({
  //   data: {
  //     login: "1",
  //     password: "1",
  //     name: "Наталья Викторовна",
  //   },
  // });

  new App(
    await Promise.all(httpRoutes.map(async (el) => await el.call())),
    socketSubscribers
  ).listen();
})();

interface Recept {
  // Компоненты
  components: Component[];
  // Вес компонента по рецепту
  weightComponentsInRecept: number;
  // Вес банки
  weightBanks: number;
  // Реальный вес компонентов
  realWeightComponents: number;
  // Вес компонентов после отпыла
  weightComponentsAfterDust: number;
  // Номер в картотеке

  // Авто
}
interface Component {
  // остаток
  remainder: number;
  // номер
  indicator: string;
  // цена
  price: number;
  //вес
  weight?: number;
}
const receptToOrderMapper = (orderWeight: number, recept: Recept) => {
  const sumAllPigments = recept.components.reduce((acc, el) => {
    return acc + el.weight;
  }, 0);

  recept.components.map((el) => {
    el.weight = (el.weight / sumAllPigments) * orderWeight;
    return el;
  });

  return recept;
};

console.log(
  JSON.stringify(
    receptToOrderMapper(1000, {
      components: [
        { remainder: 10, indicator: "", price: 1, weight: 10 },
        { remainder: 100, indicator: "", price: 1, weight: 100 },
      ],
      weightComponentsInRecept: 100,
      weightBanks: 100,
      realWeightComponents: 20,
      weightComponentsAfterDust: 100,
    })
  )
);
