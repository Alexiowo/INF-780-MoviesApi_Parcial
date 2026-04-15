import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Genre {
  ACTION = 'action',
  COMEDY = 'comedy',
  DRAMA = 'drama',
  HORROR = 'horror',
  SCIFI = 'sci-fi',
  THRILLER = 'thriller',
  ROMANCE = 'romance',
  DOCUMENTARY = 'documentary',
  ANIMATION = 'animation',
}

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 150 })
  director: string;

  @Column({ type: 'enum', enum: Genre })
  genre: Genre;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
