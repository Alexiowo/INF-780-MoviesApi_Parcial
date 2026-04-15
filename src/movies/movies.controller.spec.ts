import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Genre } from './entities/movie.entity';
import { Movie } from './entities/movie.entity';

const mockMoviesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const movieData = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: 'sci-fi',
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
};

const mockMovie: Movie = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: Genre.SCIFI,
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const invalidUuid = 'not-a-valid-uuid';
const nonExistentUuid = '00000000-0000-4000-a000-000000000000';

describe('MoviesController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // Aquí las pruebas
});
