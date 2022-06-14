import { Field, InputType, ObjectType, Int } from "@nestjs/graphql";
import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { IsString, Length } from "class-validator";
import { Restaurant } from './restaurant.entity';

@InputType('DishOptionInputType', { isAbstract: true})
@ObjectType()
class DishOption {
    @Field(_ => String)
    name: string;

    @Field(_ => [String], {nullable: true})
    choices?: string[];

    @Field(_ => Int)
    extra: number;
}

@InputType('DishInputType', { isAbstract: true})
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
    @Field(_ => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(_ => Int)
    @Column()
    @IsString()
    price: number;

    @Field(_ => String, {nullable: true})
    @Column({nullable: true})
    @IsString()
    photo: string;

    @Field(_ => String)
    @Column()
    @Length(5, 140)
    description: string;

    @Field((_) => Restaurant, { nullable: true })
    @ManyToOne((_) => Restaurant, (_) => _.menu,  {onDelete: 'CASCADE'})
    restaurant: Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number;

    @Field(_ => [DishOption], {nullable: true})
    @Column({type:"json", nullable: true})
    options?: DishOption[]
}