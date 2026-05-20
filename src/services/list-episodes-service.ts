import { PodcastTransferModel } from "../models/podcast-transfer-model";
import { ListEpisodesQueryModel } from "../models/podcast-query-model";
import { repositoryPodcast } from "../repositories/podcasts-repository";
import { StatusCode } from "../utils/status-code";
import { paginate } from "../utils/pagination";

export const serviceListEpisodes = async (
  query: ListEpisodesQueryModel,
): Promise<PodcastTransferModel> => {
  const data = await repositoryPodcast();
  const paginated = paginate(data, query.page, query.limit);

  const responseFormat: PodcastTransferModel = {
    statusCode: StatusCode.OK,
    body: paginated,
  };

  return responseFormat;
};
