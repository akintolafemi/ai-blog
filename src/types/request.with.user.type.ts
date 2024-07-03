import { profiles, users } from "@prisma/client";

type User = {
  user: users & {
    profile: profiles
  };
};


type RequestWithUser = Request & User;

export default RequestWithUser;
