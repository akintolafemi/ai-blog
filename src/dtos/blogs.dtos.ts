import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { GlobalFilterDto } from "./global.dtos";
import { Transform } from "class-transformer";
import { TransformToMySQLContains, TransformToMySQLInArray, TransformToMySQLInArrayFromEnum } from "@transformers/query.transform";
import { blogStatus } from "@prisma/client";
import { BLOG_STATUSES } from "src/constants/blogs.constants";

export class CommonDto { 
  @IsString()
  @IsOptional()
  blogsubtitle: string

  @IsUrl()
  @IsOptional()
  blogfeaturedimageuri: string
}

export class CreateBlogDto extends CommonDto { 
  @IsString()
  @IsNotEmpty()
  blogtitle: string

  @IsString()
  @IsNotEmpty()
  blogcontent: string
}

export class UpdateBlogDto extends CommonDto { 
  @IsString()
  @IsOptional()
  blogtitle: string

  @IsString()
  @IsOptional()
  blogcontent: string
}

export class QueryBlogsDto extends GlobalFilterDto {
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLInArray(value, "blogapproverid"))
  blogapproverid: string

  @IsOptional()
  @Transform(({ value }) => TransformToMySQLInArray(value, "blogauthorid"))
  blogauthorid: string

  @IsOptional()
  @Transform(({ value }) => TransformToMySQLContains(value, "blogsubtitle"))
  blogsubtitle: string

  @IsOptional()
  @Transform(({ value }) => TransformToMySQLContains(value, "blogtitle"))
  blogtitle: string
  
  @IsOptional()
  @Transform(({ value }) => TransformToMySQLInArrayFromEnum(value, "blogstatus", BLOG_STATUSES))
  blogstatus: blogStatus
}