import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationOutput } from "src/common/dtos/pagination.dto";
import { CoreOutput } from '../../common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { PaginationInput } from '../../common/dtos/pagination.dto';

@InputType()
export class SearchRestaurantInput extends PaginationInput{
    @Field(_ => String)
    query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
    @Field(_ => [Restaurant], {nullable: true})
    restaurants?: Restaurant[]; 
}