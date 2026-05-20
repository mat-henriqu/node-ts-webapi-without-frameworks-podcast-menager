import * as http from "http";
import { randomUUID } from "crypto";

import {
  getListEpisodes,
  getFilterEpisodes,
} from "./controllers/podcasts-controller";

import { Routes } from "./routes/routes";
import { HttpMethod } from "./utils/http-methods";
import { StatusCode } from "./utils/status-code";
import { ContentType } from "./utils/content-type";
import {
  FilterEpisodesQueryModel,
  ListEpisodesQueryModel,
} from "./models/podcast-query-model";
import { logger } from "./utils/logger";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const jsonContentType = { "Content-Type": ContentType.JSON };

const sendJson = (
  response: http.ServerResponse,
  statusCode: number,
  payload: unknown,
) => {
  response.writeHead(statusCode, jsonContentType);
  response.end(JSON.stringify(payload));
};

const sendError = (
  response: http.ServerResponse,
  statusCode: number,
  code: string,
  message: string,
  requestId: string,
  method: string,
  path: string,
) => {
  return sendJson(response, statusCode, {
    error: {
      code,
      message,
      requestId,
      method,
      path,
    },
  });
};

type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ValidationFailure = {
  ok: false;
  code: string;
  message: string;
};

const parsePositiveInteger = (
  rawValue: string | null,
  fieldName: string,
): ValidationSuccess<number> | ValidationFailure => {
  if (!rawValue) {
    return {
      ok: true,
      data: fieldName === "page" ? DEFAULT_PAGE : DEFAULT_LIMIT,
    };
  }

  const numericValue = Number(rawValue);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: `${fieldName} deve ser um inteiro positivo`,
    };
  }

  if (fieldName === "limit" && numericValue > MAX_LIMIT) {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: `limit deve ser menor ou igual a ${MAX_LIMIT}`,
    };
  }

  return { ok: true, data: numericValue };
};

const normalizeOptionalText = (
  rawValue: string | null,
  fieldName: string,
): ValidationSuccess<string | undefined> | ValidationFailure => {
  if (rawValue === null) {
    return { ok: true, data: undefined };
  }

  const normalized = rawValue.trim();

  if (!normalized) {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: `${fieldName} nao pode ser vazio`,
    };
  }

  return { ok: true, data: normalized };
};

const validateListQuery = (
  searchParams: URLSearchParams,
): ValidationSuccess<ListEpisodesQueryModel> | ValidationFailure => {
  const page = parsePositiveInteger(searchParams.get("page"), "page");
  if (!page.ok) {
    return page;
  }

  const limit = parsePositiveInteger(searchParams.get("limit"), "limit");
  if (!limit.ok) {
    return limit;
  }

  return {
    ok: true,
    data: {
      page: page.data,
      limit: limit.data,
    },
  };
};

const validateFilterQuery = (
  searchParams: URLSearchParams,
): ValidationSuccess<FilterEpisodesQueryModel> | ValidationFailure => {
  const listQuery = validateListQuery(searchParams);
  if (!listQuery.ok) {
    return listQuery;
  }

  const podcastName = normalizeOptionalText(
    searchParams.get("podcastName") ?? searchParams.get("p"),
    "podcastName",
  );
  if (!podcastName.ok) {
    return podcastName;
  }

  const category = normalizeOptionalText(
    searchParams.get("category"),
    "category",
  );
  if (!category.ok) {
    return category;
  }

  return {
    ok: true,
    data: {
      ...listQuery.data,
      podcastName: podcastName.data,
      category: category.data,
    },
  };
};

export const app = async (
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => {
  const startedAt = process.hrtime.bigint();
  const requestId = randomUUID();
  const method = request.method ?? "UNKNOWN";

  response.setHeader("X-Request-Id", requestId);
  response.on("finish", () => {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);

    logger.info("request_completed", {
      requestId,
      method,
      path,
      statusCode: response.statusCode,
      durationMs,
    });
  });

  let path = "/";
  let searchParams = new URLSearchParams();

  try {
    const parsedUrl = new URL(request.url ?? "/", "http://localhost");
    path = parsedUrl.pathname;
    searchParams = parsedUrl.searchParams;
  } catch {
    return sendError(
      response,
      StatusCode.BadRequest,
      "INVALID_URL",
      "URL invalida",
      requestId,
      method,
      path,
    );
  }

  if (path !== Routes.LIST && path !== Routes.EPISODE) {
    return sendError(
      response,
      StatusCode.NotFound,
      "ROUTE_NOT_FOUND",
      "Rota nao encontrada",
      requestId,
      method,
      path,
    );
  }

  if (method !== HttpMethod.GET) {
    response.setHeader("Allow", HttpMethod.GET);
    return sendError(
      response,
      StatusCode.MethodNotAllowed,
      "METHOD_NOT_ALLOWED",
      "Metodo nao permitido",
      requestId,
      method,
      path,
    );
  }

  const queryValidation =
    path === Routes.LIST
      ? validateListQuery(searchParams)
      : validateFilterQuery(searchParams);

  if (!queryValidation.ok) {
    return sendError(
      response,
      StatusCode.BadRequest,
      queryValidation.code,
      queryValidation.message,
      requestId,
      method,
      path,
    );
  }

  try {
    if (path === Routes.LIST) {
      await getListEpisodes(request, response, queryValidation.data);
      return;
    }

    await getFilterEpisodes(request, response, queryValidation.data);
  } catch (error) {
    logger.error("request_failed", {
      requestId,
      method,
      path,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });

    return sendError(
      response,
      StatusCode.InternalServerError,
      "INTERNAL_SERVER_ERROR",
      "Erro interno do servidor",
      requestId,
      method,
      path,
    );
  }
};
