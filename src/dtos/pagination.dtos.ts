import { TransformToNumber } from "@transformers/number.transform";
import { TransformToMySQLOrderBy } from "@transformers/query.transform";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class PaginationDto {
  @Transform(({ value }) => TransformToNumber(value, "page"))
  @IsOptional()
  page: number;

  @IsOptional()
  @Transform(({ value }) => TransformToNumber(value, "limit"))
  limit: number;

  @IsOptional()
  @Transform(({ value }) => TransformToMySQLOrderBy(value, "order"))
  order: any;
}