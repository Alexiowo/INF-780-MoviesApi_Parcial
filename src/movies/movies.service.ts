import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoreThanOrEqual } from 'typeorm';
import { SearchMoviesDto } from './dto/search-movies.dto';


@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) { }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto);
    return this.movieRepository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOneBy({ id });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);
    this.movieRepository.merge(movie, updateMovieDto);
    return this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
  }
  async search(filters: SearchMoviesDto): Promise<Movie[]> {
    const where: any = {};

    if (filters.genre) {
      where.genre = filters.genre;
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.minRating !== undefined) {
      where.rating = MoreThanOrEqual(filters.minRating);
    }

    return this.movieRepository.find({ where });
  }
}
