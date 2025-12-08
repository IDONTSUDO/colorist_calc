import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormStore } from "../../core/store/base_store";
import { ValidationModel } from "../../core/model/validation_model";
import { ClientsHttpRepository } from "./clients_repository";
import { IsNotEmpty, IsString } from "class-validator";

export class ClientViewModel extends ValidationModel {
  @IsNotEmpty({ message: "Поле фамиля не может быть пустым" })
  @IsString({ message: "Поле фамилия обязательно" })
  family: string;
  @IsNotEmpty({ message: "Поле имя не может быть пустым" })
  @IsString({ message: "Поле имя обязательно" })
  name: string;
  @IsNotEmpty({ message: "Поле номер телефона не может быть пустым" })
  @IsString({ message: "Поле номер телефона обязательно" })
  numberPhone: string;
  @IsNotEmpty({ message: "Поле отчество не может быть пустым" })
  @IsString({ message: "Поле отчество обязательно" })
  surName: string;
}
export class ClientsStore extends CrudFormStore<
  ClientViewModel,
  ClientsHttpRepository
> {
 
  repository: ClientsHttpRepository = new ClientsHttpRepository();
  viewModel: ClientViewModel = new ClientViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
