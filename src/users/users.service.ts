import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "../jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verification: Repository<Verification>,
        // private readonly config: ConfigService,
        private readonly jwtService:JwtService,
        private readonly mailSerfice: MailService,
    ) {}

    async createAccount({email, password, role}: CreateAccountInput):Promise<CreateAccountOutput>{
        try{
            const exists = await this.users.findOne({email});
            if(exists) {   
                return {
                    ok:false, 
                    error: "There is a user with that email already"
                };
            }
            const user = await this.users.save(this.users.create({email, password, role}));
            const verification = await this.verification.save(this.verification.create({
                user,
            }))

            this.mailSerfice.sendVerificationEmail(user.email, verification.code);

            return {
                ok: true,
            }
        }catch(err){
            //make error
            return {
                ok:false, 
                error: "Couldn't create account"
            };
        }
    }

    async login({email, password}: LoginInput):Promise<{ok: boolean, error?: string, token?:string}> {
        try {
            const user = await this.users.findOne({email}, {select:['id','password']});
            if(!user) {
                return {
                    ok: false,
                    error: "User not found"
                };
            }

            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect) {
                return {
                    ok: false,
                    error: "Wrong password",
                }
            }

            const token = this.jwtService.sign(user.id);

            return {
                ok: true,
                token
            }
        }catch (error){
            return {
                ok: false,
                error
            }
        }
    }

    async findById(id: number):Promise<UserProfileOutput> {
        try{
            const user = await this.users.findOne({id});
            if(user){
                return {
                    ok: true,
                    user: user,
                }
            }

            throw new Error("User Not Found");
        }catch(err){
            return {
                ok: false,
                error: err
            }
        }
    }

    async editProfile(userId: number, {email, password}: EditProfileInput):Promise<EditProfileOutput> {
        try{
            const user = await this.users.findOne(userId);

            if(email) {
                user.email = email;
                const verification = await this.verification.save(this.verification.create({user}));
                this.mailSerfice.sendVerificationEmail(user.email, verification.code);
            }
    
            if(password){
                user.password = password;
            }
    
            this.users.save(user);

            return {
                ok: true,
            }
        }catch(err){
            return {
                ok: false,
                error: err
            }
        }
    }

    async verifyEmail(code:string): Promise<VerifyEmailOutput> {
        try{
            const verification = await this.verification.findOne({code}, {
                relations: ['user']
            });
            
            if(verification) {
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.verification.delete(verification.id);
                return {
                    ok: true
                }
            }
    
            throw Error();
        }catch(err){
            return {
                ok: false,
                error: err
            }
        }
       
    }
}