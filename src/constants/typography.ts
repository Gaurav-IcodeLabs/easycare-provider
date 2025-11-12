const BOLD = '700';
const SEMIBOLD = '600';
const MEDIUM = '500';
const REGULAR = '400';

/**
 * Font family configuration
 * Primary → Arimo
 * Secondary → Ubuntu
 */
export const fontFamily = {
  primary: {
    regular: 'Arimo-Regular', // 400
    medium: 'Arimo-Medium', // 500
    semiBold: 'Arimo-SemiBold', // 600 (if missing, fallback handled below)
    bold: 'Arimo-Bold', // 700
    // italic: 'Arimo-Italic',
    // boldItalic: 'Arimo-BoldItalic',
    // mediumItalic: 'Arimo-MediumItalic',
    // semiBoldItalic: 'Arimo-SemiBoldItalic',
  },
  secondary: {
    regular: 'Ubuntu-Regular', // 400
    medium: 'Ubuntu-Medium', // 500
    semiBold: 'Ubuntu-Medium', // Ubuntu has no SemiBold — using Medium
    bold: 'Ubuntu-Bold', // 700
    light: 'Ubuntu-Light', // optional
  },
};

/**
 * Returns the Arimo font (primary) with proper weight.
 */
export const primaryFont = (
  fontWeight: '700' | '600' | '500' | '400' | undefined,
) => {
  return {
    fontFamily:
      fontWeight === BOLD
        ? fontFamily.primary.bold
        : fontWeight === SEMIBOLD
        ? fontFamily.primary.semiBold || fontFamily.primary.medium
        : fontWeight === MEDIUM
        ? fontFamily.primary.medium
        : fontFamily.primary.regular,
  };
};

/**
 * Returns the Ubuntu font (secondary) with proper weight.
 */
export const secondaryFont = (
  fontWeight: '700' | '600' | '500' | '400' | undefined,
) => {
  return {
    fontFamily:
      fontWeight === BOLD
        ? fontFamily.secondary.bold
        : fontWeight === SEMIBOLD
        ? fontFamily.secondary.semiBold
        : fontWeight === MEDIUM
        ? fontFamily.secondary.medium
        : fontFamily.secondary.regular,
  };
};
