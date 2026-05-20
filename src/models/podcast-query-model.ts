export interface PaginationQueryModel {
  page: number;
  limit: number;
}

export type ListEpisodesQueryModel = PaginationQueryModel;

export interface FilterEpisodesQueryModel extends PaginationQueryModel {
  podcastName?: string;
  category?: string;
}
