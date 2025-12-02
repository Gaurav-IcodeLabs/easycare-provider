import {z} from 'zod';

const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 10;

export const getProductFormSchema = (t: any) => {
  return z.object({
    title: z
      .string()
      .min(1, t('CreateProductForm.titleRequired'))
      .max(TITLE_MAX_LENGTH, t('CreateProductForm.maxLength')),
    description: z
      .string()
      .min(DESCRIPTION_MIN_LENGTH, t('CreateProductForm.descriptionRequired')),
    price: z
      .union([z.string({message: t('ErrorMessage.validNumber')}), z.number()])
      .transform(value => Number(value))
      .refine(value => !isNaN(value) && value > 0, {
        message: t('CreateProductForm.priceRequired'),
      }),
    stock: z
      .union([z.string(), z.number()])
      .transform(value => Number(value))
      .refine(value => !isNaN(value) && value > 0, {
        message: t('CreateProductForm.stockRequired'),
      }),
    images: z
      .array(
        z.object({
          id: z.union([
            z.object({
              _sdkType: z.string().nonempty(),
              uuid: z.string().nonempty(),
            }),
            z.string(),
          ]),
          url: z.string(),
          localUri: z.string().optional(),
          isUploading: z.boolean().optional(),
        }),
      )
      .min(1, t('CreateProductForm.imagesRequired'))
      .refine(images => images.some(img => !img.isUploading && img.url), {
        message: t('CreateProductForm.waitForUpload'),
      }),
  });
};

export const getDefaultProductValues = () => {
  return {
    title: '',
    description: '',
    price: '',
    stock: '',
    images: [],
  };
};
