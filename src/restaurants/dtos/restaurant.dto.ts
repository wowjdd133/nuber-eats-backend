
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class RestaurantInput {
    @Field(_ => Int)
    restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
    @Field(_ => Restaurant, {nullable: true})
    restaurant?: Restaurant
}