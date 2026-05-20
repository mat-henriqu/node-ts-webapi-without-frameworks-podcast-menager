# Podcast Manager

## Descrição

O Podcast Manager é uma aplicação inspirada no estilo da Netflix, que permite centralizar diferentes episódios de podcasts separados por categoria. Este projeto visa facilitar o acesso e a organização de episódios de podcasts em formato de vídeo, proporcionando uma experiência de navegação intuitiva e agradável para os usuários.

## Funcionalidades

- **Listar os episódios de podcasts em sessões de categorias:** Os episódios são organizados em categorias como saúde, bodybuilder, mentalidade e humor, permitindo aos usuários explorar facilmente os conteúdos disponíveis.
- **Filtrar episódios por nome de podcast:** Os usuários podem realizar buscas específicas por nome de podcast, facilitando o acesso aos episódios desejados.
- **Paginação e filtros:** Suporte a `page`, `limit`, `podcastName` e `category` com validação de parâmetros.

## Implementação

### Listar os episódios de podcasts em sessões de categorias

- **Endpoint:** `GET /api/list`
- **Descrição:** Retorna uma lista de episódios de podcasts organizados por categorias.
- **Query params opcionais:** `page` (inteiro positivo), `limit` (inteiro positivo até 50)
- **Exemplo de resposta:**

```json
{
  "items": [
    {
      "podcastName": "flow",
      "episode": "CBUM - Flow #319",
      "videoId": "pQSuQmUfS30",
      "categories": ["saúde", "esporte", "bodybuilder"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### Filtrar episódios por nome de podcast

- **Endpoint:** `GET /api/podcasts?podcastName={nome}`
- **Descrição:** Retorna episódios filtrados por nome do podcast e/ou categoria com paginação.
- **Query params opcionais:** `podcastName`, `category`, `page`, `limit`
- **Exemplo de requisição:** `GET /api/podcasts?podcastName=flow`
- **Exemplo de requisição com categoria:** `GET /api/podcasts?category=humor&page=1&limit=5`

## Tecnologias Utilizadas

- **[TypeScript](https://www.typescriptlang.org/):** Linguagem de programação utilizada para o desenvolvimento do projeto.
- **[Tsup](https://github.com/egoist/tsup):** Ferramenta de construção e empacotamento para projetos TypeScript.
- **[Tsx](https://github.com/egoist/tsx):** Compilador TypeScript que suporta a construção de projetos.
- **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript que permite executar código JavaScript do lado do servidor.
- **[@types/node](https://www.npmjs.com/package/@types/node):** Pacote de definições de tipos para Node.js para auxiliar no desenvolvimento com TypeScript.

## Como Utilizar

1. Clone este repositório.
2. Instale as dependências usando `npm install`.
3. Inicie o servidor executando `npm run start:dev`.
4. Acesse os endpoints fornecidos para listar os episódios de podcasts ou filtrá-los por nome de podcast.

## Testes

- Execute os testes de integração com: `npm run test`
- Valide tipagem com: `npm run typecheck`
- Execute lint com: `npm run lint`

## Observabilidade

- Logs estruturados em JSON com `requestId`, `method`, `path`, `statusCode` e `durationMs`.
- Ajuste o nível de logs com `LOG_LEVEL` (`debug`, `info`, `warn`, `error`).

## CI

- Workflow GitHub Actions em `.github/workflows/ci.yml` executa `lint`, `typecheck` e `test` em push/PR.

## Contrato de Erro

Em erros HTTP, a API retorna payload JSON padronizado e o header `X-Request-Id`.

Exemplo:

```json
{
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Rota nao encontrada",
    "requestId": "9f6fa6c6-13f3-4479-9393-49fbbf88c3d6",
    "method": "GET",
    "path": "/api/invalida"
  }
}
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir problemas ou enviar solicitações de recebimento (pull requests) para melhorar este projeto.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
