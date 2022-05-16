import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
  ) {}

  async createRestaurant(
    owner:User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      console.log({owner});
      const categoryName = createRestaurantInput.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, "-") 
      let category = await this.category.findOne({slug:categorySlug});
      if(!category) {
        category = await this.category.save(this.category.create({
          slug: categorySlug,
          name: categoryName
        }))
      }
      newRestaurant.category = category;
      console.log({data:newRestaurant.owner});
      await this.restaurants.save(newRestaurant);
      
      return {
        ok: true
      }
    } catch (err) {
      return {
        ok: false,
        error:"Could not create restaurant"
      }
    }
    
  }

}
