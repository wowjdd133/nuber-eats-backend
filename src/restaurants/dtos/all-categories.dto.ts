
import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoreisOutput extends CoreOutput {
    @Field(_ => [Category], { nullable:true })
    categories?: Category[]
}