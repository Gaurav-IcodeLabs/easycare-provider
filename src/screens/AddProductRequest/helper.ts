import {z} from 'zod';
import {TFunction} from 'i18next';

export const getAddProductRequestSchema = (t: TFunction) => {
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
            name: z.string().min(1, 'Required'),
            options: z.array(
              z.object({
                label: z.string().min(1, 'Required'),
                suggestedPrice: z.string().min(1, 'Required'),
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

export interface ProductAttribute {
  name: string;
  options: AttributeOption[];
}

export interface AddProductFormValues {
  categoryId: string;
  subcategoryId?: string;
  subSubcategory: string;
  title: string;
  description: string;
  suggestedPrice: string;
  isOtherCategory?: boolean;
  customCategoryName?: string;
  customSubcategoryName?: string;
  attributes?: ProductAttribute[];
}

export const getDefaultAddProductValues = (): AddProductFormValues => {
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
