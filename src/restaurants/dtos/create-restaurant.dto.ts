import { Field, InputType, ObjectType, OmitType, PickType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'coverImage', 'address']) {
    @Field(_ => String)
    categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
