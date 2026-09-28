import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProductHandler } from '../application/handlers/product.handler';
import { AppModule } from './app.module';

const SEED_PRODUCT_COUNT = 30;
const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  try {
    const inserted = await app
      .get(ProductHandler)
      .seedProducts(SEED_PRODUCT_COUNT);
    if (inserted > 0) {
      bootstrapLogger.log(`Seeding: ${inserted} productos creados`);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    bootstrapLogger.error(
      `El seeding fallo (${reason}), la app sigue levantando igual`,
    );
  }

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Product Transaction API')
    .setDescription('API for managing products and transactions')
    .setVersion('1.0')
    .addTag('products')
    .addTag('transactions')
    .addTag('wompi')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
