import {TFunction} from 'i18next';
import {z} from 'zod';

type TranslationTS = TFunction<'translation', undefined>;

export interface LoginFormValues {
  phoneNumber: string;
  password: string;
}

export interface PhoneLoginFormValues {
  phoneNumber: string;
}

export const formSchemaLogin = (t: TranslationTS) =>
  z.object({
    // email: z.string().email({
    //   message: t('Login.emailIsRequired'),
    // }),
    phoneNumber: z.string().min(1, {
      message: t('Signup.phoneNumberIsRequired'),
    }),
    password: z.string().min(8, {
      message: t('Login.passwordIsRequired'),
    }),
  });

export const formSchemaPhoneLogin = (t: TranslationTS) =>
  z.object({
    phoneNumber: z.string().min(10, {
      message: t('Login.phoneNumberIsRequired'),
    }),
  });
