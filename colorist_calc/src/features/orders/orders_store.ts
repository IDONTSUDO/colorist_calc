import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormStore } from "../../core/store/base_store";
import { ValidationModel } from "../../core/model/validation_model";
import { OrdersHttpRepository } from "./orders_http_repository";
import { message } from "antd";
import { ClientViewModel } from "../clients/clients_store";
import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { OrderPath } from "../order/order";
import { NavigateFunction } from "react-router-dom";

export class OrderViewModel extends ValidationModel {
  constructor() {
    super();
    makeAutoObservable(this);
  }
  @IsString({ message: "Поле авто является обязательным" })
  auto: string; //АВТО
  @IsString({ message: "Поле код краски является обязательным" })
  codePaint: string; //КОД КРАСКИ
  @IsString({ message: "Поле цвет краски является обязательным" })
  color: string; //ЦВЕТ
  @IsInt({
    message: "Поле обьем краски которую хочет клиент является обязательным",
  })
  theVolumeOfPainTheCustomerWant: number; //ОБЬЕМ КРАСКИ КОТОРУЮ ХОЧЕТ КЛИЕНТ в граммах
  @IsInt({ message: "Выберите клиента" })
  client: number; //ID model Client
  statusOrder: string = "Начат"; //НАЧАТ,ЗАКОНЧЕН
  @IsString({ message: "Выберите пользователя" })
  @IsNotEmpty({ message: "Выберите пользователя" })
  user?: string; //кто делает заказ
}
export interface IUser {
  id: number;
  login: string;
  name: string;
  password: string;
  createDate: Date;
}

export class OrdersStore extends CrudFormStore<
  OrderViewModel,
  OrdersHttpRepository
> {
  repository: OrdersHttpRepository = new OrdersHttpRepository();
  viewModel: OrderViewModel = new OrderViewModel();
  searchPhoneNumberField?: string;
  clients: ClientViewModel[] = [];
  users: IUser[] = [];
  findClientType?: string;
  constructor() {
    super();
    makeAutoObservable(this);
  }
  init = async (navigate?: NavigateFunction): Promise<any> => {
    super.init(navigate);
    this.mapOk("users", this.repository.getAllUsers());
  };
  updateOrderStatus = (value: string, index: number): void => {
    const order = this.page?.data.at(index) as OrderViewModel;
    order.statusOrder = value;
    this.repository.updateOrder(order);
  };
  onClickFindButtonToSearchClient = async () => {
    if (this.searchPhoneNumberField === undefined) {
      message.error("введите телефон");
      return;
    }
    await this.mapOk(
      "clients",
      this.repository.findClientInNumber(this.searchPhoneNumberField, this.findClientType === 'ПО ФИО' ? "": "numberPhone")
    );
  };
  closeModalCreateOrder = (): void => {
    this.viewModel = new OrderViewModel();
    this.findClientType = undefined;  
    this.modalCancel();
  };
  changeFindClientType = (type: string): void => {
    this.findClientType = type;
  };
}
