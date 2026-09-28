# Agent instructions

## Repository shape

- The git root has no root `package.json`, workspace config, README, CI workflow, or repo-wide task runner. `backend/` and `frontend/` are independent npm projects; run commands from the project directory and use its lockfile (`npm ci`).
- The backend is NestJS + TypeORM + PostgreSQL. The real entrypoint is `backend/src/main.ts`; `AppModule` loads global configuration and wires the product, transaction, wompi, and delivery-fee features. The `customer`, `delivery`, and `order-item` use cases exist under `domain/api/usecase` but are **not registered in `AppModule`**: they have no handler, no controller, and are unreachable outside their own tests. `TransactionUseCase` reaches those features through their persistence ports instead.
- The backend follows a hexagonal/ports-and-adapters layout. `backend/domain` contains framework-independent models, errors, and ports; `backend/application` is a sibling of `src` (not inside it) and contains handlers, DTOs, and composition wiring; `backend/src/infrastructure/in` contains controllers and the domain-error filter; `backend/src/infrastructure/out` contains database adapters and external-provider adapters.
- Ports come in two flavors and both live in `backend/domain`. `domain/spi/` holds the *driven* ports (persistence, gateways, seed factory); `domain/api/` holds the *driving* ports, i.e. the use case interfaces an application layer calls. A feature may depend on ports owned by any other feature; port ownership does not restrict that.
- The frontend is Vue 3 + Vite + Pinia. `frontend/src/main.ts` mounts `App.vue`. It does have an API client (`src/composables/useApi.ts` plus `useProducts`, `useTransactions`, `useWompi`, `useCurrency`) and a Pinia store for products, but there is **no Vite dev-server proxy**, so browser calls to `/api/*` only work if something serves the backend on the same origin. Vite aliases `@` to `src`.

## Setup and database

