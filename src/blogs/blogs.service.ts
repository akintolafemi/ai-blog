import { CreateBlogDto, QueryBlogsDto, UpdateBlogDto } from '@dtos/blogs.dtos';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FilterRequestObject } from '@utils/filter.request.utils';
import { PaginationRequest } from '@utils/pagination.request.utils';
import { ResponseManager, paginatedResponse, standardResponse } from '@utils/response.manager.utils';
import { BLOGS_FILTER_KEYS, BLOG_CREATED_EVENT } from 'src/constants/blogs.constants';
import { NOW } from 'src/constants/constant.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import RequestWithUser from 'src/types/request.with.user.type';

@Injectable()
export class BlogsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private request: RequestWithUser
  ) {}

  async CreateBlog(req: CreateBlogDto): Promise<standardResponse | HttpException> {
    try {
      const isEmployee = this.request.user.profile.profiletype === "employee" || this.request.user.profile.profiletype === "admin"

      const blog = await this.prismaService.blogs.create({
        data: {
          ...req,
          blogauthorid: this.request.user.profile.id,
          approved: isEmployee,
          approvedat: isEmployee ? NOW() : undefined,
          blogapproverid: isEmployee ? this.request.user.profile.id : undefined,
          blogstatus: isEmployee ? `public` : `draft`
        }
      })

      //may notify newsletter users of new post
      if (this.request.user.profile.profiletype === "employee") {
        
      }

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog created successfully!`,
        status: HttpStatus.CREATED,
        statusText: "success",
        data: blog
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

  async UpdateBlog(id: number, req: UpdateBlogDto): Promise<standardResponse | HttpException> {
    try {
      const update = await this.prismaService.blogs.update({
        where: {
          id
        }, data: {
          ...req,
          updatedat: NOW()
        }
      })

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog updated successfully!`,
        status: HttpStatus.OK,
        statusText: "success",
        data: update
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

  async GetBlog(id: number): Promise<standardResponse | HttpException> {
    try {
      const blog = await this.prismaService.blogs.findUnique({
        where: {
          id,
        }, include: {
          blogapprover: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            }
          }, 
          blogauthor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            }
          }
        }
      })

      if (!blog) 
        throw new HttpException("Blog does not exist", HttpStatus.NOT_FOUND, {
          cause: `Invalid id - ${id} in url`, 
          description: `Blog with id - ${id} does not exist`
        });

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog data returned successfully!`,
        status: HttpStatus.OK,
        statusText: "success",
        data: blog
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

  public async GetAllBlogs(req: QueryBlogsDto): Promise<paginatedResponse | HttpException> {
    try {
      const { paginationReq, limit, page } = PaginationRequest(req);
      const filter = FilterRequestObject(req, BLOGS_FILTER_KEYS);
      
      const data = await this.prismaService.blogs.findMany({
        where: {
          ...filter
        }, include: {
          blogauthor: {
            select: {
              id: true,
              lastname: true,
              firstname: true
            }
          }
        },
        ...paginationReq
      })

      const totalRecords = await this.prismaService.blogs.count({
        where: {
          ...filter,
        }
      });
      
      return ResponseManager.paginatedResponse({
        message: `Blogs returned successfully`,
        statusText: "success",
        status: HttpStatus.OK,
        data,
        meta: {
          currentPage: page,
          itemCount: data.length,
          itemsPerPage: limit,
          totalItems: totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        }
      });
    } catch (error) {
      throw new HttpException({
        message: error?.response || "Unknown error has occured",
        statusText: "error",
        status: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        data: error
      }, error?.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async ApproveBlog(id: number): Promise<standardResponse | HttpException> {
    try {
      const update = await this.prismaService.blogs.update({
        where: {
          id
        }, data: {
          blogstatus: `public`,
          approved: true,
          approvedat: NOW()
        }
      })

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog approved successfully!`,
        status: HttpStatus.OK,
        statusText: "success",
        data: update
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

  async DeleteBlog(id: number): Promise<standardResponse | HttpException> {
    try {
      const isEmployee = this.request.user.profile.profiletype === "employee" || this.request.user.profile.profiletype === "admin"

      const update = isEmployee ? await this.prismaService.blogs.update({
        where: {
          id
        }, data: {
          deleted: true,
          deletedat: NOW()
        }
      }) : await this.prismaService.blogs.update({
        where: {
          id
        }, data: {
          blogstatus: `pendingdelete`
        }
      })

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog deleted successfully!`,
        status: HttpStatus.OK,
        statusText: "success",
        data: update
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

  async ApproveDelete(id: number): Promise<standardResponse | HttpException> {
    try {
      const update = await this.prismaService.blogs.updateMany({
        where: {
          id,
          blogstatus: `pendingdelete`
        }, data: {
          deleted: true,
          deletedat: NOW()
        }
      })

      return ResponseManager.standardResponse({ //send out response if everything works well
        message: `Blog deleted successfully!`,
        status: HttpStatus.OK,
        statusText: "success",
        data: update
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
