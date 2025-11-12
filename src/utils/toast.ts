import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastParams {
  type: ToastType;
  title: string;
  message?: string;
}

export const useToast = () => {
  const {top} = useSafeAreaInsets();

  const showToast = ({type, title, message}: ShowToastParams) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      topOffset: top,
    });
  };

  return {showToast};
};
