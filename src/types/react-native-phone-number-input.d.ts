import 'react-native-phone-number-input';
import {ComponentType} from 'react';
import {TextInputProps} from 'react-native';

declare module 'react-native-phone-number-input' {
  export interface PhoneInputProps {
    TextInputComponent?: ComponentType<TextInputProps>;
  }
}
