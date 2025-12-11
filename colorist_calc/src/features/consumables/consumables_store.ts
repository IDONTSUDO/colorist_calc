import { IsNumber, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import { CrudFormStore } from "../../core/store/base_store";
import { ConsumablesHttpRepository } from "./consumables_repository";
import makeAutoObservable from "mobx-store-inheritance";

export class ConsumablesViewModel extends ValidationModel {
  constructor() {
    super();
    makeAutoObservable(this);
  }
  @IsNumber(
    {},
    { message: "Поле цена за единицу измеренеия является обязательным" }
  )
  costPrice: number; //цена за единицу измеренеия
  @IsString({ message: "Поле описание является обязательным" })
  description: string; // описание
  @IsNumber({}, { message: "Поле текущий является обязательным" })
  currentBalance: number; // текущий остаток
  @IsString({ message: "Поле еденица измерения является обязательным" })
  unitOfMeasurement: string = "Граммы"; //еденица измерения
}
export class ConsumablesStore extends CrudFormStore<
  ConsumablesViewModel,
  ConsumablesHttpRepository
> {
  constructor() {
    super();
    makeAutoObservable(this);
  }
  repository: ConsumablesHttpRepository = new ConsumablesHttpRepository();
  viewModel: ConsumablesViewModel = new ConsumablesViewModel();
}
