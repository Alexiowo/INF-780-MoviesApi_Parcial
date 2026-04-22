import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Genre } from '../entities/movie.entity';

export class SearchMoviesDto {
    @ApiPropertyOptional({ enum: Genre, description: 'Género de la película' })
    @IsOptional()
    @IsEnum(Genre, { message: 'genre debe ser un valor válido del enum Genre' })
    genre?: Genre;

    @ApiPropertyOptional({ type: Number, description: 'Año de la película' })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'year debe ser un número entero' })
    @Min(1888)
    @Max(2030)
    year?: number;

    @ApiPropertyOptional({ type: Number, description: 'Rating mínimo' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'minRating debe ser un número' })
    @Min(0)
    @Max(10)
    minRating?: number;
}
