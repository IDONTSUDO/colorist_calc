import { AuthorizationFeature } from "../../features/authorization/authorization";
import { ClientsFeature } from "../../features/clients/clients";
import { ComponentsFeature } from "../../features/components/components";
import { ConsumablesFeature } from "../../features/consumables/consumables";
import { OrdersFeature } from "../../features/orders/orders";
import { RecipesFeature } from "../../features/recipes/recipes";

export const httpRoutes = [
  new AuthorizationFeature(),
  new ClientsFeature(),
  new ComponentsFeature(),
  new RecipesFeature(),
  new OrdersFeature(),
  new ConsumablesFeature(),
];
