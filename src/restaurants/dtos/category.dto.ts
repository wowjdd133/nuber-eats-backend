import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../entities/category.entity';
import { PaginationInput, PaginationOutput } from '../../common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';


@InputType()
export class CategoryInput extends PaginationInput {
    @Field(_ => String)
    slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
    @Field(_ => Category, { nullable: true })
    category?: Category;

    @Field(_ => [Restaurant], { nullable: true })
    restaurants?: Restaurant[];
}