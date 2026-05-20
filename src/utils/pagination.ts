import { PaginationMetaModel } from "../models/podcast-transfer-model";

export const paginate = <T>(items: T[], page: number, limit: number) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;

  const pagination: PaginationMetaModel = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };

  return {
    items: items.slice(start, end),
    pagination,
  };
};