- Use Node `^22.18.0` or `>=24.12.0` (the frontend engine constraint; the locked TypeORM version also requires a recent Node 22 or 24). Both projects use npm and checked-in `package-lock.json` files.
- Backend environment: copy `backend/.env.example` to `backend/.env` and fill `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `CONTAINER_NAME`. `.env` is ignored. `data.source.ts` also reads `DB_HOST`, but the example omits it; set it explicitly (normally `localhost` when Nest runs on the host). `PORT` is the Nest port and defaults to `3000`.
- `backend/docker-compose.yml` provides only PostgreSQL 17, not the apps. From `backend/`, start it with `docker compose up -d postgres`; it uses the named volume `postgres_data`.
- TypeORM has `synchronize: false`; entity changes require migrations. Run `npm run migration:run` or `npm run migration:revert`, and generate with `NAME=AddSomething npm run migration:generate` from `backend/`. All of these require the configured database to be reachable and explicit user authorization, because they load `backend/.env` and connect to PostgreSQL.
- `migration:generate` will **not** emit a `DROP TABLE` for an orphaned table. TypeORM's schema diff ignores tables that have no entity, so removing an entity alone leaves the table in place with no migration to match. Check the generated SQL before committing it, and write a migration by hand when the change is a drop.

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
- `src/main.ts` seeds fake products on bootstrap, before `app.listen()`, by calling `app.get(ProductHandler).seedProducts(SEED_PRODUCT_COUNT)` (30, a module constant). `ProductUseCase.seedProducts` short-circuits when the product table is not empty, so only the first boot seeds. The call is wrapped in `try/catch` on purpose: a database outage must not stop the server from starting. Use a module-level `new Logger('Bootstrap')`, **not** `app.get(Logger)` — `Logger` is not registered as a provider and calling `app.get(Logger)` throws before your `try` block, which kills the bootstrap.
- Swagger is configured in `src/main.ts`. The API uses the global `api` prefix. The complete route list is: `GET /api/products`, `GET` and `POST /api/transactions`, and `GET /api/wompi/acceptable-terms`. There is no product creation endpoint and no product seed endpoint; products come from the bootstrap seeder.
- Each wired feature has a domain API interface, a framework-independent use case under `domain/api/usecase`, an `@Injectable()` handler under `application/handlers`, and an HTTP controller under `src/infrastructure/in/controller`. `AppModule` creates the use cases through factories, preserving dependency inversion.
- A use case must never import anything from `src/infrastructure/`. That direction is the one that actually protects the hexagon. Depending on another domain feature's port is fine and expected.
- When one feature needs another feature's capability, prefer the **narrowest interface that expresses it**, and inject the token rather than importing the class. Depending on another feature's *driving* port (`domain/api/*`) is legitimate: `TransactionUseCase` receives `IWompiApi`, which keeps Wompi's signature and card-tokenization details out of the transaction feature. Injecting the low-level `IWompiPaymentPort` instead would force the transaction feature to learn the Wompi protocol. Note that `IWompiApi` is currently wider than `TransactionUseCase` needs (it exposes 4 methods, uses 2), and `ICalculateFeeApi` is not really a use case: it only draws a random integer, is registered with `useClass` while the others use `useFactory`, and would be better modeled as a port or a domain service.

## Tests and quality checks

- Jest unit configuration is in `backend/package.json` with `rootDir: "."` and roots for `src`, `application`, and `domain`; unit tests use `*.spec.ts` and do not require a database.
- Test layout: specs for the use cases, controllers, mappers, and repositories live in a `test/` subfolder next to the code they cover (`domain/api/usecase/test/`, `src/infrastructure/in/controller/test/`, `src/infrastructure/out/database/{mappers,repository}/test/`), one file per entity. Handler, DTO, filter, faker, and Wompi adapter specs still sit beside their source. Keep that split: do not add a `test/` folder for a layer that does not have one yet, and do not move single-file specs.
- Because `roots` is `src`, `application`, `domain`, a `test/` folder outside those trees is invisible to Jest and the suite silently reports fewer tests. Keep the folders inside them.
- `jest.Mocked<T>` requires every member of the port, and the compiler rejects extra ones. When a port gains or loses a method, every spec that builds that mock fails to type-check until the factory is updated. Beware the name collision: `IProductSeedFactory` has a `create()` that stays, while `IProductPersistencePort.create()` was removed when product creation was dropped.
- Repository specs must keep `jest.mock('@nestjs/typeorm', ...)` above the imports; `ts-jest` honors the placement, and moving it below the imports makes the real decorator run.
- Unit tests cover the controllers, handlers, use cases, DTOs, database repositories, mappers, and the domain-error filter, including success, empty-result, delegation, null-lookup, stock-validation, card-tokenization, and error-propagation paths.
- `@types/jest` is already a backend dev dependency. `tsconfig.json` explicitly declares `"types": ["node", "jest"]`, so `describe`, `it`, and `expect` are recognized by TypeScript and the editor.
- `npm run test:cov` **currently fails**: it is at roughly 89% statements against a 100% threshold. The gate has been red, not green. Do not assume a green coverage run, and do not report one without checking. The main remaining gaps are `wompi.usecase.ts` (~22%, `polling` and `createWompiTransaction` are untested), several `*.interface.ts` files at 0% (they hold only an unused `Symbol`), four DTOs around 65% whose `fromDomain` paths are not exercised, `product.repository.ts` (`updateStock` has no test), and two branches of `TransactionUseCase` that only `polling` can reach. The user has asked to handle the polling tests separately and carefully.
- `collectCoverageFrom` does not include `src/infrastructure/out/external/**`, so external adapters and mappers are tested for correctness but do not affect the coverage thresholds. Adding new code there does not require coverage changes; adding code under the covered paths does.
- A cheap way to prove a test refactor was faithful: snapshot the per-file coverage table before moving specs and diff it after. A move must leave every line identical; any line that moves means a test was lost or invented.
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
- `frontend/src/composables/useProducts.ts` still exposes `createProduct` and `seedProducts`, which point at `POST /api/products` and `POST /api/products/seed`. Both endpoints were removed on the backend, so those two functions now hit 404s. Nothing breaks at runtime because `stores/products.store.ts` only destructures `fetchProducts` and no component calls the other two, but the functions are dead code pointing at removed routes.

## Persistence layout

- Database entities, migrations, mappers, and repositories live under `backend/src/infrastructure/out/database`; domain interfaces, models, and errors are under `backend/domain`.
- `ProductRepository`, `CustomerRepository`, `DeliveryRepository`, `OrderItemRepository`, and `TransactionRepository` implement their respective persistence ports.
- The datasource registers five entities: product, customer, delivery, order item, and transaction. `DatabaseModule.forFeature` exposes those five and exports every persistence-port token. The `transaction-status` lookup table was removed; its status values now live in the `transaction_status_enum` PostgreSQL type, which is what `Transaction.status` and `TransactionStatusEnum` use. The type is not the table and must not be dropped with it.
- `TransactionRepository.create` is **not** an aggregate write path. It is a single `save()` of the transaction row: no `DataSource.transaction`, no rollback, no customer/delivery/order-item writes, and no stock reservation. The customer, delivery, and order items are persisted by separate calls in `TransactionUseCase`, and stock is decremented only after the payment is approved.
- Stock is decremented per item in `TransactionUseCase` after approval, with a `getById` plus a `updateStock` per line, so a cart of N items costs 2N queries. It is also a read-then-write with no guard against overselling, and a missing product is silently skipped. This is known and deliberately unchanged; do not assume it is atomic.
- Repository lookups return `null` when a record does not exist. Existence and business-rule checks belong to the domain use cases, and `DomainExceptionFilter` maps domain errors to HTTP responses.

## Payment and card handling

- `POST /api/transactions` requires a `card` object: `number`, `cvc`, `exp_month`, `exp_year`, and `card_holder`. `TransactionCardDto` validates the format (13-19 digit number, 3-4 digit CVC, 2 digit month, 2-4 digit year).
- `TransactionUseCase` does not talk to Wompi directly. It calls `IWompiApi`, and `WompiUseCase` is what injects `IWompiPaymentPort`, computes the integrity signature, and calls `tokenizeCard(input.card)`. That indirection is deliberate: it keeps the Wompi protocol out of the transaction feature.
- The card is tokenized before anything is persisted, so a rejected token leaves no customer, transaction, delivery, or order-item rows behind. `TransactionUseCase` persists the customer, transaction, delivery, and order items *before* calling the payment, so a payment failure does leave those rows, marked with the translated status by `settlePayment`.
- The card and the resulting token are never persisted. `CreateTransactionPersistenceInput` deliberately omits `card`, and no `TransactionEntity` column stores it.
- Never log a card object, a raw request body containing `card`, or a tokenization response. Avoid `console.log(input)` in transaction paths.
- `WompiAdapter` posts the card object directly as the axios body. In axios, the second argument is the body and the third is the config; headers belong in the third argument, never inside the body.
- External API responses are modelled twice: `src/infrastructure/out/external/raw/*.raw.ts` holds the wire shape (snake_case, optional fields, response envelopes) and `WompiMapper` translates it to the camelCase domain model. The raw types must stay in the adapter; the domain must not import them.
- `WompiModule` configures `HttpModule.registerAsync` with `baseURL` and `timeout` from `ConfigService`. The Wompi merchant public key is read as `PUB` and the API base URL as `URL`; both come from `backend/.env`.
- `jose@5.10.0` is present in `node_modules` but is intentionally not a declared dependency. Card tokenization in this project sends the card to Wompi in plaintext over the provider's own endpoint, so no JWE encryption is performed. Do not add `jose` to `package.json` unless encryption becomes a requirement, and if it does, pin `jose@^5.2.0` because v6 is ESM-only while this project compiles to CommonJS.
- `HttpModule` is provided by `WompiModule` and re-exported, so other feature modules can inject `HttpService` without importing it directly. `WompiModule` also exports `WOMPI_PAYMENT_PORT`.
- The merchant public key is read from the `PUB` environment variable and the provider base URL from `URL`. Both are configured in `backend/.env`; reference them by name only, never by value.

## Wompi integration rules

- Wompi rejects `amount_in_cents` that is not a multiple of 100: the charged amount in pesos cannot have centavos. `amount_in_cents` is an integer count of cents, and the "00" tail is a hard requirement, not cosmetic. The failure arrives as `status: "ERROR"` with `status_message: "El método de pago escogido no soporta montos con centavos"`, delivered inside a 201, not as an HTTP error. Product prices are whole pesos and the faker generates them with `faker.number.int()`. There is no longer any DTO validating a price, because the product creation endpoint was removed: `FakerProductFactory` is now the only source of products, and its `fractionDigits` is the single place that would reintroduce centavos.
- Keep totals in pesos until the single conversion to cents. Mixing units is easy here and it silently overcharges: wrapping a peso amount in `valueInCents` and adding it to another peso total inflates the charge. `CalculateFeeUseCase.calculateFee` returns whole pesos for the same reason, and `TransactionUseCase` adds the fee to the subtotal before persisting, so `transaction.total` equals what is charged.
- `WompiUseCase.polling` retries five times with a one-second sleep while the status is `PENDING`. It is untested and the user wants its tests handled separately and carefully; do not rewrite it casually.

## Error handling and HTTP mapping

- `WompiErrorFactory` (`src/infrastructure/out/external/wompi/wompi-error.ts`) is the only place that knows Wompi's error envelope. It maps a 4xx to `TransactionStatusEnum.DECLINED`, a 5xx to `ERROR`, and a transport failure with no response to 504, and it always rethrows a `PaymentProviderError`. Never swallow a Wompi error: a `catchError` that does not rethrow resolves the observable with `undefined` and turns a clear failure into a `TypeError` 500.
- `DomainExceptionFilter` propagates `PaymentProviderError.httpStatus` so the client sees Wompi's own status, and `TransactionUseCase.settlePayment` persists the translated status before rethrowing, so a failed payment never leaves a transaction stuck in `PENDING`.
- A 422 from Wompi carries the real detail in `error.messages.<field>[0]`, not in `error.message`. The current mapping only reads `message`, `reason`, and `type`, so a 422 logs as `INPUT_VALIDATION_ERROR`. Extend `WompiErrorFactory.extractMessage` when a validation error needs to be diagnosable.
- The sanitized log payload is built by `WompiErrorFactory.toLog` so it can be unit-tested. Keep it derived only from the mapped error, never from the request: the card number, CVC, and holder must not reach the log even when the `AxiosError` carries the request in `config`.
