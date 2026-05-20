import { readFile } from "fs/promises";
import path from "path";

import { PodcastModel } from "../models/podcast-model";

export interface RepositoryPodcastFilter {
  podcastName?: string;
  category?: string;
}

const pathData = path.join(__dirname, "../repositories/podcasts.json");

export const repositoryPodcast = async (
  filter?: RepositoryPodcastFilter,
): Promise<PodcastModel[]> => {
  const language = "utf-8";

  const rawData = await readFile(pathData, language);
  const data: PodcastModel[] = JSON.parse(rawData);
  const normalizedPodcastName = filter?.podcastName?.toLowerCase();
  const normalizedCategory = filter?.category?.toLowerCase();

  return data.filter((podcast) => {
    const podcastNameMatches = normalizedPodcastName
      ? podcast.podcastName.toLowerCase() === normalizedPodcastName
      : true;

    const categoryMatches = normalizedCategory
      ? podcast.categories.some(
          (category) => category.toLowerCase() === normalizedCategory,
        )
      : true;

    return podcastNameMatches && categoryMatches;
  });
};
