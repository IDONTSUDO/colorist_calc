import { IsNumber, IsString } from "class-validator";

export class QueryIdModel {
  @IsNumber()
  id: number;
}