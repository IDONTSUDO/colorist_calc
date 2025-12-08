import makeAutoObservable from "mobx-store-inheritance";
import { FormState } from "../../core/store/base_store";
import { ValidationModel } from "../../core/model/validation_model";
import { OrderHttpRepository } from "./order_http_repository";
import { IsInt, IsString } from "class-validator";
import { ClientViewModel } from "../clients/clients_store";
import { message } from "antd";
import { RecipesViewModel } from "../recipes/recipes_store";
import { PaintComponentViewModel } from "../paint_components/paint_components_store";
import { ConsumablesViewModel } from "../consumables/consumables_store";

export class OrderViewModel extends ValidationModel {
  markup?: number;
  financeStatus: string;
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
  orderProcess?: string;
  recipeJSON?: string;
  recipe?: RecipesViewModel;
  orderCharacteristics?: string;
  consumables?: { consumables: ConsumablesViewModel; count: number }[] = [];
  consumablesJson?: string;
}
export enum OrderProcessType {
  inRecept,
  diffRecept,
  notSelected,
}
export class OrderStore extends FormState<OrderViewModel> {
  repository = new OrderHttpRepository();
  viewModel: OrderViewModel = new OrderViewModel();
  client: ClientViewModel = new ClientViewModel();
  recipes: RecipesViewModel[] = [];
  receptField?: string;
  consumablesField?: string;
  componentsField?: string;
  components: PaintComponentViewModel[] = [];
  consumables: ConsumablesViewModel[] = [];
  consumablesModalIsOpen: boolean = false;
  reportComponentsModalIsOpen: boolean = false;
  reportConsumablesModalIsOpen: boolean = false;
  isOpenComponentsModal: boolean = false;

  constructor() {
    super();
    makeAutoObservable(this);
  }
  selectOrderProcessType = async (type: string) => {
    this.viewModel.orderCharacteristics = type;
    this.updateOrder();
  };
  updateOrder = async () => {
    this.viewModel.consumablesJson = JSON.stringify(this.viewModel.consumables);
    await this.repository.updateOrder(this.viewModel);
  };
  initParams = async (id: string) => {
    await this.mapOk("viewModel", this.repository.getOrderById(id));
    if (this.viewModel.consumablesJson !== null) {
      // @ts-expect-error
      this.viewModel.consumables = JSON.parse(this.viewModel.consumablesJson);
    }
    await this.mapOk(
      "client",
      this.repository.getClientById(this.viewModel.client.toString())
    );
    (await this.repository.getConsumables()).map((el) => {
      this.consumables = el;
    });
  };

  findRecipes = async (): Promise<void> => {
    if (this.receptField === undefined) {
      message.error("Введите номер в картотеке для поиска рецепта");
      return;
    }
    await this.mapOk("recipes", this.repository.findRecept(this.receptField));
  };
  updateReceptField = (text: string): void => {
    this.receptField = text;
  };
  selectRecept = async (index: number) => {
    this.viewModel.recipeJSON = JSON.stringify(this.recipes.at(index));
    this.viewModel.orderCharacteristics = "Recipe_Selected";
    await this.repository.updateOrder(this.viewModel);
  };

  receptToOrderMapper = (): PaintComponentViewModel[] => {
    const recipe = JSON.parse(this.viewModel.recipeJSON ?? "");
    recipe.components = JSON.parse(recipe.components);

    if (recipe?.components !== null && recipe?.components !== undefined) {
      const components = recipe?.components as PaintComponentViewModel[];
      const sumAllPigments = components.reduce((acc, el) => {
        return acc + el.weight!;
      }, 0);

      components.map((el) => {
        el.weight =
          (el.weight! / sumAllPigments) *
          this.viewModel.theVolumeOfPainTheCustomerWant;
        return el;
      });

      return components;
    }
    return [];
  };
  consumablesFindField = (text: string): void => {
    this.consumablesField = text;
  };
  findConsumables = async (): Promise<void> => {
    if (this.consumablesField === undefined) {
      message.error("Введите в поле поиск расходников текст для поиска");
      return;
    }
    await this.mapOk(
      "consumables",
      this.repository.findConsumables(this.consumablesField)
    );
  };
  consumablesModalClose = (): void => {
    this.consumablesModalIsOpen = false;
  };
  consumablesModalOpen = () => {
    this.consumablesModalIsOpen = true;
  };
  addConsumablesToOrder = async (i: number): Promise<void> => {
    const consumables = this.consumables.at(i)!;
    if (this.viewModel.consumables === undefined) {
      this.viewModel.consumables = [];
    }
    const index = this.viewModel.consumables.findIndex(
      (el) => el.consumables.description === consumables.description
    );

    if (index !== -1) {
      this.viewModel.consumables.at(index)!.count += 1;
      await this.updateOrder();
      return;
    }
    this.viewModel.consumables.add({
      consumables: consumables,
      count: 1,
    });
    await this.updateOrder();
  };
  getOrderCost = () => {
    let cost = 0;
    this.viewModel.consumables?.map((el) => {
      cost += el.consumables.costPrice;
    });
    const recipe = JSON.parse(this.viewModel.recipeJSON ?? "");
    recipe.components = JSON.parse(recipe.components);
    const components = recipe?.components as PaintComponentViewModel[];
    const sumAllPigments = components.reduce((acc, el) => {
      return acc + el.weight!;
    }, 0);

    components.map((el) => {
      el.weight =
        (el.weight! / sumAllPigments) *
        this.viewModel.theVolumeOfPainTheCustomerWant;
      return el;
    });

    components?.map((el) => {
      cost += el.costPrice * (el.weight ?? 1);
    });

    return cost;
  };
  closeReportComponentsModal = (): void => {
    this.reportComponentsModalIsOpen = false;
  };
  closeReportConsumablesModal = (): void => {
    this.reportConsumablesModalIsOpen = false;
  };
  openReportComponentsModal = () => {
    this.reportComponentsModalIsOpen = true;
  };
  openReportConsumablesModal = () => {
    this.reportConsumablesModalIsOpen = true;
  };
  getCostComponents = () => {
    let cost = 0;

    const recipe = JSON.parse(this.viewModel.recipeJSON ?? "");
    recipe.components = JSON.parse(recipe.components);
    const components = recipe?.components as PaintComponentViewModel[];
    const sumAllPigments = components.reduce((acc, el) => {
      return acc + el.weight!;
    }, 0);

    components.map((el) => {
      el.weight =
        (el.weight! / sumAllPigments) *
        this.viewModel.theVolumeOfPainTheCustomerWant;
      return el;
    });
    components?.map((el) => {
      cost += el.costPrice * (el.weight ?? 1);
    });
    return cost;
  };
  getCostConsumables = () => {
    let cost = 0;
    this.viewModel.consumables?.map((el) => {
      cost += el.consumables.costPrice;
    });
    return cost;
  };
  updateComponentsField = (text: string): void => {
    this.componentsField = text;
  };
  findComponents = (): void => {
    if (this.componentsField === undefined) {
      message.error("Введите номер компонента для поиска");
      return;
    }
    this.mapOk(
      "components",
      this.repository.findComponents(this.componentsField)
    );
  };
  closeComponentsModal = (): void => {
    this.isOpenComponentsModal = false;
  };
  openComponentsModal = (): void => {
    this.isOpenComponentsModal = true;
  };
  addComponentsToRecept = (i: number): void => {

  }
}
