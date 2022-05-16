import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';

@InputType("RestaurantInputType",{ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field((_) => String)
  @Column()
  @IsString()
  address: string;

  @Field((_) => Category, { nullable: true })
  @ManyToOne((_) => Category, (_) => _.restaurant,  {nullable: true, onDelete: 'SET NULL'})
  category: Category;

  @Field((_) => User)
  @ManyToOne((_) => User, (_) => _.restaurant, { onDelete: 'CASCADE' })
  owner: User;
}
