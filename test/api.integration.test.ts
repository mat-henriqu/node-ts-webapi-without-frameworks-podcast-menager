import assert from "node:assert/strict";
import * as http from "node:http";
import test from "node:test";

import { app } from "../src/app";

type HttpResponse = {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: unknown;
};

const request = (
  server: http.Server,
  method: string,
  path: string,
): Promise<HttpResponse> => {
  return new Promise((resolve, reject) => {
    const address = server.address();

    if (!address || typeof address === "string") {
      reject(new Error("Endereco do servidor invalido"));
      return;
    }

    const req = http.request(
      {
        host: "127.0.0.1",
        port: address.port,
        path,
        method,
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const isJson = (res.headers["content-type"] ?? "").includes(
            "application/json",
          );

          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: isJson && raw ? JSON.parse(raw) : raw,
          });
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
};

test("GET /api/list retorna lista de episodios", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "GET", "/api/list");

    assert.equal(response.statusCode, 200);
    const body = response.body as {
      items: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
      };
    };

    assert.ok(Array.isArray(body.items));
    assert.equal(body.pagination.page, 1);
    assert.equal(body.pagination.limit, 10);
  } finally {
    server.close();
  }
});

test("GET /api/podcasts?podcastName=flow retorna apenas podcasts filtrados", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(
      server,
      "GET",
      "/api/podcasts?podcastName=flow",
    );

    assert.equal(response.statusCode, 200);
    const body = response.body as {
      items: Array<{ podcastName: string }>;
      pagination: { page: number; limit: number };
    };

    const podcasts = body.items;
    assert.ok(podcasts.length > 0);
    assert.ok(podcasts.every((podcast) => podcast.podcastName === "flow"));
    assert.equal(body.pagination.page, 1);
    assert.equal(body.pagination.limit, 10);
  } finally {
    server.close();
  }
});

test("GET /api/podcasts?category=humor retorna filtro por categoria", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(
      server,
      "GET",
      "/api/podcasts?category=humor",
    );

    assert.equal(response.statusCode, 200);

    const body = response.body as {
      items: Array<{ categories: string[] }>;
    };

    assert.ok(body.items.length > 0);
    assert.ok(
      body.items.every((podcast) =>
        podcast.categories.some(
          (category) => category.toLowerCase() === "humor",
        ),
      ),
    );
  } finally {
    server.close();
  }
});

test("GET /api/list?page=2&limit=2 retorna paginação correta", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "GET", "/api/list?page=2&limit=2");

    assert.equal(response.statusCode, 200);

    const body = response.body as {
      items: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
      };
    };

    assert.equal(body.items.length, 2);
    assert.equal(body.pagination.page, 2);
    assert.equal(body.pagination.limit, 2);
    assert.equal(body.pagination.total, 4);
    assert.equal(body.pagination.totalPages, 2);
    assert.equal(body.pagination.hasNext, false);
    assert.equal(body.pagination.hasPrevious, true);
  } finally {
    server.close();
  }
});

test("GET em rota inexistente retorna 404 com payload padronizado de erro", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "GET", "/api/invalida");

    assert.equal(response.statusCode, 404);
    assert.equal(typeof response.body, "object");
    assert.ok(response.headers["x-request-id"]);

    const body = response.body as {
      error: { code: string; message: string; requestId: string };
    };

    assert.equal(body.error.code, "ROUTE_NOT_FOUND");
    assert.equal(body.error.message, "Rota nao encontrada");
    assert.ok(body.error.requestId);
  } finally {
    server.close();
  }
});

test("POST /api/list retorna 405 e header Allow com GET", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "POST", "/api/list");

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.allow, "GET");

    const body = response.body as {
      error: { code: string; method: string; path: string };
    };

    assert.equal(body.error.code, "METHOD_NOT_ALLOWED");
    assert.equal(body.error.method, "POST");
    assert.equal(body.error.path, "/api/list");
  } finally {
    server.close();
  }
});

test("GET /api/podcasts?page=0 retorna 400 com erro de validação", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "GET", "/api/podcasts?page=0");

    assert.equal(response.statusCode, 400);

    const body = response.body as {
      error: { code: string; message: string };
    };

    assert.equal(body.error.code, "INVALID_QUERY");
    assert.equal(body.error.message, "page deve ser um inteiro positivo");
  } finally {
    server.close();
  }
});
