import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Genre, Movie } from './entities/movie.entity';

const mockMoviesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),

};

const movieData = {
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: 'sci-fi',
  year: 2010,
  rating: 8.8,
  synopsis: 'A thief who steals corporate secrets through dream-sharing technology.',
};

const mockMovie: Movie = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Inception',
  director: 'Christopher Nolan',
  genre: Genre.SCIFI,
  year: 2010,
  rating: 8.8,
  synopsis: movieData.synopsis,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validUuid = mockMovie.id;
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

  // POST /movies
  it('Crea una película válida (201)', async () => {
    mockMoviesService.create.mockResolvedValue(mockMovie);
    const res = await request(app.getHttpServer()).post('/movies').send(movieData).expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Inception');
  });

  it('Falta title → 422', async () => {
    // Opción 1: crear el objeto sin title
    const { title, ...invalidData } = movieData;

    await request(app.getHttpServer())
      .post('/movies')
      .send(invalidData)
      .expect(422);
  });

  it('Rating > 10 → 422', async () => {
    await request(app.getHttpServer()).post('/movies').send({ ...movieData, rating: 11 }).expect(422);
  });

  it('Rating < 0 → 422', async () => {
    await request(app.getHttpServer()).post('/movies').send({ ...movieData, rating: -1 }).expect(422);
  });

  it('Year < 1888 → 422', async () => {
    await request(app.getHttpServer()).post('/movies').send({ ...movieData, year: 1800 }).expect(422);
  });

  it('Genre inválido → 422', async () => {
    await request(app.getHttpServer()).post('/movies').send({ ...movieData, genre: 'invalid' }).expect(422);
  });

  // GET /movies
  it('Retorna todas las películas (200)', async () => {
    mockMoviesService.findAll.mockResolvedValue([mockMovie]);
    const res = await request(app.getHttpServer()).get('/movies').expect(200);
    expect(res.body.length).toBe(1);
  });

  it('No existen películas → []', async () => {
    mockMoviesService.findAll.mockResolvedValue([]);
    const res = await request(app.getHttpServer()).get('/movies').expect(200);
    expect(res.body).toEqual([]);
  });

  // GET /movies/:id
  it('UUID válido existente → 200', async () => {
    mockMoviesService.findOne.mockResolvedValue(mockMovie);
    const res = await request(app.getHttpServer()).get(`/movies/${validUuid}`).expect(200);
    expect(res.body.id).toBe(validUuid);
  });

  it('UUID inválido → 400', async () => {
    await request(app.getHttpServer()).get(`/movies/${invalidUuid}`).expect(400);
  });

  it('UUID válido inexistente → 404', async () => {
    mockMoviesService.findOne.mockImplementation(() => { throw new NotFoundException(); });
    await request(app.getHttpServer()).get(`/movies/${nonExistentUuid}`).expect(404);
  });

  // PATCH /movies/:id
  it('Actualiza parcialmente con DTO válido → 200', async () => {
    mockMoviesService.update.mockResolvedValue({ ...mockMovie, rating: 9.0 });
    const res = await request(app.getHttpServer()).patch(`/movies/${validUuid}`).send({ rating: 9.0 }).expect(200);
    expect(res.body.rating).toBe(9.0);
  });

  it('UUID inválido → 400', async () => {
    await request(app.getHttpServer()).patch(`/movies/${invalidUuid}`).send({ rating: 9.0 }).expect(400);
  });

  it('UUID válido inexistente → 404', async () => {
    mockMoviesService.update.mockImplementation(() => { throw new NotFoundException(); });
    await request(app.getHttpServer()).patch(`/movies/${nonExistentUuid}`).send({ rating: 9.0 }).expect(404);
  });

  it('Rating fuera de rango → 422', async () => {
    await request(app.getHttpServer()).patch(`/movies/${validUuid}`).send({ rating: 15 }).expect(422);
  });

  // DELETE /movies/:id
  it('Elimina película existente → 200', async () => {
    mockMoviesService.remove.mockResolvedValue(undefined);
    await request(app.getHttpServer()).delete(`/movies/${validUuid}`).expect(200);
  });

  it('UUID inválido → 400', async () => {
    await request(app.getHttpServer()).delete(`/movies/${invalidUuid}`).expect(400);
  });

  it('UUID válido inexistente → 404', async () => {
    mockMoviesService.remove.mockImplementation(() => { throw new NotFoundException(); });
    await request(app.getHttpServer()).delete(`/movies/${nonExistentUuid}`).expect(404);
  });
  // Sección C · Pruebas de integración del controller (20 pts)
// GET /movies/search
describe('GET /movies/search (Integration)', () => {
  it('C1 → sin query params → 200 y service.search llamado con {}', async () => {
    mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

    const res = await request(app.getHttpServer()).get('/movies/search').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(mockMoviesService.search).toHaveBeenCalledWith({});
  });

  it('C2 → genre=drama → 200 y service.search llamado con { genre: "drama" }', async () => {
    mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

    await request(app.getHttpServer()).get('/movies/search?genre=drama').expect(200);

    expect(mockMoviesService.search).toHaveBeenCalledWith({ genre: 'drama' });
  });

  it('C3 → year=2010&minRating=8.5 → 200 y params como number', async () => {
    mockMoviesService.search = jest.fn().mockResolvedValue([mockMovie]);

    await request(app.getHttpServer())
      .get('/movies/search?year=2010&minRating=8.5')
      .expect(200);

    expect(mockMoviesService.search).toHaveBeenCalledWith({
      year: 2010,
      minRating: 8.5,
    });
  });

  it('C4 → genre=invalid → 422 con mensaje de error', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?genre=invalid')
      .expect(422);

    expect(res.body.message[0]).toContain('genre');
  });

  it('C5 → year=1500 → 422 con mensaje de error', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?year=1500')
      .expect(422);

    expect(res.body.message[0]).toContain('year');
  });

  it('C6 → minRating=11 → 422 con mensaje de error', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?minRating=11')
      .expect(422);

    expect(res.body.message[0]).toContain('minRating');
  });
});
});


