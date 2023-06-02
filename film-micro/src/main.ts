import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5674'],
          queue: 'auth_queue',
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
  logger.log('Microservice is listening');
}
bootstrap();
