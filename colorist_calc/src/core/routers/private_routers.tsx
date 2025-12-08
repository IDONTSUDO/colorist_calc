import type { IRouter } from "./routers";
import { Clients, ClientsPath } from "../../features/clients/clients";
import {
  PaintsComponentPath,
  PaintsComponent,
} from "../../features/paint_components/paint_components";
import { Orders, OrdersPath } from "../../features/orders/orders";
import { Recipes, RecipesPath } from "../../features/recipes/recipes";
import { Order, OrderPath } from "../../features/order/order";
import {
  Consumables,
  ConsumablesPath,
} from "../../features/consumables/consumables";
import { Reports, ReportsPath } from "../../features/reports/reports";

export const privateRouters: IRouter[] = [
  {
    path: ClientsPath,
    element: <Clients />,
  },
  {
    path: PaintsComponentPath,
    element: <PaintsComponent />,
  },
  {
    path: OrdersPath,
    element: <Orders />,
  },
  {
    path: RecipesPath,
    element: <Recipes />,
  },

  {
    path: OrderPath + "/:id",
    element: <Order />,
  },
  { path: ConsumablesPath, element: <Consumables /> },
  { path: ReportsPath, element: <Reports /> },
];
