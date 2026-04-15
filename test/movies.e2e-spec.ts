import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

const movieData = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: 'sci-fi',
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
};

const updateData = {
  rating: 9.0,
  synopsis: 'Updated synopsis for testing purposes.',
};

const invalidUuid = 'not-a-valid-uuid';
const nonExistentUuid = '00000000-0000-4000-a000-000000000000';

describe('Movies E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdMovieId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.query('DELETE FROM movies');
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM movies');
    await app.close();
  });

  // Aquí las pruebas
});
