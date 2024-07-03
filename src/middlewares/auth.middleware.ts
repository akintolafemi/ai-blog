import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SignUpMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { emailaddress, mobile } = req.body;
    if (!emailaddress) {
      throw new HttpException({
        message: "email address is missing in request",
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }

    //check username does not exist
    const emailExist = await this.prismaService.users.findFirst({
      where: {
        emailaddress: `${emailaddress}`
      }, include: {
        profile: {
          select: {
            id: true
          }
        }
      }
    })

    if (!mobile) {
      throw new HttpException({
        message: "mobile number is missing in request",
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }

    //check username does not exist
    const mobileExist = await this.prismaService.profiles.findFirst({
      where: {
        mobile: `${mobile}`
      }
    })
    if (mobileExist) {
      throw new HttpException({
        message: "mobile number already in use",
        statusText: "error",
        status: HttpStatus.CONFLICT
      }, HttpStatus.CONFLICT);
    }

    if (emailExist) {
      req.body['userexist'] = true
    }

    next();
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //check that request is valid
    const { username, password } = req.body;

    if (!(username && password)) {
      throw new HttpException({
        message: "username or password is invalid",
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }

    //get user by username
    const user = await this.prismaService.users.findFirst({
      where: {
        emailaddress: `${username}`,
        status: "active",
        deleted: false
      }, select: {
        id: true,
        createdat: true,
        deleted: true,
        deletedat: true,
        password: true,
        profile: {
          select: {
            createdat: true,
            deleted: true,
            deletedat: true,
            firstname: true,
            id: true,
            lastname: true,
            mobile: true,
            updatedat: true,
            userid: true,
            avataruri: true,
            profiletype: true
          }
        },
        status: true,
        updatedat: true,
        emailaddress: true,
        lastlogin: true,
      }
    });
    

    //throw error if no matching user is found
    if (!user) {
      throw new HttpException({
        message: "username does not exist",
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }

    //validate password or deviceid
    const passwordsMatch = await bcrypt.compare(password, user.password);
    //throw error if passwords do not match
    if (!passwordsMatch) {
      throw new HttpException({
        message: `Invalid "password"}`,
        statusText: "error",
        status: HttpStatus.BAD_REQUEST
      }, HttpStatus.BAD_REQUEST);
    }

    //update login date
    await this.prismaService.users.update({
      where: {
        id: user.id
      }, data: {
        lastlogin: new Date()
      }
    })

    //attach user to request
    req["user"] = user;
    next();
  }
}
