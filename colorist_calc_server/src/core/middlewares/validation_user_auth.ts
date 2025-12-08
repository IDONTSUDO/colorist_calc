import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const validationMiddleware = (
  req: Request,
  res,
  jwtSecret: string
): boolean => {
  if (req.headers["authorization"] === undefined) {
    res.status(400).json("need authorization");
    return false;
  }

  if (typeof req.headers["authorization"] === "string") {
    return jwt.verify(
      req.headers["authorization"].replaceAll("Bearer ", ""),
      jwtSecret,
      (err: any, user: any) => {
        if (err) {
          res.status(400).json("need authorization");
          return;
        }

        // @ts-expect-error
        req.user = user;
        return true;
      }
    );
  } else {
    res.status(400).json("need authorization");
    return false;
  }
  return false;
};

export const validationMiddlewareNotResponse = (
  req: Request,
  res,
  jwtSecret: string
): boolean => {
  if (req.headers["authorization"] === undefined) {
    return false;
  }

  if (typeof req.headers["authorization"] === "string") {
    return jwt.verify(
      req.headers["authorization"].replaceAll("Bearer ", ""),
      jwtSecret,
      (err: any, user: any) => {
        return true;
      }
    );
  } else {
    return false;
  }
};
