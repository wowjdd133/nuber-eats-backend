import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(_ => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService
    ){}

    @Query(_ => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Query(_ => UserProfileOutput)
    @UseGuards(AuthGuard)
    async userProfile(@Args() {userId}: UserProfileInput):Promise<UserProfileOutput> {
        return this.usersService.findById(userId);
    }

    @Mutation(_ => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput
    ):Promise<CreateAccountOutput> {
        return this.usersService.createAccount(createAccountInput);
    }

    @Mutation(_ => LoginOutput)
    async login(@Args("input") LoginInput: LoginInput):Promise<LoginOutput>{
        return this.usersService.login(LoginInput);
    }

    @Mutation(_ => EditProfileOutput)
    @UseGuards(AuthGuard)
    async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput):Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(_ => VerifyEmailOutput)
    verifyEmail(@Args('input') {code}:VerifyEmailInput):Promise<VerifyEmailOutput>{
       return this.usersService.verifyEmail(code);
    } 
}