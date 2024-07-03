import { Reflector } from "@nestjs/core";

export const ManageBlogsRole = Reflector.createDecorator<{
  requestSource: "body" | "param" | "query",
  key: string
}>();