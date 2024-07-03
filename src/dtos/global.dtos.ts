import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";
import { PaginationDto } from "./pagination.dtos";
import { TransformToMySQLBoolean, TransformToMySQLDateRange, TransformToMySQLInArray } from "@transformers/query.transform";

export class GlobalFilterDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLInArray(value, "id"))
  id: string;

  @IsOptional()
  @Transform(({ value }) => TransformToMySQLBoolean(value, "deleted"))
  deleted: boolean;
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLDateRange(value, "createdat"))
  createdat: string;
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLBoolean(value, "approved"))
  approved: boolean;
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLDateRange(value, "approvedat"))
  approvedat: string;
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLDateRange(value, "updatedat"))
  updatedat: string;
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLDateRange(value, "deletedat"))
  deletedat: string;
}