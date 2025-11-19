export interface PaginatedResult<T> {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: T[];
}