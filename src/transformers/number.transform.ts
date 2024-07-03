import { HttpException, HttpStatus } from "@nestjs/common";

export const IsNumeric = (value: number) => !isNaN(value);

export const TransformToNumber = (value: string, fieldName: string) => {
  //ensure value is not empty
  if (!value || value.length === 0) {
    throw new HttpException({
      message: `Query param ${fieldName} cannot be empty`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  if (!IsNumeric(Number(value))) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  return Number(value)
};