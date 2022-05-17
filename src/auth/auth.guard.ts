import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { AllowedRoles } from './role.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());

    console.log(roles);

    if(!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user:User = gqlContext['user'];
    console.log(user);

    if (!user) {
      return false;
    }

    if(roles.includes("Any")) {
      return true;
    }

    return roles.includes(user.role);
  }
}
