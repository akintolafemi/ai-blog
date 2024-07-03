import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ManageBlogsRole } from "src/decorators/blogs.role.decorators";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ManageBlogGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const manageBole = this.reflector.get(ManageBlogsRole, context.getHandler())
    const user = request?.user;
    let blogId = -1;

    switch (manageBole.requestSource) {
      case "body":
        blogId = Number(request.body[`${manageBole.key}`] || -1)
        break;
      case "param":
        blogId = Number(request.params[`${manageBole.key}`] || -1)
        break;
      case "query":
        blogId = Number(request.query[`${manageBole.key}`] || -1)
      default:
        break;
    }

    const ownsBlog = await this.prismaService.blogs.findFirst({
      where: {
        id: blogId,
        blogauthorid: user?.profile?.id
      }
    })
  
    if (!ownsBlog) 
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        statusText: "error",
        message: `Blog with id - ${blogId} does not exist under author or author does not have role to make changes`
      }, HttpStatus.UNAUTHORIZED);
    
    return true;
  }

}
