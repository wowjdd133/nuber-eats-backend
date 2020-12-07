import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant)
export class RestaurantResolver{

    constructor(private readonly restaurantService: RestaurantService){}
    
    @Query(returns => [Restaurant])
    restaurant():Promise<Restaurant[]> {
        return this.restaurantService.getAll();
    }

    @Mutation(_ => Boolean)
    async createRestaurant(
      @Args('input') createRestaurantDto: CreateRestaurantDto
    ):Promise<boolean> {
        
        try {
            await this.restaurantService.createRestaurant(createRestaurantDto);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    @Mutation(_ => Boolean)
    async updateRestaurant(
        @Args() updateRestaurantDto: UpdateRestaurantDto
    ):Promise<boolean>{
        try{
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
}