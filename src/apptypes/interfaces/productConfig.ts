import {EstimatedDuration, LocalizedText} from './serviceConfig';

export interface ProductSubSubCategory {
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
  deleted?: boolean;
  _id: string;
}
export interface ProductSubcategory {
  id: string;
  name: LocalizedText;
  slug: string;
  icon: string;
  subSubcategories: ProductSubSubCategory[];
  deleted?: boolean;
  _id: string;
}

export interface ProductCategory {
  id: string;
  name: LocalizedText;
  slug: string;
  icon: string;
  description: LocalizedText;
  defaultLocation: string;
  subcategories: ProductSubcategory[];
  deleted?: boolean;
  _id: string;
}

export interface ProductConfigData {
  _id: string;
  version: string;
  categories: ProductCategory[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductsConfigResponse {
  data: ProductConfigData;
}
