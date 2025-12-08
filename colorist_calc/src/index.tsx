import "reflect-metadata";
import "antd/dist/antd.min.css";

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./core/routers/routers";
import { extensions } from "./core/extensions/extensions";
import { AuthService } from "./core/service/auth_service";
import { configure } from "mobx";

import { ThemeStore } from "./core/store/theme_store";

configure({
  enforceActions: "never",
});
export const authService = new AuthService();
export const themeStore = new ThemeStore();

extensions();
createRoot(document.getElementById("root")!).render(
  <>
    <RouterProvider router={router} />
  </>
);
