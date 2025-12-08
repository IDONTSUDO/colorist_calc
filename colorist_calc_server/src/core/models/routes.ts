import { Router } from "express";

export interface Routes {
    router: Router;
}

export interface IRouteModel {
    validationModel?: any;
    url: string;
    databaseModel?: any;
}
