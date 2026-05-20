import { PodcastTransferModel } from "../models/podcast-transfer-model";
import { FilterEpisodesQueryModel } from "../models/podcast-query-model";
import { repositoryPodcast } from "../repositories/podcasts-repository";
import { StatusCode } from "../utils/status-code";
import { paginate } from "../utils/pagination";

export const serviceFilterEpisodes = async (
  query: FilterEpisodesQueryModel,
): Promise<PodcastTransferModel> => {
  const data = await repositoryPodcast({
    podcastName: query.podcastName,
    category: query.category,
  });
  const paginated = paginate(data, query.page, query.limit);

  const responseFormat: PodcastTransferModel = {
    statusCode: StatusCode.OK,
    body: paginated,
  };

  return responseFormat;
};
