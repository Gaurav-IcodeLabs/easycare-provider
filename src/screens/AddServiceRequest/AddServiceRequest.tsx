import {Alert, StyleSheet, View} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText, Button, ScreenHeader, TextInputField} from '../../components';
import {scale} from '../../utils';
import {useTranslation} from 'react-i18next';
import {backIcon} from '../../assets';
import {colors} from '../../constants';
import {useForm} from 'react-hook-form';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {zodResolver} from '@hookform/resolvers/zod';
import {AddServiceFormValues, getAddServiceRequestSchema} from './helper';
import axios from 'axios';
import {useTypedSelector} from '../../sharetribeSetup';
import {currentUserIdSelector} from '../../slices/user.slice';
import {useNavigation} from '@react-navigation/native';
import {ADMIN_PANEL_URL} from '@env';
// const ADMIN_PANEL_URL = 'http://192.168.68.109:5378';

type AddServiceRequestPayload = {
  title: string;
  description: string;
  userId: string;
};

export const AddServiceRequest: React.FC = () => {
  const navigation = useNavigation();
  const {top, bottom} = useSafeAreaInsets();
  const {t} = useTranslation();
  const [loader, setLoader] = React.useState(false);
  const currentUserId = useTypedSelector(currentUserIdSelector);

  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm<AddServiceFormValues>({
    defaultValues: {
      title: '',
      description: '',
    },
    resolver: zodResolver(getAddServiceRequestSchema(t)),
    mode: 'onChange',
  });

  const onFormSubmit = async (values: any) => {
    if (!currentUserId) {
      console.warn('User ID missing');
      return;
    }

    const payload: AddServiceRequestPayload = {
      ...values,
      userId: currentUserId,
    };

    try {
      setLoader(true);
      const result = await axios.post(
        `${ADMIN_PANEL_URL}/api/service-requests/`,
        payload,
      );
      if (result.data.success) {
        Alert.alert('', result.data.message);
        navigation.goBack();
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        // containerStyle={{marginBottom: scale(22)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>{t('CreateService.heading')}</AppText>
        )}
      />
      <View style={styles.wrapper}>
        <KeyboardAwareScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <TextInputField
            control={control}
            name="title"
            labelKey="AddService.title"
            placeholder="AddService.titlePlaceholder"
          />
          <TextInputField
            control={control}
            name="description"
            labelKey="AddService.description"
            placeholder="AddService.descriptionPlaceholder"
            multiline
            inputContainerStyles={{borderRadius: scale(20)}}
          />
        </KeyboardAwareScrollView>

        <View style={[styles.stickyButtonContainer, {paddingBottom: bottom}]}>
          <Button
            title="AddService.button"
            onPress={handleSubmit(onFormSubmit)}
            disabled={!isValid || loader}
            loader={loader}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  wrapper: {
    flex: 1,
    marginTop: scale(10),
    paddingHorizontal: scale(20),
  },
  heading: {
    fontSize: scale(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(50),
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
  },
});
