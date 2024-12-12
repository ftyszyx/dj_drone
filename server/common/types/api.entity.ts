export interface ApiResp<T> {
  statusCode: number; // 状态
  data?: T; // 返回的数据
  message?: string; // 返回的消息
  success?: boolean; // 是否成功
}

export interface ListResp<T> {
  list: T[];
  total: number;
}

export class PageReq {
  pageNum: number;
  pageSize: number;
}
