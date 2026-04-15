import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Genre } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

const movieData: CreateMovieDto = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: Genre.SCIFI,
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
};

const mockMovie: Movie = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: movieData.title,
  director: movieData.director,
  genre: movieData.genre,
  year: movieData.year,
  rating: movieData.rating,
  synopsis: movieData.synopsis ?? '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  // Prueba 1
  it('El servicio debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // Aquí las pruebas
});
