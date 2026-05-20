import { IncomingMessage, ServerResponse } from "http";

import { serviceListEpisodes } from "../services/list-episodes-service";
import { serviceFilterEpisodes } from "../services/filter-episodes-service";
import { ContentType } from "../utils/content-type";
import { PodcastTransferModel } from "../models/podcast-transfer-model";
import {
  FilterEpisodesQueryModel,
  ListEpisodesQueryModel,
} from "../models/podcast-query-model";

const defaultContent = { "Content-Type": ContentType.JSON };

export const getListEpisodes = async (
  _req: IncomingMessage,
  res: ServerResponse,
  query: ListEpisodesQueryModel,
) => {
  const content: PodcastTransferModel = await serviceListEpisodes(query);

  res.writeHead(content.statusCode, defaultContent);
  res.end(JSON.stringify(content.body));
};

export const getFilterEpisodes = async (
  _req: IncomingMessage,
  res: ServerResponse,
  query: FilterEpisodesQueryModel,
) => {
  const content: PodcastTransferModel = await serviceFilterEpisodes(query);

  res.writeHead(content.statusCode, defaultContent);
  res.end(JSON.stringify(content.body));
};
