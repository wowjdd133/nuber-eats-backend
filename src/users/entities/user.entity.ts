import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '../../common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OneToMany } from 'typeorm';

export enum UserRole {
  Client = "Client",
  Owner = "Owner",
  Delivery = "Delivery",
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType("UserInputType",{ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((_) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((_) => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((_) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((_) => Boolean)
  verified: boolean;

  @Field((_) => [Restaurant])
  @OneToMany((_) => Restaurant, (_) => _.owner)
  restaurant: Restaurant[];  

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (err) {
        console.log(err);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
