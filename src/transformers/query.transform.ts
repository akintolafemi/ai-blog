import { HttpException, HttpStatus } from "@nestjs/common";
import * as moment from "moment";
import { IsNumeric } from "./number.transform";

export const TransformToMySQLOrderBy = (value: string, fieldName: string) => {
  if (IsNumeric(Number(value))) {
    throw new HttpException({
      message: `Query param ${fieldName} can not be a number`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  if (typeof value !== "string") {
    throw new HttpException({
      message: `Query param ${fieldName} must be a string`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const arr = value.split(",");
  const field = arr[0].trim();
  const order = arr.length > 1 ? arr[1].trim() : "desc";
  if (order !== "asc" && order !== "desc") {
    throw new HttpException({
      message: `Query param ${fieldName} value must be one of 'asc' or 'desc'`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  return {
    [field]: order.toLocaleLowerCase()
  }
};

export const TransformToMySQLContains = (value: string, fieldName: string) => {
  if (IsNumeric(Number(value))) {
    throw new HttpException({
      message: `Query param ${fieldName} can not be a number`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  return {
    contains: value
  }
  
};

export const TransformToMySQLBoolean = (value: string, fieldName: string) => {
  if (!IsNumeric(Number(value))) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  if (Number(value) !== 0 && Number(value) !== 1){
    throw new HttpException({
      message: `Query param ${fieldName} must be 0 or 1`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  return Number(value) === 0 ? false : true;
};

export const TransformToMySQLInArray = (value: string, fieldName: string, isStrings?: boolean) => {
  if (typeof value !== "string") {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const arr = value.split(",");

  if (arr.length <= 0) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const trimArr = arr.map((a) => {
    return !isStrings ? Number(a) : a
  })

  return {
    in: trimArr
  }
};

export const TransformToMySQLInArrayFromEnum = (value: string, fieldName: string, enums: any[]) => {
  if (IsNumeric(Number(value)) || typeof value !== "string") {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const arr = value.split(",");

  if (arr.length <= 0) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  for (const _arr of arr) {
    if (!enums.includes(_arr.trim())) {
      throw new HttpException({
        message: `Query param ${fieldName} is invalid, all values must be one of ${enums}`,
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }
  }

  const trimArr = arr.map((a) => {
    return a.trim()
  })

  return {
    in: trimArr
  }
};

export const TransformToMySQLDateRange = (value: string, fieldName: string) => {
  if (IsNumeric(Number(value)) || typeof value !== "string") {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const arr = value.split(",");

  if (arr.length < 1) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  const fromDate = arr[0].trim();
  const toDate = arr.length > 1 ? arr[1].trim() : arr[0].trim();
  if (!ValidateDatePattern(fromDate, "YYYY-MM-DD", "-") || !ValidateDatePattern(toDate, "YYYY-MM-DD", "-")) {
    throw new HttpException({
      message: `Query param ${fieldName} is invalid`,
      statusText: "error",
      status: HttpStatus.BAD_REQUEST
    }, HttpStatus.BAD_REQUEST);
  }

  return {
    gte: new Date(fromDate), 
    lt: new Date(moment(toDate).add(1, 'days').format("YYYY-MM-DD"))
  }
};

export const ValidateDatePattern = (date: string, pattern: string, split: "-" | ":") => {
  const splitDate = date.split(`${split}`);
  const patternSplit = pattern.split(`${split}`);
  if (splitDate.length !== 3) 
    return false;
  
  for (let i = 0; i < splitDate.length; i++) {
    if (splitDate[i].length !== patternSplit[i].length)
      return false;
  }

  return true;
}