import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie, Genre } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoreThanOrEqual } from 'typeorm';
import { SearchMoviesDto } from './dto/search-movies.dto';


type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

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
  synopsis: 'A thief who steals corporate secrets through dream-sharing technology.',
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

  describe('create', () => {
    // Prueba 2
    it('debe crear y retornar una película', async () => {
      repository.create!.mockReturnValue(mockMovie);
      repository.save!.mockResolvedValue(mockMovie);

      const result = await service.create(movieData);

      expect(repository.create).toHaveBeenCalledWith(movieData);
      expect(repository.save).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });

    // Prueba 3
    it('debe asignar un UUID automáticamente', async () => {
      repository.create!.mockReturnValue(mockMovie);
      repository.save!.mockResolvedValue(mockMovie);

      const result = await service.create(movieData);

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('findAll', () => {
    // Prueba 4
    it('retorna todas las películas', async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMovie]);
    });

    // Prueba 5
    it('retorna un array vacío cuando no existen películas', async () => {
      repository.find!.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    // Prueba 6
    it('retorna la película correspondiente a un UUID existente', async () => {
      repository.findOneBy!.mockResolvedValue(mockMovie);

      const result = await service.findOne(mockMovie.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockMovie.id });
      expect(result).toEqual(mockMovie);
    });

    // Prueba 7
    it('lanza NotFoundException si el UUID no existe', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    // Prueba 8
    it('actualiza los campos de una película existente', async () => {
      const updateData: UpdateMovieDto = { rating: 9.0 };
      repository.findOneBy!.mockResolvedValue(mockMovie);
      repository.merge!.mockReturnValue({ ...mockMovie, ...updateData });
      repository.save!.mockResolvedValue({ ...mockMovie, ...updateData });

      const result = await service.update(mockMovie.id, updateData);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockMovie.id });
      expect(result.rating).toBe(9.0);
    });

    // Prueba 9
    it('lanza NotFoundException si el UUID no existe al actualizar', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.update('uuid-inexistente', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    // Prueba 10
    it('elimina una película existente', async () => {
      repository.findOneBy!.mockResolvedValue(mockMovie);
      repository.remove!.mockResolvedValue(mockMovie);

      const result = await service.remove(mockMovie.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockMovie.id });
      expect(repository.remove).toHaveBeenCalledWith(mockMovie);
      expect(result).toBeUndefined();
    });

    // Prueba 11
    it('lanza NotFoundException si el UUID no existe al eliminar', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.remove('uuid-inexistente')).rejects.toThrow(NotFoundException);
    });

    // Prueba SEARCH 
    describe('search', () => {
      // B1
      it('sin filtros debe llamar a repository.find con where vacío y retornar todas las películas', async () => {
        const mockMovies = [mockMovie];
        repository.find!.mockResolvedValue(mockMovies);

        const result = await service.search({});
        expect(repository.find).toHaveBeenCalledWith({ where: {} });
        expect(result).toEqual(mockMovies);
      });

      // B2
      it('con genre debe llamar a repository.find con where: { genre }', async () => {
        const mockMovies = [{ ...mockMovie, genre: Genre.DRAMA }];
        repository.find!.mockResolvedValue(mockMovies);

        const result = await service.search({ genre: Genre.DRAMA });
        expect(repository.find).toHaveBeenCalledWith({ where: { genre: Genre.DRAMA } });
        expect(result).toEqual(mockMovies);
      });

      // B3
      it('con year debe llamar a repository.find con where: { year }', async () => {
        const mockMovies = [{ ...mockMovie, year: 2010 }];
        repository.find!.mockResolvedValue(mockMovies);

        const result = await service.search({ year: 2010 });
        expect(repository.find).toHaveBeenCalledWith({ where: { year: 2010 } });
        expect(result).toEqual(mockMovies);
      });

      // B4
      it('con minRating debe usar MoreThanOrEqual', async () => {
        const mockMovies = [{ ...mockMovie, rating: 9.0 }];
        repository.find!.mockResolvedValue(mockMovies);

        const result = await service.search({ minRating: 8.0 });
        expect(repository.find).toHaveBeenCalledWith({
          where: { rating: MoreThanOrEqual(8.0) },
        });
        expect(result).toEqual(mockMovies);
      });

      // B5
      it('con genre, year y minRating debe combinar los filtros', async () => {
        const mockMovies = [{ ...mockMovie, genre: Genre.DRAMA, year: 2010, rating: 9.0 }];
        repository.find!.mockResolvedValue(mockMovies);

        const result = await service.search({ genre: Genre.DRAMA, year: 2010, minRating: 8.0 });
        expect(repository.find).toHaveBeenCalledWith({
          where: {
            genre: Genre.DRAMA,
            year: 2010,
            rating: MoreThanOrEqual(8.0),
          },
        });
        expect(result).toEqual(mockMovies);
      });

      // B6
      it('debe retornar array vacío si no hay coincidencias', async () => {
        repository.find!.mockResolvedValue([]);

        const result = await service.search({});
        expect(result).toEqual([]);
      });
    });

  });
});
