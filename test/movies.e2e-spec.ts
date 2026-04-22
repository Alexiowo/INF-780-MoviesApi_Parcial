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
  synopsis: 'Dream-sharing technology',
};

const updateData = {
  rating: 9.0,
  synopsis: 'Updated synopsis for testing purposes.',
};

const invalidUuid = 'not-a-valid-uuid';
const nonExistentUuid = '00000000-0000-4000-a000-000000000000';

describe('Movies (e2e)', () => {
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

  // POST /movies
  describe('POST /movies', () => {
    it('1. should create a movie (201)', async () => {
      const res = await request(app.getHttpServer()).post('/movies').send(movieData).expect(201);
      createdMovieId = res.body.id;
      expect(res.body.title).toBe('Inception');
    });

    it('2. should return 422 when title is missing', async () => {
      const { title, ...invalidData } = movieData;
      await request(app.getHttpServer()).post('/movies').send(invalidData).expect(422);
    });

    it('3. should return 422 when rating > 10', async () => {
      await request(app.getHttpServer()).post('/movies').send({ ...movieData, rating: 11 }).expect(422);
    });

    it('4. should return 422 when rating < 0', async () => {
      await request(app.getHttpServer()).post('/movies').send({ ...movieData, rating: -1 }).expect(422);
    });

    it('5. should return 422 when year < 1888', async () => {
      await request(app.getHttpServer()).post('/movies').send({ ...movieData, year: 1800 }).expect(422);
    });

    it('6. should return 422 when genre is invalid', async () => {
      await request(app.getHttpServer()).post('/movies').send({ ...movieData, genre: 'invalid' }).expect(422);
    });
  });

  // GET /movies
  describe('GET /movies', () => {
    it('7. should return 200 with array containing created movie', async () => {
      const res = await request(app.getHttpServer()).get('/movies').expect(200);
      expect(res.body.some((m: any) => m.id === createdMovieId)).toBe(true);
    });
  });

  // GET /movies/:id
  describe('GET /movies/:id', () => {
    it('8. should return 200 with the correct movie', async () => {
      const res = await request(app.getHttpServer()).get(`/movies/${createdMovieId}`).expect(200);
      expect(res.body.id).toBe(createdMovieId);
    });

    it('9. should return 400 when UUID is invalid', async () => {
      await request(app.getHttpServer()).get(`/movies/${invalidUuid}`).expect(400);
    });

    it('10. should return 404 when movie does not exist', async () => {
      await request(app.getHttpServer()).get(`/movies/${nonExistentUuid}`).expect(404);
    });
  });

  // PATCH /movies/:id
  describe('PATCH /movies/:id', () => {
    it('11. should update rating and synopsis (200)', async () => {
      const res = await request(app.getHttpServer()).patch(`/movies/${createdMovieId}`).send(updateData).expect(200);
      expect(res.body.rating).toBe(9.0);
      expect(res.body.synopsis).toBe(updateData.synopsis);
    });

    it('12. should return 400 when UUID is invalid', async () => {
      await request(app.getHttpServer()).patch(`/movies/${invalidUuid}`).send(updateData).expect(400);
    });

    it('13. should return 404 when movie does not exist', async () => {
      await request(app.getHttpServer()).patch(`/movies/${nonExistentUuid}`).send(updateData).expect(404);
    });

    it('14. should return 422 when rating is out of range', async () => {
      await request(app.getHttpServer()).patch(`/movies/${createdMovieId}`).send({ rating: 15 }).expect(422);
    });
  });

  // DELETE /movies/:id
  describe('DELETE /movies/:id', () => {
    it('15. should delete the movie and return 200', async () => {
      await request(app.getHttpServer()).delete(`/movies/${createdMovieId}`).expect(200);
    });

    it('should return 404 when trying to get deleted movie', async () => {
      await request(app.getHttpServer()).get(`/movies/${createdMovieId}`).expect(404);
    });
  });
});
