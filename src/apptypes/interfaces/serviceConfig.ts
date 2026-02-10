export interface LocalizedText {
  en: string;
  ar: string;
}

export interface EstimatedDuration {
  value: number;
  unit: string;
}

export interface SubSubCategory {
  estimatedDuration: EstimatedDuration;
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  slug: string;
  icon: string;
  locationTypes: string[];
  pricingModel: string;
  basePrice: number;
  currency: string;
  priceUnit: string;
  attributes: Record<string, any>;
  listingImages?: string[];
  deleted?: boolean;
  _id: string;
}
export interface Subcategory {
  id: string;
  name: LocalizedText;
  slug: string;
  icon: string;
  subSubcategories: SubSubCategory[];
  deleted?: boolean;
  _id: string;
}

export interface Category {
  id: string;
  name: LocalizedText;
  slug: string;
  icon: string;
  description: LocalizedText;
  defaultLocation: string;
  subcategories: Subcategory[];
  deleted?: boolean;
  _id: string;
}

export interface ServicesConfigData {
  _id: string;
  version: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ServicesConfigResponse {
  data: ServicesConfigData;
}
