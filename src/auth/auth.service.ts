import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import RequestWithUser from 'src/types/request.with.user.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseManager, standardResponse } from '@utils/response.manager.utils';
import { SignUpDto } from '@dtos/auth.dtos';
import * as bcrypt from 'bcrypt';
import { BCRYPT_HASH_ROUNDS, NOW } from 'src/constants/constant.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private request: RequestWithUser,
    private readonly jwtService: JwtService
  ) {}

  async signJWT() {
    const payload = {
      emailaddress: this.request.user.emailaddress,
      id: this.request.user.id,
    };
    const token = this.jwtService.sign(payload, {
      // expiresIn: "3600 seconds"
    });
    const user = this.request.user;
    delete user.password
    return ResponseManager.standardResponse({
      statusText: "success",
      message: "Authentication successful",
      status: HttpStatus.OK,
      data: {
        token,
        user,
      }
    });
  }

  async CreateUser(req: SignUpDto & {userexist?: true}): Promise<standardResponse | HttpException> {
    try {
      
      const password = await bcrypt.hash(req.password, BCRYPT_HASH_ROUNDS); //hash the password
      const user =  await this.prismaService.users.create({ //save user login to db
        data: {
          emailaddress: req.emailaddress,
          password,
          createdat: NOW()
        }
      }) 
      
      delete user.password
      const profile = await this.prismaService.profiles.create({ //save profile
        data: {
          userid: user.id,
          firstname: req.firstname,
          lastname: req.lastname,
          mobile: req.mobile,
          profiletype: req.profiletype,
          createdat: NOW()
        }
      })

      const token = this.jwtService.sign({
        emailaddress: req.emailaddress,
        id: user.id
      }, {

      });
      
      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Sign up successful!`,
        status: HttpStatus.CREATED,
        statusText: "success",
        data: {
          token,
          user: {
            ...user,
            profile
          }
        }
      })

    } catch (error) {
      throw new HttpException({
        message: error?.response || "Unknown error has occured",
        statusText: "error",
        status: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        data: error
      }, error?.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
