import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const config = new ConfigService();
  const rabbitUrl: string = config.get('RABBIT_URL');
  const rabbitQueue: string = config.get('RABBIT_QUEUE');

  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: rabbitQueue,
        },
      },
    );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen();

  // Logger
  const logger = new Logger();
  logger.log('Music-Microservice is listening');
}
bootstrap();
