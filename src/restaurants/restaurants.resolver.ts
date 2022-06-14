import { Args, Mutation, Query, ResolveField, Resolver, Int, Parent } from '@nestjs/graphql';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { EditRestaurantOutput, EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { CoreOutput } from '../common/dtos/output.dto';
import { AllCategoreisOutput } from './dtos/all-categories.dto';
import { CategoryOutput, CategoryInput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantOutput, RestaurantInput } from './dtos/restaurant.dto';
import { SearchRestaurantOutput, SearchRestaurantInput } from './dtos/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishOutput, CreateDishInput } from './dtos/create-dish.dto';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((_) => CreateRestaurantOutput)
  @Role([UserRole.Owner])
  async createRestaurant(
    @AuthUser() authUser:User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
      return this.restaurantService.createRestaurant(
        authUser,
        createRestaurantInput
      ); 
  }

  @Mutation((_) => EditRestaurantOutput)
  @Role([UserRole.Owner])
  async editRestaurant(
    @AuthUser() owner:User,
    @Args('input') input:EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, input);
  }

  @Mutation((_) => DeleteRestaurantOutput)
  @Role([UserRole.Owner])
  deleteRestaurant(
    @AuthUser() owner:User,
    @Args('input') input:DeleteRestaurantInput
  ):Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, input);
  }
}

@Resolver((_) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(_ => Int)
  restaurantCount(@Parent() category:Category):Promise<number> {
    return this.restaurantService.countRestaurant(category);
  }

  @Query(_ => AllCategoreisOutput)
  allCategories():Promise<AllCategoreisOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(_ => SearchRestaurantOutput)
  serachRestaurant(@Args('input') searchRestaurantInput:SearchRestaurantInput):Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }

  @Query(_ => CategoryOutput)
  category(@Args('input') categoryInput:CategoryInput):Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }

  @Query(_ => RestaurantsOutput)
  restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(_ => RestaurantOutput)
  restaurnt(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput>{
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

}

@Resolver(_ => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(_ => CreateDishOutput)
  @Role(['Owner'])
  createDish(@AuthUser() owner: User, @Args('input') createDishInput:CreateDishInput): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }
}