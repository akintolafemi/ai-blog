export type paginatedResponse = standardResponse & {
  meta?: meta;
  extradata?: any;
};

export type standardResponse = {
  status: number;
  statusText: "success" | "failed" | "error" | "bad request";
  message: string;
  data?: Array<Record<any, any>> | Record<any, any> | null;
};

export type meta = {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export class ResponseManager {
  public static standardResponse(response: standardResponse) {
    return response;
  }

  public static paginatedResponse(response: paginatedResponse) {
    return response;
  }
}
