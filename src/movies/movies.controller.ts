import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { Genre } from './entities/movie.entity';



@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva película' })
  @ApiResponse({ status: 201, description: 'Película creada exitosamente', type: Movie })
  @ApiResponse({ status: 422, description: 'Error de validación de datos' })
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las películas' })
  @ApiResponse({ status: 200, description: 'Lista de películas', type: [Movie] })
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }
  @Get('search')
  @ApiOperation({ summary: 'Buscar películas aplicando filtros opcionales' })
  @ApiQuery({ name: 'genre', required: false, enum: Genre })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de películas filtradas' })
  @ApiResponse({ status: 422, description: 'Error de validación en filtros' })
  search(@Query() filters: SearchMoviesDto) {
    return this.moviesService.search(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una película por UUID' })
  @ApiParam({ name: 'id', description: 'UUID de la película' })
  @ApiResponse({ status: 200, description: 'Película encontrada', type: Movie })
  @ApiResponse({ status: 400, description: 'UUID con formato inválido' })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una película' })
  @ApiParam({ name: 'id', description: 'UUID de la película' })
  @ApiResponse({ status: 200, description: 'Película actualizada', type: Movie })
  @ApiResponse({ status: 400, description: 'UUID con formato inválido' })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  @ApiResponse({ status: 422, description: 'Error de validación de datos' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una película' })
  @ApiParam({ name: 'id', description: 'UUID de la película' })
  @ApiResponse({ status: 200, description: 'Película eliminada correctamente' })
  @ApiResponse({ status: 400, description: 'UUID con formato inválido' })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.moviesService.remove(id);
  }

}
