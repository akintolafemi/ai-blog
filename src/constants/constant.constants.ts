import { tuple } from "@utils/custom.utils";
import { PROFILE_TYPES } from "./auth.constants";
import * as moment from 'moment';

export const BCRYPT_HASH_ROUNDS = 10;
export const DEFAULT_PAGE_LENGTH = 50;
export const DEFAULT_ORDER_BY = {
  createdat: "desc"
}
export const DEFAULT_PAGE = 1;

export const GLOBAL_FILTER_KEYS = ["id", "deleted", "createdat", "updatedat", "deletedat", "approved", "approvedat"];


export const ALLOWED_FILES_FOR_UPLOAD = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "video/mpeg"
];

export const ALL_ROLES = tuple(...PROFILE_TYPES)

export const NOW = () => {
  return moment(new Date()).utc(true).toDate()
}