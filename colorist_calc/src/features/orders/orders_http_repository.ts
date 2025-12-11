import { IPagination } from "../../core/model/pagination";
import {
  CrudHttpRepository,
  HttpMethod,
} from "../../core/repository/http_repository";
import { ClientViewModel } from "../clients/clients_store";
import { OrderViewModel } from "./orders_store";

export class OrdersHttpRepository extends CrudHttpRepository<OrderViewModel> {
  updateOrder = (order: OrderViewModel) =>
    this._jsonRequest(HttpMethod.PUT, "/order", order);
  featurePath: string = "/order";
  getClients = async () =>
    (
      await this._jsonRequest<IPagination<ClientViewModel>>(
        HttpMethod.GET,
        "/clients"
      )
    ).map((el) => {
      return el.data;
    });

  findClientInNumber = (value: string, prop: string) =>
    this._jsonRequest<ClientViewModel[]>(HttpMethod.POST, "/clients/find", {
      prop: prop,
      value: value,
    });
  getAllUsers = () => this._jsonRequest(HttpMethod.GET, "/get/all/users");
  // getClient = (id:string) => this._jsonRequest(HttpMethod.POST, "/clients/find",{prop:});
}
