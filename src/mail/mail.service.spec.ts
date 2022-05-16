import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from '../common/common.constants';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEamil',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should bo defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'test',
        [
          {
            key: 'code',
            value: sendVerificationEmailArgs.code,
          },
          { key: 'email', value: sendVerificationEmailArgs.email },
        ],
      );
    });

    it('send email', async () => {
      const ok = await service.sendEmail('', '', []);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages/`,
        expect.any(Object),
      );
      expect(ok).toBeTruthy();
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', []);
      expect(ok).toBeFalsy();
    });
  });

  it.todo('sendVerficationEmail');
});
