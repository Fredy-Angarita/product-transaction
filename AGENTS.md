# Agent instructions

## Repository shape

- The git root has no root `package.json`, workspace config, README, CI workflow, or repo-wide task runner. `backend/` and `frontend/` are independent npm projects; run commands from the project directory and use its lockfile (`npm ci`).
- The backend is NestJS + TypeORM + PostgreSQL. The real entrypoint is `backend/src/main.ts`; `AppModule` loads global configuration and wires the product, customer, delivery, order-item, transaction, transaction-status, and wompi features.
- The backend follows a hexagonal/ports-and-adapters layout. `backend/domain` contains framework-independent models, errors, and ports; `backend/application` is a sibling of `src` (not inside it) and contains handlers, DTOs, and composition wiring; `backend/src/infrastructure/in` contains controllers and the domain-error filter; `backend/src/infrastructure/out` contains database adapters and external-provider adapters.
- The frontend is Vue 3 + Vite + Pinia. `frontend/src/main.ts` mounts `App.vue`; it is still the starter UI and has no API client or dev-server proxy. Vite aliases `@` to `src`.

## Setup and database

- Use Node `^22.18.0` or `>=24.12.0` (the frontend engine constraint; the locked TypeORM version also requires a recent Node 22 or 24). Both projects use npm and checked-in `package-lock.json` files.
- Backend environment: copy `backend/.env.example` to `backend/.env` and fill `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `CONTAINER_NAME`. `.env` is ignored. `data.source.ts` also reads `DB_HOST`, but the example omits it; set it explicitly (normally `localhost` when Nest runs on the host). `PORT` is the Nest port and defaults to `3000`.
- `backend/docker-compose.yml` provides only PostgreSQL 17, not the apps. From `backend/`, start it with `docker compose up -d postgres`; it uses the named volume `postgres_data`.
- TypeORM has `synchronize: false`; entity changes require migrations. Run `npm run migration:run` or `npm run migration:revert`, and generate with `NAME=AddSomething npm run migration:generate` from `backend/`. All of these require the configured database to be reachable and explicit user authorization, because they load `backend/.env` and connect to PostgreSQL.

## Secrets and environment files

- Never read, print, source, or otherwise load `backend/.env` or any other secret-bearing file unless the user explicitly authorizes it in the current conversation.
- Never pass database credentials to shell commands, Docker, tests, or other tools, and never print environment variables that may contain secrets.
- Do not connect to PostgreSQL, run `docker compose`, or perform manual integration checks without explicit authorization.
- `npm run start:dev`, `npm run start:prod`, and every TypeORM CLI command (`migration:run`, `migration:revert`, `migration:generate`, `migration:show`, `typeorm`) load `backend/.env`; run them only with explicit authorization.
- Reference configuration by variable name, such as `DB_HOST` or `DB_PORT`, and use `backend/.env.example` when documenting setup.
- Never include secret values in code, tests, logs, responses, generated files, or summaries.
- The only file the agent is allowed to read for environment information is `.env.agents`, and only for the purpose the user defines there. The user will create this file when they want the agent to use database information. No other file or resource is accessible to the agent in this project.

## Backend workflow

```text
cd backend
npm ci
npm run start:dev       # watch mode; requires authorization (loads .env)
npm run build           # Nest compile/type check
npx tsc --noEmit        # explicit TypeScript diagnostics
npm test -- --runInBand # unit tests
npm run test:cov        # unit tests with coverage
npm run migration:run   # requires authorization (loads .env and connects to PostgreSQL)
```

- The production build is emitted under `dist/src`; `npm run start:prod` runs `dist/src/main.js`.
- Swagger is configured in `src/main.ts`. The API uses the global `api` prefix; `GET /api/docs` documents the product, customer, delivery, order-item, transaction, transaction-status, and wompi routes.
- Each feature has a domain API interface, a framework-independent use case under `domain/api/usecase`, an `@Injectable()` handler under `application/handlers`, and an HTTP controller under `src/infrastructure/in/controller`. `AppModule` creates the use cases through factories, preserving dependency inversion.
- Use cases depend on ports, not on other use cases. When one feature needs another feature's capability, inject the other's port token into the factory's `inject` array rather than importing the other use case class.

## Tests and quality checks

- Jest unit configuration is in `backend/package.json` with `rootDir: "."` and roots for `src`, `application`, and `domain`; unit tests use `*.spec.ts` and do not require a database.
- Unit tests cover the controllers, handlers, use cases, DTOs, database repositories, mappers, and the domain-error filter, including success, empty-result, delegation, null-lookup, stock-validation, card-tokenization, and error-propagation paths.
- `@types/jest` is already a backend dev dependency. `tsconfig.json` explicitly declares `"types": ["node", "jest"]`, so `describe`, `it`, and `expect` are recognized by TypeScript and the editor.
- `npm run test:cov` enforces 100% statements, functions, and lines across the application and database-adapter slices; branch coverage is limited by decorator metadata generated by Nest. Do not hide uncovered business logic to inflate the report.
- `collectCoverageFrom` does not include `src/infrastructure/out/external/**`, so external adapters and mappers are tested for correctness but do not affect the coverage thresholds. Adding new code there does not require coverage changes; adding code under the covered paths does.
- There are no end-to-end test files or runner scripts. Verification is limited to unit tests, coverage, lint, and the build.
- `npm run lint` runs ESLint with `--fix` across `src`, `application`, and `domain`; `npm run format` writes Prettier changes across those areas. Use read-only `npx eslint ...` and `npx prettier --check ...` when auto-fixes are not wanted. The repository-wide lint command can still report pre-existing formatting issues in the generated database migrations.
- Do not edit generated `backend/dist` to work around source or configuration problems.

## Frontend workflow

```text
cd frontend
npm ci
npm run dev
npm run type-check
npm run build             # runs type-check and Vite build in parallel
```

- `npm run build-only` is the focused Vite bundle; `npm run preview` serves that bundle. There are no frontend test or lint scripts/configurations.
- `npm run format` writes with Prettier; for a read-only check use `npx prettier --check src/` rather than appending `--check` to the existing `--write` script.

## Persistence layout

- Database entities, migrations, mappers, and repositories live under `backend/src/infrastructure/out/database`; domain interfaces, models, and errors are under `backend/domain`.
- `ProductRepository`, `CustomerRepository`, `DeliveryRepository`, `OrderItemRepository`, `TransactionRepository`, and `TransactionStatusRepository` implement their respective persistence ports.
- The datasource registers product, customer, delivery, order item, transaction, and transaction-status entities. `DatabaseModule.forFeature` exposes all six entities and exports every persistence-port token.
- `TransactionRepository.create` is the aggregate write path: it reserves product stock atomically and persists the customer, transaction, delivery, and order items inside one `DataSource.transaction`, rolling everything back on failure.
- Repository lookups return `null` when a record does not exist. Existence and business-rule checks belong to the domain use cases, and `DomainExceptionFilter` maps domain errors to HTTP responses.

## Payment and card handling

- `POST /api/transactions` requires a `card` object: `number`, `cvc`, `exp_month`, `exp_year`, and `card_holder`. `TransactionCardDto` validates the format (13-19 digit number, 3-4 digit CVC, 2 digit month, 2-4 digit year).
- `TransactionUseCase` injects `IWompiPaymentPort` and calls `tokenizeCard(input.card)` after validating status, products, and stock, and before persisting. If tokenization rejects, the transaction is not persisted.
- The card and the resulting token are never persisted. `CreateTransactionPersistenceInput` deliberately omits `card`, and no `TransactionEntity` column stores it.
- Never log a card object, a raw request body containing `card`, or a tokenization response. Avoid `console.log(input)` in transaction paths.
- `WompiAdapter` posts the card object directly as the axios body. In axios, the second argument is the body and the third is the config; headers belong in the third argument, never inside the body.
- External API responses are modelled twice: `src/infrastructure/out/external/raw/*.raw.ts` holds the wire shape (snake_case, optional fields, response envelopes) and `WompiMapper` translates it to the camelCase domain model. The raw types must stay in the adapter; the domain must not import them.
- `WompiModule` configures `HttpModule.registerAsync` with `baseURL` and `timeout` from `ConfigService`. The Wompi merchant public key is read as `PUB` and the API base URL as `URL`; both come from `backend/.env`.
- `jose@5.10.0` is present in `node_modules` but is intentionally not a declared dependency. Card tokenization in this project sends the card to Wompi in plaintext over the provider's own endpoint, so no JWE encryption is performed. Do not add `jose` to `package.json` unless encryption becomes a requirement, and if it does, pin `jose@^5.2.0` because v6 is ESM-only while this project compiles to CommonJS.
- `HttpModule` is provided by `WompiModule` and re-exported, so other feature modules can inject `HttpService` without importing it directly. `WompiModule` also exports `WOMPI_PAYMENT_PORT`.
- The merchant public key is read from the `PUB` environment variable and the provider base URL from `URL`. Both are configured in `backend/.env`; reference them by name only, never by value.
