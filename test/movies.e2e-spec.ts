import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Movies E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const seedMovies = [
    { title: 'Inception', director: 'C. Nolan', genre: 'sci-fi', year: 2010, rating: 8.8 },
    { title: 'Interstellar', director: 'C. Nolan', genre: 'sci-fi', year: 2014, rating: 8.6 },
    { title: 'The Godfather', director: 'F. Coppola', genre: 'drama', year: 1972, rating: 9.2 },
    { title: 'Pulp Fiction', director: 'Q. Tarantino', genre: 'drama', year: 1994, rating: 8.9 },
    { title: 'The Dark Knight', director: 'C. Nolan', genre: 'action', year: 2008, rating: 9.0 },
    { title: 'Toy Story', director: 'J. Lasseter', genre: 'animation', year: 1995, rating: 8.3 },
  ];

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

    //limpiar tabla
    await dataSource.query('DELETE FROM movies');

    //insertar datos
    for (const movie of seedMovies) {
      await request(app.getHttpServer())
        .post('/movies')
        .send(movie);
    }
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM movies');
    await app.close();
  });

  //TESTS DEL SEARCH

  it('GET /movies/search → retorna todas las películas', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search')
      .expect(200);

    expect(res.body.length).toBe(6);
  });

  it('filtra por genre', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?genre=sci-fi')
      .expect(200);

    expect(res.body.length).toBe(2);
  });

  it('filtra por year', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?year=1994')
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Pulp Fiction');
  });

  it('filtra por minRating', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?minRating=9.0')
      .expect(200);

    expect(res.body.length).toBe(2);
  });

  it('combina filtros', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?genre=drama&minRating=9.0')
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('The Godfather');
  });

  it('retorna vacío si no hay coincidencias', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?genre=horror')
      .expect(200);

    expect(res.body.length).toBe(0);
  });

  it('retorna vacío si año no coincide', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies/search?year=2030')
      .expect(200);

    expect(res.body.length).toBe(0);
  });

  it('retorna 422 si year es inválido', async () => {
    await request(app.getHttpServer())
      .get('/movies/search?year=invalid')
      .expect(422);
  });
});