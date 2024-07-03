import { tuple } from "@utils/custom.utils";

export const EMPLOYEE = "employee"
export const NONEMPLOYEE = "nonemployee"
export const ADMIN = "admin"

export const PROFILE_TYPES = tuple(
  EMPLOYEE,
  NONEMPLOYEE,
  ADMIN
)