import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '../entities/movie.entity';

export class CreateMovieDto {
  @ApiProperty({ example: 'Inception', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Christopher Nolan', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  director: string;

  @ApiProperty({ enum: Genre, example: Genre.SCIFI })
  @IsEnum(Genre)
  genre: Genre;

  @ApiProperty({ example: 2010, minimum: 1888, maximum: 2030 })
  @IsInt()
  @Min(1888)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 8.8, minimum: 0, maximum: 10 })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  rating: number;

  @ApiPropertyOptional({ example: 'A thief who steals corporate secrets...' })
  @IsString()
  @IsOptional()
  synopsis?: string;
}
