import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, QueryBlogsDto, UpdateBlogDto } from '@dtos/blogs.dtos';
import { ALL_ROLES } from 'src/constants/constant.constants';
import { Roles } from 'src/decorators/roles.decorators';
import { RolesGuard } from 'src/guards/roles.guards';
import { ADMIN, EMPLOYEE, NONEMPLOYEE } from 'src/constants/auth.constants';
import { ManageBlogGuard } from 'src/guards/blog.guards';
import { ManageBlogsRole } from 'src/decorators/blogs.role.decorators';
import MainGuard from 'src/guards/main.guards';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly service: BlogsService
  ) {}

  @UseGuards(MainGuard)
  @Get(``)
  public async GetAllBlogs(@Query() request: QueryBlogsDto) {
    return this.service.GetAllBlogs(request);
  }

  @Roles(ALL_ROLES)
  @UseGuards(RolesGuard)
  @Post(``)
  public async CreateBlog(@Body() req: CreateBlogDto) {
    return this.service.CreateBlog(req);
  }

  @UseGuards(MainGuard)
  @Get(`/:id`)
  public async GetBlog(@Param("id") id: string) {
    return this.service.GetBlog(Number(id));
  }

  @Roles(ALL_ROLES)
  @ManageBlogsRole({requestSource: "param", key: "id"})
  @UseGuards(RolesGuard, ManageBlogGuard)
  @Patch(`/:id`)
  public async UpdateBlog(@Param("id") id: string, @Body() req: UpdateBlogDto) {
    return this.service.UpdateBlog(Number(id), req);
  }

  @Roles(ALL_ROLES)
  @ManageBlogsRole({requestSource: "param", key: "id"})
  @UseGuards(RolesGuard, ManageBlogGuard)
  @Delete(`/:id`)
  public async DeleteBlog(@Param("id") id: string) {
    return this.service.DeleteBlog(Number(id));
  }

  @Roles([ADMIN])
  @UseGuards(RolesGuard)
  @Put(`/approve/:id`)
  public async ApproveBlog(@Param("id") id: string) {
    return this.service.ApproveBlog(Number(id));
  }

  @Roles([ADMIN])
  @UseGuards(RolesGuard)
  @Delete(`/delete/:id`)
  public async ApproveDelete(@Param("id") id: string) {
    return this.service.ApproveDelete(Number(id));
  }
}
