import {z} from 'zod';
import {TFunction} from 'i18next';

const TITLE_MAX_LENGTH = 60;

export const getServiceFormSchema = (t: TFunction) => {
  return z.object({
    categoryId: z.string().min(1, t('CreateServiceForm.categoryRequired')),
    subcategoryId: z
      .string()
      .min(1, t('CreateServiceForm.subcategoryRequired')),
    title: z
      .string()
      .min(1, t('CreateServiceForm.titleRequired'))
      .max(TITLE_MAX_LENGTH, t('CreateServiceForm.maxLength')),
    description: z.string().min(10, t('CreateServiceForm.descriptionRequired')),
    price: z
      .string()
      .transform(value => Number(value))
      .refine(value => !isNaN(value) && value > 0, {
        message: t('CreateServiceForm.priceRequired'),
      }),
    duration: z
      .string()
      .transform(value => Number(value))
      .refine(value => !isNaN(value) && value > 0, {
        message: t('CreateServiceForm.durationRequired'),
      }),
    locationType: z.string().optional(),
    images: z.array(z.any()).optional(),
    customAttributes: z.record(z.any()).optional(),
  });
};

export const getDefaultServiceValues = () => {
  return {
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    price: '',
    duration: '',
    locationType: '',
    images: [],
    customAttributes: {},
  };
};
