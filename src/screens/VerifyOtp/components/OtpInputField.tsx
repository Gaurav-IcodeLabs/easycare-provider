import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../../constants';
import {scale} from '../../../utils';

interface OtpInputFieldProps {
  length?: number;
  onOtpComplete?: (otp: string) => void;
  onOtpChange?: (otp: string) => void;
  value?: string;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus?: boolean;
  placeholder?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface OtpInputProps {
  digit: string;
  index: number;
  focusedIndex: Animated.SharedValue<number>;
  onChangeText: (text: string, idx: number) => void;
  onKeyPress: (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number,
  ) => void;
  onFocus: (idx: number) => boolean;
  onBlur: () => void;
  inputRef: (
    ref: React.ComponentRef<typeof AnimatedTextInput> | null,
    idx: number,
  ) => void;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus: boolean;
  placeholder: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  digit,
  index,
  focusedIndex,
  onChangeText,
  onKeyPress,
  onFocus,
  onBlur,
  inputRef,
  inputContainerStyle,
  inputStyle,
  autoFocus,
  placeholder,
}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const isFocused = focusedIndex.value === index;

    return {
      borderColor: withTiming(
        isFocused ? colors.deepBlue : colors.lightGrey,
        {duration: 150}, // Reduced duration for faster response
      ),
      transform: [
        {
          scale: withTiming(isFocused ? 1.1 : 1, {duration: 100}), // Reduced duration
        },
      ],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const isFocused = focusedIndex.value === index;

    return {
      color: withTiming(isFocused ? colors.black : colors.deepBlue, {
        duration: 150, // Reduced duration for faster response
      }),
    };
  });

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        inputContainerStyle,
        containerAnimatedStyle,
      ]}>
      <AnimatedTextInput
        ref={ref => inputRef(ref, index)}
        style={[styles.input, inputStyle, textAnimatedStyle]}
        keyboardType="number-pad"
        maxLength={1}
        value={digit}
        placeholder={placeholder}
        onChangeText={(text: string) => onChangeText(text, index)}
        onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
          onKeyPress(e, index)
        }
        onFocus={() => onFocus(index)}
        onBlur={onBlur}
        editable={true}
        autoFocus={autoFocus && index === 0}
        selectionColor={colors.deepBlue}
        cursorColor={colors.deepBlue}
      />
    </Animated.View>
  );
};

const OtpInputField: React.FC<OtpInputFieldProps> = ({
  length = 6,
  onOtpComplete,
  onOtpChange,
  value = '',
  containerStyle,
  inputContainerStyle,
  inputStyle,
  autoFocus = true,
  placeholder = '',
}) => {
  const [internalOtp, setInternalOtp] = useState<string[]>(
    Array(length).fill(''),
  );
  const inputRefs = useRef<
    (React.ComponentRef<typeof AnimatedTextInput> | null)[]
  >([]);
  const focusedIndex = useSharedValue<number>(-1);
  const isBackspacing = useRef<boolean>(false);

  const currentOtp = value
    ? value.split('').concat(Array(Math.max(0, length - value.length)).fill(''))
    : internalOtp;

  const updateOtp = useCallback(
    (newOtp: string[]) => {
      if (!value) {
        setInternalOtp(newOtp);
      }

      const otpString = newOtp.join('');
      onOtpChange?.(otpString);

      if (otpString.length === length && !otpString.includes('')) {
        onOtpComplete?.(otpString);
      }
    },
    [value, length, onOtpComplete, onOtpChange],
  );

  const handleChangeText = useCallback(
    (text: string, idx: number) => {
      const digit = text.replace(/[^0-9]/g, '');

      if (!digit) {
        const updatedOtp = [...currentOtp];
        updatedOtp[idx] = '';
        updateOtp(updatedOtp);

        // Only move to previous if this is a backspace action and not already handled in keyPress
        if (idx > 0 && !text && !isBackspacing.current) {
          requestAnimationFrame(() => {
            inputRefs.current[idx - 1]?.focus();
          });
        }

        // Reset backspace flag after handling
        if (isBackspacing.current) {
          isBackspacing.current = false;
        }
        return;
      }

      const updatedOtp = [...currentOtp];
      updatedOtp[idx] = digit;
      updateOtp(updatedOtp);

      // Move to next input with slight delay to prevent skipping
      if (idx < length - 1) {
        setTimeout(() => {
          inputRefs.current[idx + 1]?.focus();
        }, 10);
      } else {
        setTimeout(() => {
          inputRefs.current[idx]?.blur();
        }, 10);
      }
    },
    [currentOtp, length, updateOtp],
  );

  const handleKeyPress = useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>, idx: number) => {
      const {key} = event.nativeEvent;

      if (key === 'Backspace') {
        isBackspacing.current = true;

        // If current box has value, clear it and stay on current box
        if (currentOtp[idx]) {
          const updatedOtp = [...currentOtp];
          updatedOtp[idx] = '';
          updateOtp(updatedOtp);
          // Don't move focus, stay on current input
          return;
        }

        // If current box is empty and not the first box, move to previous
        if (!currentOtp[idx] && idx > 0) {
          requestAnimationFrame(() => {
            inputRefs.current[idx - 1]?.focus();
            // Clear the previous box value as well
            const updatedOtp = [...currentOtp];
            updatedOtp[idx - 1] = '';
            updateOtp(updatedOtp);
          });
        }
      }
    },
    [currentOtp, updateOtp],
  );

  const handleFocus = useCallback(
    (idx: number): boolean => {
      if (idx === 0 || currentOtp.slice(0, idx).every(val => val !== '')) {
        focusedIndex.value = idx; // Remove withTiming for immediate focus update
        return true;
      }

      const firstEmptyIndex = currentOtp.findIndex(val => val === '');
      if (firstEmptyIndex !== -1) {
        // Use requestAnimationFrame to ensure smooth focus transition
        requestAnimationFrame(() => {
          inputRefs.current[firstEmptyIndex]?.focus();
        });
      } else {
        focusedIndex.value = idx; // Remove withTiming for immediate focus update
      }
      return false;
    },
    [currentOtp, focusedIndex],
  );

  const handleBlur = useCallback(() => {
    focusedIndex.value = -1; // Remove withTiming for immediate blur update
  }, [focusedIndex]);

  const handleInputRef = useCallback(
    (ref: React.ComponentRef<typeof AnimatedTextInput> | null, idx: number) => {
      inputRefs.current[idx] = ref;
    },
    [],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {currentOtp.map((digit, idx) => (
        <OtpInput
          key={idx}
          digit={digit}
          index={idx}
          focusedIndex={focusedIndex}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputRef={handleInputRef}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
          autoFocus={autoFocus}
          placeholder={placeholder}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: scale(60),
    height: scale(60),
    marginHorizontal: scale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
  },
  input: {
    fontSize: scale(24),
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    color: colors.black,
  },
});

export default OtpInputField;
