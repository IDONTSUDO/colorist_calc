import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import { CrudFormStore } from "../../core/store/base_store";
import { PaintComponentsHttpRepository } from "./paint_components_repository";
import makeAutoObservable from "mobx-store-inheritance";

export class PaintComponentViewModel extends ValidationModel {
  @IsNumber({},{message:"Поле вес в граммах обязательно"})
  weight?: number;
  @IsNumber({},{message:"Поле цена обязательно"})
  costPrice: number;
  @IsNotEmpty({ message: "Поле приватный номер не может быть пустым" })
  @IsString({ message: "Поле приватный номер обязательно" })
  privateNumber: string;
  @IsNumber({},{message:"Поле текущий баланс обязательно"})
  currentBalance: number;
}

export class PaintComponentStore extends CrudFormStore<
  PaintComponentViewModel,
  PaintComponentsHttpRepository
> {
  repository: PaintComponentsHttpRepository =
    new PaintComponentsHttpRepository();
  viewModel: PaintComponentViewModel = new PaintComponentViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
