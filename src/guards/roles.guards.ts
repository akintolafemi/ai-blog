import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "src/decorators/roles.decorators";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const roles = this.reflector.get(Roles, context.getHandler())

      if (!roles) {
        throw new HttpException({
          message: "Role permission needed to access this route",
          statusText: "error",
          status: HttpStatus.UNAUTHORIZED
        }, HttpStatus.UNAUTHORIZED);
      }

      //check if auth header exists
      if (!request.headers.authorization) {
        throw new HttpException({
          message: "Authorization token not found",
          statusText: "error",
          status: HttpStatus.UNAUTHORIZED
        }, HttpStatus.UNAUTHORIZED);
      }

      //get token from reques, decodedToken
      const token = request.headers.authorization.split(" ")[1];
      if (!token) {
        throw new HttpException({
          message: "Invalid authorization token",
          statusText: "error",
          status: HttpStatus.UNAUTHORIZED
        }, HttpStatus.UNAUTHORIZED);
      }

      //decode token
      const decodedToken = this.jwtService.verify(token);

      //get user
      const user = await this.prismaService.users.findUnique({
        where: {
          id: decodedToken?.id
        }, select: {
          id: true,
          createdat: true,
          deleted: true,
          deletedat: true,
          lastlogin: true,
          password: true,
          profile: true,
          status: true,
          updatedat: true,
          emailaddress: true,
        }
      }) 
      
      if (!user) {
        throw new HttpException({
          message: "Failed to verify user or user no longer exist",
          statusText: "error",
          status: HttpStatus.UNAUTHORIZED
        }, HttpStatus.UNAUTHORIZED);
      }
      
      if (!roles.includes(user.profile.profiletype)) {
        throw new HttpException({
          message: "User does not have access to this resource",
          statusText: "error",
          status: HttpStatus.UNAUTHORIZED
        }, HttpStatus.UNAUTHORIZED);
      }
      
      //attach user to request
      request["user"] = user;

      return true;
    } catch (error) {
      console.log(error)
      throw new HttpException({
        message: error,
        statusText: "error",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
