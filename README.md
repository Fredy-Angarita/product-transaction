# product-transaction

Monorepo con dos proyectos independientes (sin workspace config): un **backend** NestJS + TypeORM + PostgreSQL y un **frontend** Vue 3 + Vite + Pinia.

- `backend/` — API de productos y transacciones con pago por tarjetas vía Wompi.
- `frontend/` — SPA de catálogo y checkout.

---

## Entidades (tablas) y sus propiedades

Las entidades están en `backend/src/infrastructure/out/database/entity`. TypeORM corre con `synchronize: false`, por lo que el esquema se administra con migraciones.

### `product`

| Propiedad        | Columna       | Tipo                     | Notas                             |
| ---------------- | ------------- | ------------------------ | --------------------------------- |
| `id`             | `id`          | `uuid`                   | PK, generado                      |
| `name`           | `name`        | `varchar(150)`           |                                   |
| `image`          | `image`       | `text`                   | URL de la imagen                  |
| `price`          | `price`       | `numeric(12,2)`          | Pesos, sin centavos               |
| `quantity`       | `quantity`    | `int`                    | Stock disponible                  |
| `orderItems`     | —             | `OneToMany`              | Relación inversa a `order_item`   |

### `customer`

| Propiedad              | Columna                | Tipo           | Notas                            |
| ---------------------- | ---------------------- | -------------- | -------------------------------- |
| `id`                   | `id`                   | `uuid`         | PK, generado                    |
| `name`                 | `name`                 | `varchar(150)` |                                  |
| `lastName`             | `last_name`            | `varchar(150)` |                                  |
| `identificationNumber` | `identification_number`| `varchar(50)`  |                                  |
| `email`                | `email`                | `varchar(200)` |                                  |
| `transactions`        | —                      | `OneToMany`    | Relación inversa a `transaction` |

### `transaction`

| Propiedad         | Columna              | Tipo                   | Notas                                                       |
| ----------------- | -------------------- | ---------------------- | ----------------------------------------------------------- |
| `uuid`            | `uuid`               | `uuid`                 | PK, generado                                                |
| `acceptanceToken` | `acceptance_token`   | `varchar`              | Token de aceptación de Wompi                               |
| `acceptPersonalAuth` | `accept_personal_auth` | `varchar`         | Flag de aceptación de tratamiento de datos                |
| `status`          | `status`             | `enum`                 | Tipo `transaction_status_enum`, default `PENDING`            |
| `customerId`      | `customer_uuid`      | `uuid`                 | FK lógica a `customer.id`                                   |
| `customer`        | —                    | `ManyToOne`            | `JoinColumn: customer_uuid`, nullable                        |
| `delivery`        | —                    | `OneToOne`             | Relación inversa a `delivery`                               |
| `total`           | `total`              | `numeric(12,2)`        | Subtotal + fee de envío, en pesos                           |
| `items`           | —                    | `OneToMany`            | Relación inversa a `order_item`                             |
| `createdAt`       | `create_at`          | `timestamptz` (`CreateDateColumn`) | Automático                              |
| `updatedAt`       | `update_at`          | `timestamptz` (`UpdateDateColumn`) | Automático                              |

Valores de `transaction_status_enum` (`TransactionStatusEnum`): `PENDING`, `APPROVED`, `DECLINED`, `VOIDED`, `ERROR`.

### `delivery`

| Propiedad        | Columna           | Tipo            | Notas                                          |
| ---------------- | ----------------- | --------------- | ---------------------------------------------- |
| `id`             | `id`              | `uuid`          | PK, generado                                   |
| `country`        | `country`         | `varchar(150)`  |                                                |
| `city`           | `city`            | `varchar(150)`  |                                                |
| `locality`       | `locality`        | `varchar(150)`  |                                                |
| `subLocality`    | `sub_locality`    | `varchar(150)`  |                                                |
| `address`        | `address`         | `varchar`       |                                                |
| `postalCode`     | `postal_code`     | `varchar(50)`   |                                                |
| `additionalInfo` | `additional_info` | `text`          |                                                |
| `fee`            | `fee`             | `numeric(12,2)` | Costo de envío en pesos                        |
| `transactionId`  | `transaction_id`  | `uuid`          | Nullable                                        |
| `transaction`    | —                 | `OneToOne`      | `JoinColumn: transaction_id`                   |

### `order_item`

| Propiedad       | Columna          | Tipo            | Notas                                     |
| --------------- | ---------------- | --------------- | ----------------------------------------- |
| `id`            | `id`             | `uuid`          | PK, generado                              |
| `transactionId` | `transaction_id` | `uuid`          | FK a `transaction.uuid`, `ON DELETE CASCADE` |
| `transaction`   | —                | `ManyToOne`     | `nullable: false`                         |
| `productId`     | `product_id`     | `uuid`          | FK a `product.id`                         |
| `product`       | —                | `ManyToOne`     | `nullable: false`                         |
| `price`         | `price`          | `numeric(12,2)` | Precio unitario congelado al comprar     |
| `quantity`      | `quantity`       | `int`           | Cantidad comprada                         |

Notas importantes:

- La tarjeta y su token **nunca** se persisten.
- El catálogo se puebla con datos fake en el bootstrap (`main.ts` → `ProductUseCase.seedProducts`), y solo en el primer arranque.
- El precio se mantiene en pesos hasta la única conversión a centavos; Wompi rechaza montos con centavos.
- La tabla `transaction_status` fue eliminada; el enum `transaction_status_enum` **no** es una tabla y no debe eliminarse con ella.

---

## Estructura de carpetas

### Backend

```text
backend/
├── domain/                     # Independiente de frameworks
│   ├── api/                    # Puertos *driving* (interfaces de casos de uso)
│   │   └── usecase/            # Casos de uso (implementaciones)
│   ├── spi/                    # Puertos *driven* (persistencia, gateways, seed)
│   ├── models/                 # Modelos de dominio
│   ├── errors/                 # Errores de dominio
│   └── utils/
├── application/                # Capa de aplicación (hermano de src/)
│   ├── dtos/
│   └── handlers/               # Handlers @Injectable()
└── src/                        # Bootstrap + infraestructura (adaptadores)
    ├── main.ts                 # Entry point, Swagger, seeding
    ├── app.module.ts
    ├── config/
    └── infrastructure/
        ├── in/                 # Adaptadores de entrada (HTTP)
        │   ├── controller/
        │   └── filters/        # DomainExceptionFilter
        └── out/                # Adaptadores de salida
            ├── database/       # config, entity, mappers, migrations, repository
            ├── external/       # raw/ (wire format) y wompi/
            └── faker/          # Seed factory
```

Regla de dependencia: un caso de uso **nunca** importa desde `src/infrastructure/`.

### Frontend

```text
frontend/
├── public/
└── src/
    ├── main.ts                 # Monta App.vue
    ├── App.vue
    ├── assets/                 # base.css, main.css, logo
    ├── components/
    │   ├── icons/
    │   └── ui/
    ├── composables/
    │   ├── interfaces/         # entity/, request/, response/
    │   ├── useApi.ts
    │   ├── useCurrency.ts
    │   ├── useProducts.ts
    │   ├── useTransactions.ts
    │   └── useWompi.ts
    ├── features/
    │   ├── checkout/           # components/steps, composables
    │   └── products/           # components
    ├── stores/                 # Pinia
    └── utils/
```

---

## Modelo de datos

<!-- Espacio reservado para el diagrama o la descripción del modelo de datos (ERD). -->

Pendiente.
