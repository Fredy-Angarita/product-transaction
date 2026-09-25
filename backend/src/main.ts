import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .addTag('customers')
    .addTag('deliveries')
    .addTag('order-items')
    .addTag('transactions')
    .addTag('transaction-statuses')
    .addTag('wompi')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
