import {Dimensions, Platform} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
export const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
// Calculate the scale ratios
const widthScaleRatio = width / guidelineBaseWidth;
const heightScaleRatio = height / guidelineBaseHeight;
// Calculate platform-specific scaling factors
const getPlatformFactor = () => {
  if (Platform.OS === 'web') {
    return 0.12;
  } else if (Platform.OS === 'android') {
    return 1;
  } else if (Platform.OS === 'ios') {
    // You can set a different factor for iOS if needed
    return 0.5;
  } else {
    // Default factor for unknown platforms (e.g., tablets)
    return 0.8;
  }
};
// Scale the provided size based on the device's screen width or height with platform-specific factor
const scaleSize = (size: number, scaleRatio: number) =>
  size + (scaleRatio * size - size) * getPlatformFactor();
// Scale the provided font size based on the device's screen width, height, and pixel density
const fontScale = (size: number) => scaleSize(size, widthScaleRatio);
// Scale the provided width and height based on the device's screen width or height
const scale = (width: number) => scaleSize(width, widthScaleRatio);

const isIphone8 = () => {
  if (Platform.OS === 'ios' && height < guidelineBaseHeight) {
    return true;
  } else {
    return false;
  }
};
const hitSlope = (size: number) => {
  return {left: size, right: size, top: size, bottom: size};
};

const topInset = initialWindowMetrics?.insets.top || 0;
const bottomInset = initialWindowMetrics?.insets.bottom || 0;
// const bottomInset =
//   Platform.OS === 'android'
//     ? (initialWindowMetrics?.insets.bottom || 0) + 10
//     : initialWindowMetrics?.insets.bottom || 0;

/**
 * Lightens a hex color by a given percentage and returns an RGBA string with 0.2 alpha.
 * @param color - Hex color string (e.g. "#B8C0D7")
 * @param percent - Percentage to lighten (e.g. 20 means lighten by 20%)
 * @returns RGBA color string
 */
const lightenColor = (color: string, percent: number): string => {
  const hex = color.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const amt = Math.round(2.55 * percent);
  const clamp = (val: number) => Math.max(0, Math.min(255, val));

  const R = clamp(r + amt);
  const G = clamp(g + amt);
  const B = clamp(b + amt);

  return `rgba(${R}, ${G}, ${B}, 0.2)`;
};

export {
  scale,
  fontScale,
  isIphone8,
  hitSlope,
  topInset,
  bottomInset,
  width as SCREEN_WIDTH,
  lightenColor,
};
