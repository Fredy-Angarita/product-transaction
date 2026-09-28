import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WOMPI_PAYMENT_PORT } from '../../../../../domain/spi/wompi.payment.port';
import { WompiAdapter } from './wompi-adapter';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => ({
        baseURL: conf.get<string>('URL', 'https://sandbox.wompi.co/v1'),
        timeout: conf.get<number>('WOMPI_TIMEOUT', 10000),
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [
    WompiAdapter,
    {
      provide: WOMPI_PAYMENT_PORT,
      useExisting: WompiAdapter,
    },
  ],
  exports: [WOMPI_PAYMENT_PORT, HttpModule],
})
export class WompiModule {}
