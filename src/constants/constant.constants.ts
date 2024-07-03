import { tuple } from "@utils/custom.utils";
import { PROFILE_TYPES } from "./auth.constants";
import * as moment from 'moment';

export const BCRYPT_HASH_ROUNDS = 10; //default hash rounds for bcrypt
export const DEFAULT_PAGE_LENGTH = 50; //default page length for pagination if limit query param isn't sent from frontend
export const DEFAULT_ORDER_BY = { //default order by; uses createdat field in desc order
  createdat: "desc"
}
export const DEFAULT_PAGE = 1; //returns first page by default

export const GLOBAL_FILTER_KEYS = ["id", "deleted", "createdat", "updatedat", "deletedat", "approved", "approvedat"]; //good to have a commong query fields for get all endpoints 


export const ALLOWED_FILES_FOR_UPLOAD = [ //allowed file types for upload
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "video/mpeg"
];

export const ALL_ROLES = tuple(...PROFILE_TYPES)

export const NOW = () => { //momentjs can act funny some times using UTC, so force to use the active user's timezone then use the value as datetime where necessary
  return moment(new Date()).utc(true).toDate() 
}