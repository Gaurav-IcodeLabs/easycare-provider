import React, {FC, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {AppText} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale} from '../../../utils';
import {useTranslation} from 'react-i18next';

interface Exception {
  date: string;
  reason?: string;
  closed: boolean;
}

interface ExceptionsPickerProps {
  exceptions: Exception[];
  onChange: (exceptions: Exception[]) => void;
}

export const ExceptionsPicker: FC<ExceptionsPickerProps> = ({
  exceptions,
  onChange,
}) => {
  const {t} = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newException, setNewException] = useState<Exception>({
    date: '',
    reason: '',
    closed: true,
  });

  const addException = () => {
    if (newException.date) {
      onChange([...exceptions, newException]);
      setNewException({date: '', reason: '', closed: true});
      setShowAddForm(false);
    }
  };

  const removeException = (index: number) => {
    const newExceptions = exceptions.filter((_, i) => i !== index);
    onChange(newExceptions);
  };

  return (
    <View style={styles.container}>
      {exceptions.map((exception, index) => (
        <View key={index} style={styles.exceptionContainer}>
          <View style={styles.exceptionInfo}>
            <AppText style={styles.exceptionDate}>{exception.date}</AppText>
            {exception.reason && (
              <AppText style={styles.exceptionReason}>
                {exception.reason}
              </AppText>
            )}
            <AppText style={styles.exceptionStatus}>
              {exception.closed
                ? t('CreateBusiness.closed')
                : t('CreateBusiness.specialHours')}
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() => removeException(index)}
            style={styles.removeButton}>
            <AppText style={styles.removeButtonText}>×</AppText>
          </TouchableOpacity>
        </View>
      ))}

      {showAddForm ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder={t('CreateBusiness.datePlaceholder')}
            value={newException.date}
            onChangeText={text =>
              setNewException({...newException, date: text})
            }
            placeholderTextColor={colors.textGray}
          />

          <TextInput
            style={styles.input}
            placeholder={t('CreateBusiness.reasonPlaceholder')}
            value={newException.reason}
            onChangeText={text =>
              setNewException({...newException, reason: text})
            }
            placeholderTextColor={colors.textGray}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              onPress={() => setShowAddForm(false)}
              style={[styles.formButton, styles.cancelButton]}>
              <AppText style={styles.cancelButtonText}>
                {t('CreateBusiness.cancel')}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={addException}
              style={[styles.formButton, styles.saveButton]}>
              <AppText style={styles.saveButtonText}>
                {t('CreateBusiness.save')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAddForm(true)}
          style={styles.addButton}>
          <AppText style={styles.addButtonText}>
            + {t('CreateBusiness.addException')}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scale(8),
  },
  exceptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
    backgroundColor: colors.white,
    padding: scale(12),
    borderRadius: scale(8),
  },
  exceptionInfo: {
    flex: 1,
  },
  exceptionDate: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('600'),
    marginBottom: scale(4),
  },
  exceptionReason: {
    fontSize: fontScale(12),
    color: colors.textGray,
    ...primaryFont('400'),
    marginBottom: scale(4),
  },
  exceptionStatus: {
    fontSize: fontScale(12),
    color: colors.error,
    ...primaryFont('500'),
  },
  removeButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(8),
  },
  removeButtonText: {
    fontSize: fontScale(20),
    color: colors.white,
    ...primaryFont('600'),
  },
  addButton: {
    padding: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: scale(8),
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontScale(14),
    color: colors.primary,
    ...primaryFont('500'),
  },
  addForm: {
    backgroundColor: colors.white,
    padding: scale(16),
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(8),
    padding: scale(12),
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('400'),
    marginBottom: scale(12),
  },
  formButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  formButton: {
    flex: 1,
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontScale(14),
    color: colors.white,
    ...primaryFont('500'),
  },
});
