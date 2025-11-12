import React from 'react';
import {AspectRatio, Image} from './common';
import {ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Control} from 'react-hook-form';
import {ImageVariants} from './types';

//
//Actual Component Props
//

interface GenericComponentProps {
  title: Title;
  description: Description;
  callToAction: CallToAction;
  appearance: Appearance;
  blocks: Block[];
}
export interface SectionContainerProps
  extends Pick<GenericComponentProps, 'appearance'> {
  children: React.ReactNode;
}

export interface SectionHeroProps
  extends Omit<GenericComponentProps, 'blocks'> {
  sectionName: string;
  sectionType: string;
}

export interface SectionFeaturesProps extends Omit<GenericComponentProps, ''> {}

export interface SectionColumnsProps extends Omit<GenericComponentProps, ''> {}

export interface SectionArticleProps extends Omit<GenericComponentProps, ''> {}

export interface SectionCarouselProps extends Omit<GenericComponentProps, ''> {}

export interface CustomFieldProps {
  fieldConfig?: FieldConfig;
  control?: any;
  name?: string;
  t?: (_: string | undefined) => string;
}

export interface BlockBuilderProps {
  blocks: Block[];
  isCarousel?: boolean;
  textColor: string;
}

export interface HeadingProps {
  fieldType?: string;
  content?: any;
  color?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export interface ParagraphProps {
  content?: any;
  color?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}
export interface CmsCTAProps extends Omit<HeadingProps, ''> {
  href: string;
}

//
// Generic interfaces
//

export interface Appearance {
  backgroundColor: string;
  backgroundImageOverlay: {
    preset: string;
    color: string;
    opacity: number;
  };
  backgroundImage: Image;
  fieldType: string;
  textColor: string;
}

export interface CallToAction {
  content: string;
  fieldType: string;
  href: string;
}

export interface Description {
  content: string;
  fieldType: string;
}

export interface Title {
  content: string;
  fieldType: string;
}

export interface Block {
  textColor: string;
  blockType: string;
  blockId: string;
  text: Title;
  title: Title;
  callToAction: CallToAction;
  media: Media;
  isCarousel?: boolean;
}

export interface Media {
  fieldType: string;
  aspectRatio: string;
  alt: string;
  image: Image;
  youtubeVideoId: string;
}

export interface FieldConfig {
  key: string;
  name: string;
  maximum: number;
  minimum: number;
  label: string;
  saveConfig: {
    displayInSignUp: boolean;
    isRequired: boolean;
    label: string;
    placeholderMessage: string;
    requiredMessage: string;
  };
  schemaType: string;
  scope: string;
  showConfig: {
    isDetail: boolean;
    displayInProfile: boolean;
    label: string;
    unselectedOptions: boolean;
  };
  userTypeConfig: {
    limitToUserTypeIds: boolean;
  };
  enumOptions: EnumOption[];
  categoryConfig: {
    limitToCategoryIds: boolean;
  };
  filterConfig: {
    group: string;
    indexForSearch: boolean;
    label: string;
  };
  step: number;
}
export interface EnumOption {
  label: string;
  option: string;
}

export interface AppImageProps {
  source: any;
  height?: number;
  width: number;
  loaderColor?: string;
  style?: ImageStyle;
  onError?: () => void;
  onLoading?: () => void;
  showLoading?: boolean;
  aspectRatio?: AspectRatio;
}
export interface YoutubeIframeProps {
  aspectRatio?: AspectRatio;
  youtubeVideoId: string;
  width?: number;
}

export interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  loaderColor?: string;
  loaderSize?: number;
}

export interface ErrorMessageProps {
  invalidExistingListingType: boolean;
  noListingTypesSet: boolean;
  marketplaceName: string;
}

export interface MapboxLocationAutoCompleteProps {
  control: any;
  t: (_: string) => string;
  name: string;
  setValue: any;
}
export interface OverLayProps {
  color: string;
  opacity: number;
}
export interface RadioButtonProps {
  isActive: boolean;
  onPress: () => void;
  size: number;
}

export interface CategoryFieldProps {
  currentCategoryOptions: string;
  level: number;
  values: any[];
  prefix: string;
  handleCategoryChange: any;
  control: Control;
  t: (_: string) => string;
}

export interface FieldSelectCategoryProps {
  prefix: string;
  listingCategories: any;
  control: Control;
  watch: any;
  allCategoriesChosen: any;
  setValue: any;
  setAllCategoriesChosen: any;
  t: (_: string) => string;
}
