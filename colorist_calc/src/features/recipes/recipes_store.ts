import { IsArray, IsNumber, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import { CrudFormStore } from "../../core/store/base_store";
import { RecipesHttpRepository } from "./recipes_repository";
import makeAutoObservable from "mobx-store-inheritance";
import { NavigateFunction } from "react-router-dom";
import { PaintComponentViewModel } from "../paint_components/paint_components_store";
import { message } from "antd";

export class RecipesViewModel extends ValidationModel {
  constructor() {
    super();
    makeAutoObservable(this);
  }
  comment: string;
  components: string; //Компоненты
  componentsArray?: PaintComponentViewModel[] = []; //Компонент
  @IsArray()
  componentsIds: number[] = []; //Компоненты

  @IsNumber()
  weightOfIngredientsAccordingToTheRecipe: number; //Вес компонентов по рецепту
  @IsNumber()
  weightOfTheCan: number; // Вес банки
  @IsNumber()
  actualWeightOfComponents: number; // Реальный вес компонентов
  @IsNumber()
  weightOfComponentsAfterDusting: number; // Вес компонентов после отпыла
  @IsString()
  auto: string; // авто
  @IsString()
  cardIndexNumber: string; // Номер в картотеке
  toServerModel() {
    this.components = JSON.stringify(this.componentsArray);

    this.componentsArray?.map((el) => {
      this.componentsIds.push(el.id ?? 0);
    });
    this.weightOfIngredientsAccordingToTheRecipe =
      this.componentsArray?.reduce((acc, el) => {
        return acc + (el.weight ?? 0);
      }, 0) ?? 0;
    this.componentsArray = undefined;
  }
}

export class RecipesStore extends CrudFormStore<
  RecipesViewModel,
  RecipesHttpRepository
> {
  lastWights?: number;
  repository: RecipesHttpRepository = new RecipesHttpRepository();
  viewModel: RecipesViewModel = new RecipesViewModel();
  paintComponents: PaintComponentViewModel[] = [];
  isModalAddComponentsOpen: boolean = false;
  searchInput = "";
  constructor() {
    super();
    makeAutoObservable(this);
  }

  removeComponent = (index: number): void => {
    this.viewModel.componentsArray = this.viewModel.componentsArray?.filter(
      (_, i) => i !== index
    );
  };
  modalAddComponentsShow = () => {
    this.isModalAddComponentsOpen = true;
  };

  modalAddComponentsClickOk = () => {
    this.isModalAddComponentsOpen = false;
  };

  modalAddComponentsCancel = () => {
    this.isModalAddComponentsOpen = false;
  };
  onClickButtonFindInPrivateNumber = async () => {
    if (this.searchInput === "") {
      message.error("поле поиска пусто");
      return;
    }
    (await this.repository.findComponents(this.searchInput)).map((el) => {
      this.paintComponents = el;
    });
  };
  addNewComponentsToRecept = (index: number): void => {
    if (this.lastWights === undefined) {
      message.error("Введите вес компонента");
      return;
    }

    const component = this.paintComponents.at(index)!;
    component!.weight = this.lastWights;

    this.viewModel.componentsArray?.push(JSON.parse(JSON.stringify(component)));
  };
  init = async (navigate?: NavigateFunction): Promise<any> => {
    super.init(navigate);
    (await this.repository.getComponents()).map((el) => {
      this.paintComponents = el.data;
    });
  };
  updateWeights = (text: string): void => {
    this.lastWights = Number(text);
  };
}
