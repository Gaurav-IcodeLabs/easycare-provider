import {z} from 'zod';
import {TFunction} from 'i18next';

export const getAddServiceRequestSchema = (t: TFunction) => {
  return z
    .object({
      categoryId: z.string().min(1, t('CreateServiceForm.categoryRequired')),
      subcategoryId: z.string().optional(),
      subSubcategory: z.string().min(1, t('CreateServiceForm.titleRequired')),
      title: z.string().min(1, t('CreateServiceForm.titleRequired')),
      description: z
        .string()
        .min(10, t('CreateServiceForm.descriptionRequired')),
      suggestedPrice: z.string().min(1, t('CreateServiceForm.priceRequired')),
      isOtherCategory: z.boolean().optional(),
      customCategoryName: z.string().optional(),
      customSubcategoryName: z.string().optional(),
      attributes: z
        .array(
          z.object({
            name: z.string(),
            options: z.array(
              z.object({
                label: z.string(),
                suggestedPrice: z.string(),
              }),
            ),
          }),
        )
        .optional(),
    })
    .refine(
      data => {
        // If not "Other" category, subcategoryId is required
        if (data.categoryId !== 'other' && !data.subcategoryId) {
          return false;
        }
        // If "Other" category, custom names are required
        if (data.categoryId === 'other') {
          return (
            !!data.customCategoryName &&
            data.customCategoryName.length > 0 &&
            !!data.customSubcategoryName &&
            data.customSubcategoryName.length > 0
          );
        }
        return true;
      },
      {
        message: t('CreateServiceForm.subcategoryRequired'),
        path: ['subcategoryId'],
      },
    );
};

export interface AttributeOption {
  label: string;
  suggestedPrice: string;
}

export interface ServiceAttribute {
  name: string;
  options: AttributeOption[];
}

export interface AddServiceFormValues {
  categoryId: string;
  subcategoryId?: string;
  subSubcategory: string;
  title: string;
  description: string;
  suggestedPrice: string;
  isOtherCategory?: boolean;
  customCategoryName?: string;
  customSubcategoryName?: string;
  attributes?: ServiceAttribute[];
}

export const getDefaultAddServiceValues = (): AddServiceFormValues => {
  return {
    categoryId: '',
    subcategoryId: '',
    subSubcategory: '',
    title: '',
    description: '',
    suggestedPrice: '',
    isOtherCategory: false,
    customCategoryName: '',
    customSubcategoryName: '',
    attributes: [],
  };
};
