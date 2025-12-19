import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import {Control, Controller, FieldValues, Path} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from '../../sharetribeSetup';
import {requestImageUpload} from '../../slices/editlisting.slice';
import {useConfiguration} from '../../context';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage';
import {uploadImageIcon} from '../../assets';

interface ListingImage {
  id: {
    _sdkType: string;
    uuid: string;
  };
  url: string;
  localUri?: string; // Local URI for preview
  isUploading?: boolean; // Upload status
}

interface MultiImagePickFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  maxImages?: number;
  labelKey?: string;
}

export const MultiImagePickField = <T extends FieldValues>({
  control,
  name,
  maxImages = 3,
  labelKey,
}: MultiImagePickFieldProps<T>) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration() as any;

  const pickImages = async (
    currentImages: ListingImage[],
    onChange: (images: ListingImage[]) => void,
  ) => {
    try {
      const remainingSlots = maxImages - currentImages.length;
      if (remainingSlots <= 0) {
        return;
      }

      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: remainingSlots,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel || !result.assets) {
        return;
      }

      // Add local images immediately with uploading status
      const localImages: ListingImage[] = result.assets.map(asset => ({
        id: {
          _sdkType: 'UUID',
          uuid: `temp_${Date.now()}_${Math.random()}`,
        },
        url: '', // Will be filled after upload
        localUri: asset.uri || '',
        isUploading: true,
      }));

      // Update form with local images immediately
      const updatedImages = [...currentImages, ...localImages];
      onChange(updatedImages);

      // Upload images in background and update them one by one
      uploadImagesInBackground(result.assets, updatedImages, onChange);
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const uploadImagesInBackground = async (
    assets: Asset[],
    currentImages: ListingImage[],
    onChange: (images: ListingImage[]) => void,
  ) => {
    const startIndex = currentImages.length - assets.length;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const imageIndex = startIndex + i;

      try {
        const uploadedImage = await uploadImage(asset);

        if (uploadedImage) {
          // Replace the local image with uploaded image
          const newImages = [...currentImages];
          newImages[imageIndex] = {
            ...uploadedImage,
            isUploading: false,
          };
          onChange(newImages);
          // Update currentImages reference for next iteration
          currentImages = newImages;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Remove failed upload
        const newImages = currentImages.filter((_, idx) => idx !== imageIndex);
        onChange(newImages);
        currentImages = newImages;
      }
    }
  };

  const uploadImage = async (asset: Asset): Promise<ListingImage | null> => {
    try {
      if (!asset.uri) return null;

      // Create FormData for image upload
      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      };

      const response = await dispatch(
        requestImageUpload({
          listingImageConfig: config.layout.listingImage,
          file,
        }),
      ).unwrap();

      const uploadedImage = response.data.data;
      return {
        id: uploadedImage.id,
        url: uploadedImage.attributes.variants.default.url,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const removeImage = (
    index: number,
    currentImages: ListingImage[],
    onChange: (images: ListingImage[]) => void,
  ) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({field: {onChange, value}, fieldState: {error}}) => {
        const images = (value as ListingImage[]) || [];
        const hasUploadingImages = images.some(img => img.isUploading);

        return (
          <View style={styles.container}>
            {labelKey && <AppText style={styles.label}>{t(labelKey)}</AppText>}

            <Pressable
              onPress={() => pickImages(images, onChange)}
              style={[
                styles.uploadSection,
                images.length >= maxImages && styles.uploadSectionDisabled,
              ]}
              disabled={images.length >= maxImages || hasUploadingImages}>
              <Image source={uploadImageIcon} style={styles.imageIcon} />
              <AppText style={styles.uploadText}>
                {t('MultiImagePickField.uploadText')}
              </AppText>
              <AppText style={styles.supportText}>
                {t('MultiImagePickField.supportText')}
              </AppText>
            </Pressable>

            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesContainer}>
                {images.map((image, index) => {
                  const imageUri = image.isUploading
                    ? image.localUri
                    : image.url;

                  return (
                    <View key={image.id.uuid} style={styles.imageWrapper}>
                      <Image source={{uri: imageUri}} style={styles.image} />

                      {image.isUploading && (
                        <View style={styles.uploadingOverlay}>
                          <ActivityIndicator
                            size="small"
                            color={colors.deepBlue}
                          />
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          image.isUploading && styles.removeButtonDisabled,
                        ]}
                        onPress={() => removeImage(index, images, onChange)}
                        disabled={image.isUploading}>
                        <AppText style={styles.removeButtonText}>×</AppText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {error && <ErrorMessage error={error.message} />}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    gap: scale(12),
  },
  label: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('400'),
  },
  uploadSection: {
    minHeight: scale(120),
    borderWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'dashed',
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(20),
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  uploadSectionDisabled: {
    borderColor: colors.grey,
    opacity: 0.5,
  },
  uploadText: {
    fontSize: scale(14),
    color: colors.blue,
    ...primaryFont('500'),
  },
  supportText: {
    fontSize: scale(12),
    color: colors.grey,
    ...primaryFont('400'),
  },
  imagesContainer: {
    gap: scale(12),
    paddingVertical: scale(8),
  },
  imageWrapper: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(12),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.lightGrey,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
  },
  removeButton: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeButtonText: {
    fontSize: scale(18),
    color: colors.white,
    ...primaryFont('600'),
    lineHeight: scale(20),
  },
  uploadingText: {
    fontSize: scale(10),
    color: colors.deepBlue,
    ...primaryFont('500'),
  },
  imageIcon: {
    height: scale(45),
    width: scale(45),
    objectFit: 'contain',
  },
});
