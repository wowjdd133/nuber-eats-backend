
import { Field, InputType, Int, PickType, ObjectType } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateDishInput extends PickType(Dish, ['options', 'name', 'description', 'price']){
    @Field(_ => Int)
    restaurantId: number
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}