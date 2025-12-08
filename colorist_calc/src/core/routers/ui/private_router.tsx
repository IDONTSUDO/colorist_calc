import { Navigate } from "react-router-dom";
import { AuthorizationLocalStorageRepository } from "../../../features/authorization/authorization_repository";
import { AuthorizationScreenPath } from "../../../features/authorization/authorization_screen";
import { useEffect } from "react";

interface IPrivateRouter {
  children?: JSX.Element | JSX.Element[];
}

export const PrivateRouter = (props: IPrivateRouter) => {
  return new AuthorizationLocalStorageRepository().isAuth().fold(
    (isAuth) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {}, []);
      return props.children;
    },
    (e) => {
      return <Navigate to={AuthorizationScreenPath} />;
    }
  );
};
