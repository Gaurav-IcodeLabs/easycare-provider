import {TFunction} from 'i18next';
import {z} from 'zod';

type TranslationTS = TFunction<'translation', undefined>;

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  // fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  agreeToTerms: boolean;
}

export const formSchemaSignup = (t: TranslationTS) =>
  z.object({
    firstName: z.string().min(2, {
      message: t('Signup.fullNameIsRequired'),
    }),
    lastName: z.string().min(2, {
      message: t('Signup.fullNameIsRequired'),
    }),
    // fullName: z.string().min(2, {
    //   message: t('Signup.fullNameIsRequired'),
    // }),
    email: z.string().email({
      message: t('Signup.emailIsRequired'),
    }),
    phoneNumber: z.string().min(1, {
      message: t('Signup.phoneNumberIsRequired'),
    }),
    password: z.string().min(8, {
      message: t('Signup.passwordIsRequired'),
    }),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('Signup.agreeToTermsIsRequired'),
    }),
  });
