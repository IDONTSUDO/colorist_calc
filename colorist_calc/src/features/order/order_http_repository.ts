import { IPagination } from "../../core/model/pagination";
import {
  HttpMethod,
  HttpRepository,
} from "../../core/repository/http_repository";
import { ConsumablesViewModel } from "../consumables/consumables_store";
import { RecipesViewModel } from "../recipes/recipes_store";
import { OrderViewModel } from "./order_store";

export class OrderHttpRepository extends HttpRepository {
  findComponents = (componentsField: string) =>
    this._jsonRequest<ConsumablesViewModel[]>(
      HttpMethod.POST,
      "/components/find",
      {
        prop: "privateNumber",
        value: componentsField,
      }
    );
  findConsumables = (consumablesField: string) =>
    this._jsonRequest<ConsumablesViewModel[]>(
      HttpMethod.POST,
      "/consumables/find",
      {
        prop: "description",
        value: consumablesField,
      }
    );

  getConsumables = async () =>
    (
      await this._jsonRequest<IPagination<ConsumablesViewModel>>(
        HttpMethod.GET,
        "/consumables?page=1"
      )
    ).map((el) => el.data);
  findRecept = (receptField: string) =>
    this._jsonRequest<RecipesViewModel[]>(HttpMethod.POST, "/recipes/find", {
      prop: "cardIndexNumber",
      value: receptField,
    });
  getClientById = (id: string) =>
    this._jsonRequest(HttpMethod.POST, "/client/by/id", { id: Number(id) });
  getOrderById = (id: string) =>
    this._jsonRequest(HttpMethod.POST, "/order/by/id", { id: Number(id) });
  updateOrder = (order: OrderViewModel) => {
    const o = JSON.parse(JSON.stringify(order));
    delete o["consumables"];
    return this._jsonRequest(HttpMethod.PUT, "/order", o);
  };
}
