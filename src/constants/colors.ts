import {Colors} from '../apptypes';
export interface AppColors extends Record<Colors, string> {}
export const colors: AppColors = {
  marketplaceColor: '',
  marketplaceColorLight: '',
  marketplaceColorDark: '',
  colorPrimaryButton: '',
  colorPrimaryButtonLight: '',
  colorPrimaryButtonDark: '',
  transparent: 'transparent',
  deepBlue: '#0E397E',
  blue: '#00C2FF',
  moonStoneBlue: '#899DC9',
  textBlack: '#231F20',
  appleGreen: '#86C129',
  milkWhite: '#F4F8FF',
  white: '#FFFFFF',
  black: '#000000',
  borderGray: '#E0E5ED',
  lightblack: '#1E1E1E',
  neutralDark: '#414854',
  red: '#FF0000',
  lightGrey: '#E9ECEF',
  placeholder: '#B0B0B0',
  grey: '#6C7278',
  focusBlue: '#5BC1EE',
};

export const mergeColors = (appColors: Partial<AppColors>) => ({
  ...colors,
  marketplaceColor: appColors.marketplaceColor,
  marketplaceColorLight: appColors.marketplaceColorLight,
  marketplaceColorDark: appColors.marketplaceColorDark,
  colorPrimaryButton: appColors.colorPrimaryButton,
  colorPrimaryButtonLight: appColors.colorPrimaryButtonLight,
  colorPrimaryButtonDark: appColors.colorPrimaryButtonDark,
});
