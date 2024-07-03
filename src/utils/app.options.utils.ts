import { NestApplicationOptions } from "@nestjs/common";

export const AppOptions: NestApplicationOptions = {
  rawBody: true,
  cors: {
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"], //specify allowed request types,
    // origin //specify allowed origins for IP whitelisting
  },
}