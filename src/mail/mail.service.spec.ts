import { MailService } from "./mail.service"
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constants';

jest.mock('got', () => {

});

jest.mock('form-data', () => {
    return {
        append: jest.fn(),
    }
});

describe("MailService", () => {
    let service: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule(({
            providers: [MailService, {
                provide: CONFIG_OPTIONS,
                useValue: {
                    apiKey : "test-apiKey",
                    doMain: "test-domain",
                    fromEmail: "test-fromEamil",
                }
            }]
        })).compile();

        service = module.get<MailService>(MailService);
    });

    it('should bo defined', () => {
        expect(service).toBeDefined();
    });

    describe("sendEmail", () => {
        it("should call sendEmail", () => {
            const sendVerificationEmailArgs = {
                email: 'email',
                code: 'code'
            }
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
            })

            service.sendVerificationEmail(sendVerificationEmailArgs.email, sendVerificationEmailArgs.code);
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith("Verify Your Email", "test", [{
                key: 'code', value:sendVerificationEmailArgs.code
            }, { key: 'email', value:sendVerificationEmailArgs.email 
            }]);
        });
    })

    it.todo('sendVerficationEmail');
})