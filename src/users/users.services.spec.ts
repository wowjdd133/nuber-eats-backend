import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn()
});

const mockJwtService = () => ({
    sign: jest.fn(() => "signed-token-baby"),
    verify: jest.fn()
});

const mockMailService = () => ({
    sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UserService", () => {

    let service: UsersService
    let usersRepostiory: MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;
    let mailService: MailService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [ UsersService, {
                provide: getRepositoryToken(User), 
                useValue: mockRepository()
            },{
                provide: getRepositoryToken(Verification), 
                useValue: mockRepository()
            },{
                provide: JwtService,
                useValue: mockJwtService()
            },{
                provide: MailService,
                useValue: mockMailService()
            }],
        }).compile();

        service = module.get<UsersService>(UsersService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
        usersRepostiory = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification))
        
    });

    it('be defined', () => {
        expect(service).toBeDefined();
    })

    describe("createAccount", () => {
        const createAccountArgs = {
            email: '',
            password: '',
            role: 0
        };
        it("존재하는 유저가 있다면", async () => {
            usersRepostiory.findOne.mockResolvedValue({
                id:1,
                email:"lalala",
            })

            const result = await service.createAccount(createAccountArgs)

            expect(result).toMatchObject({
                ok:false, 
                error: "There is a user with that email already"
            });
        });
        it('should create a new user', async () => {
            usersRepostiory.findOne.mockResolvedValue(undefined);
            usersRepostiory.create.mockReturnValue(createAccountArgs);
            usersRepostiory.save.mockResolvedValue(createAccountArgs);
            verificationRepository.create.mockReturnValue({user:createAccountArgs});
            verificationRepository.save.mockResolvedValue({
                code: 'code'
            });
            const result = await service.createAccount(createAccountArgs);

            expect(usersRepostiory.create).toHaveBeenCalledTimes(1);
            expect(usersRepostiory.create).toHaveBeenCalledWith(createAccountArgs);

            expect(usersRepostiory.save).toHaveBeenCalledTimes(1);
            expect(usersRepostiory.save).toHaveBeenCalledWith(createAccountArgs);

            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: createAccountArgs
            });

            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: createAccountArgs

            });

            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));

            expect(result).toEqual({ok:true})
        });

        it('should fail on exception', async () => {
            usersRepostiory.findOne.mockRejectedValue(new Error("error"));
            const result = await service.createAccount(createAccountArgs);
            expect(result).toEqual({
                ok:false, 
                error: "Couldn't create account"
            });
        })
    })
    describe('login', () => {
        const loginArgs = {
            email: 'yes@email.com',
            password: 'yes.password',
        }
        it('유저 없을 때', async () => {
            usersRepostiory.findOne.mockResolvedValue(null);

            const result = await service.login(loginArgs);

            expect(usersRepostiory.findOne).toHaveBeenCalledTimes(1)
            expect(usersRepostiory.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(result).toEqual({
                ok: false,
                error: "User not found"
            });
        })
        it('비밀번호가 틀렸을 때', async () => {
            const mockedUser = {
                checkPassword: jest.fn(() => Promise.resolve(false))
            }
            
            usersRepostiory.findOne.mockResolvedValue(mockedUser);

            const result = await service.login(loginArgs);

            expect(result).toEqual({
                ok: false,
                error: "Wrong password",
            });
        });
        
        it('패스워드 일치시 토큰 리턴', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
            }
            
            usersRepostiory.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

            expect(result).toEqual({
                ok: true,
                token: 'signed-token-baby'
            })
        });
    })
    describe('findById', () => {
        const findByidArgs = {
            id: 1
        }

      it('유저를 찾으면', async () => {
          usersRepostiory.findOneOrFail.mockResolvedValue(findByidArgs);
          const result = await service.findById(1);
          expect(result).toEqual({
              ok: true,
              user: findByidArgs
          });
      });
      
      it('유저를 찾지 못하면', async () => {
          usersRepostiory.findOneOrFail.mockRejectedValue(new Error());
          const result = await service.findById(1);
          expect(result).toEqual({
            ok: false,
            error: "User Not Found"
        });
      })
    })
    describe('editProfile', () => {
        it('이메일 변경', async () => {
            const oldUser = {
                email:'yes@old.com',
                verified: true
            }
            const editProfileArgs = {
                userId: 1,
                input:{email: "yes@new.com"}
            }
            const newVerification = {
                code: "code"
            }
            const newUser = {
                verified:false,
                email: editProfileArgs.input.email
            }

            usersRepostiory.findOne.mockResolvedValue(oldUser);
            verificationRepository.create.mockReturnValue(newVerification);
            verificationRepository.save.mockResolvedValue(newVerification);

            await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

            expect(usersRepostiory.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepostiory.findOne).toHaveBeenCalledWith(editProfileArgs.userId);

            expect(verificationRepository.create).toHaveBeenCalledWith({user:newUser});
            expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code);

        });

        it('비밀번호 변경', async () => {
            const editProfileArgs = {
                userId: 1,
                input:{password: "new.password"}
            }
            usersRepostiory.findOne.mockResolvedValue({password:'old'})
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

            expect(usersRepostiory.save).toHaveBeenCalledTimes(1);
            expect(usersRepostiory.save).toHaveBeenCalledWith(editProfileArgs.input);

            expect(result).toEqual({
                ok: true
            });
        });

        it('에러 발생', async () => {
            usersRepostiory.findOne.mockRejectedValue(new Error());
            
            const result = await service.editProfile(1, {email: '12'});

            expect(result).toEqual({
                ok: false,
                error: 'Could not update profile.'
            });
        })
    })
    
    describe('verify email', () => {
        it("이메일 인증", async () => {
            const mockedVerification = {
                user: {
                    verified: false,
                },
                id: 1
            }
            verificationRepository.findOne.mockResolvedValue(mockedVerification);

            const result = await service.verifyEmail('code');

            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
            expect(verificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));

            expect(usersRepostiory.save).toHaveBeenCalledTimes(1);
            expect(usersRepostiory.save).toHaveBeenCalledWith({verified: true});

            expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationRepository.delete).toHaveBeenCalledWith(mockedVerification.id);

            expect(result).toEqual({
                ok: true
            });
        });

        it("should fail on verification not found", async () => {
            verificationRepository.findOne.mockResolvedValue(undefined);
            const result = await service.verifyEmail("");
            expect(result).toEqual({ ok: false, error: 'Verification not found.'});
        })
        
        it("should fail on exception", async () => {
            verificationRepository.findOne.mockRejectedValue(new Error());
            const result = await service.verifyEmail("");
            expect(result).toEqual({
                ok: false,
                error: 'Could not verify email'
            });
        })
    })
    
})