
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from '../../common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
    @Field(_ => [Restaurant], {nullable: true})
    results?: Restaurant[];
}
