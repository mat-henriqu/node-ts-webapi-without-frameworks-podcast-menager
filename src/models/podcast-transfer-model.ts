import { PodcastModel } from "./podcast-model";

export interface PaginationMetaModel {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PodcastListResponseModel {
  items: PodcastModel[];
  pagination: PaginationMetaModel;
}

export interface PodcastTransferModel {
  statusCode: number;
  body: PodcastListResponseModel;
}
