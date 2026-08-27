// Shared shape for every paginated, junk-aware admin list (Quotes and
// Inquiries' three tables, Aurielle Mail) -- one page of rows plus
// enough to render pager controls, and an inbox/junk view switch so
// "Move to Junk" has somewhere to land instead of just disappearing.
export const DEFAULT_PAGE_SIZE = 20;

export type ListView = "inbox" | "junk";

export type ListParams = {
  page?: number;
  pageSize?: number;
  view?: ListView;
};

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function normalizeListParams(params: ListParams = {}): { page: number; pageSize: number; view: ListView } {
  return {
    page: Math.max(1, Math.floor(params.page ?? 1)),
    pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
    view: params.view === "junk" ? "junk" : "inbox",
  };
}

export function toListResult<T>(items: T[], total: number, page: number, pageSize: number): ListResult<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
