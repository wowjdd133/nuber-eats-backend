import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { AllCategoreisOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly category: CategoryRepository,
  ) {}

  async createRestaurant(
    owner:User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.category.getOrCreate(createRestaurantInput.categoryName);
      newRestaurant.category = category;
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

  async deleteRestaurant(owner: User, {restaurantId}:DeleteRestaurantInput):Promise<DeleteRestaurantOutput> {
    try {
      const {ok, error} = await this.checkOwnerAndGetRestaurant(restaurantId, owner.id)

      if(!ok) {
        return {
          ok,
          error
        }
      }

      await this.restaurants.delete(restaurantId);

      return {
        ok: true
      }
    } catch (err) {
      return {
        ok: false,
        error: "실패"
      }
    }
  }

  async editRestaurant(owner:User, editRestaurantInput:EditRestaurantInput):Promise<EditRestaurantOutput> {

    try {
      const {ok, error} = await this.checkOwnerAndGetRestaurant(editRestaurantInput.restaurantId, owner.id)

      if(!ok) {
        return {
          ok,
          error
        }
      }

      let category:Category = null;

      if(editRestaurantInput.categoryName) {
        category  = await this.category.getOrCreate(editRestaurantInput.categoryName);
      }

      await this.restaurants.save([{
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && {category})
      }]);
  
      return {
        ok: true
      }
    } catch (err) {
      return {
        ok: false,
        error: "Could not edit restaurant"
      }
    }
  }

  async findCategoryBySlug({slug, page}:CategoryInput):Promise<CategoryOutput> {
    try {
      const category = await this.category.findOne({
        slug
      });

      if(!category) {
        return {
          ok: false,
          error: "category not found"
        }
      }

      const restaurants = await this.restaurants.find({
        where: {
          category
        },
        take:25,
        skip:(page - 1) * 25
      });

      category.restaurant = restaurants;
      const totalResults = await this.countRestaurant(category);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25)
      }
    } catch {
      return {
        ok: false,
        error: "slug로 category 찾을 수 없음"
      }
    }
  }

  async countRestaurant(category:Category):Promise<number> {
    return this.restaurants.count({category});
  }

  async allCategories(): Promise<AllCategoreisOutput> {
    try {
      const categories = await this.category.find();

      return {
        ok:true,
        categories
      }
    } catch (err) {
      return {
        ok: false,
        error: '카테고리 못 얻어옴'
      }
    }
  }

  private checkOwnerAndGetRestaurant = async (restaurantId: number, ownerId: number) => {
    const restaurant = await this.restaurants.findOne(restaurantId);

    if(!restaurant) {
      return {
        ok: false,
        error: "restaurant not found"
      }
    }

    if(ownerId !== restaurant.ownerId) {
      return {
        ok: false,
        error: "you can't edit a restaurant that you don't own"
      }
    }

    return {
      ok: true,
      restaurant: restaurant
    }
  }
}
