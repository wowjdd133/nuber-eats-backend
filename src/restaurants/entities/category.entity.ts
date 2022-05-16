import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType("CategoryInputType",{ isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column({unique:true})
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => String, {nullable: true})
  @Column({nullable: true})
  @IsString()
  coverImage: string;

  @Field((_) => String)
  @Column({unique: true})
  @IsString()
  slug: string;

  @Field((_) => [Restaurant])
  @OneToMany((_) => Restaurant, (_) => _.category)
  restaurant: Restaurant[];
}
