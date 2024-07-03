import { ValidatePassword } from "@validators/custom.validator";
import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { PROFILE_TYPES } from "src/constants/auth.constants";
import { profileType } from "src/types/auth.type";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  emailaddress: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be a minimum of 8 alphanumeric characters'
  })
  @ValidatePassword()
  password: string

  @IsString()
  @IsNotEmpty()
  firstname: string

  @IsString()
  @IsNotEmpty()
  lastname: string

  @IsPhoneNumber()
  @IsNotEmpty()
  mobile: string

  @IsNotEmpty()
  @IsEnum(PROFILE_TYPES, {
    message: `profile type must be one of ${PROFILE_TYPES.toString()}`
  })
  profiletype: profileType
}