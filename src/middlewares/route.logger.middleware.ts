import { Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

//this may be removed in production. it is used for login incoming requests
export class RouteLogger implements NestMiddleware {
  logger: Logger = new Logger("ROUTE LOGGER");

  use(request: Request, response: Response, nextFunction: NextFunction) {
    const { ip, method, originalUrl } = request;
    const userAgent = request.headers["user-agent"];

    const now = Date.now() //set request in time

    response.on("finish", () => { //when request is done processing before sending out response to frontned
      const { statusCode, statusMessage } = response; //get status code and message fron processed response
      const contentLength = response.get("content-length");
      this.logger.log(//log the following
        `${userAgent} ${ip} ${method} ${originalUrl} - ${statusCode} | ${statusMessage} content-length = ${contentLength} | time taken - ${Date.now() - now}ms`,
      );
    });
    nextFunction();
  }
}
