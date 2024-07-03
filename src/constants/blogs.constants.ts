import { tuple } from "@utils/custom.utils"
import { GLOBAL_FILTER_KEYS } from "./constant.constants"

export const BLOG_CREATED_EVENT = `blog-created-event`

export const BLOG_STATUSES = tuple(
  "public", "archive", "draft", "pendingdelete"
)

export const BLOGS_FILTER_KEYS = [...GLOBAL_FILTER_KEYS, "blogapproverid" , "blogauthorid", "blogsubtitle", "blogtitle", "blogstatus"]