import {z} from 'zod';
import {TFunction} from 'i18next';

export const getAddServiceRequestSchema = (t: TFunction) => {
  return z.object({
    title: z.string().min(3, t('CreateServiceForm.titleRequired')),
    description: z.string().min(10, t('CreateServiceForm.descriptionRequired')),
  });
};

export interface AddServiceFormValues {
  title: string;
  description: string;
}
