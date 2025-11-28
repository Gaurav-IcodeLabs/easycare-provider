import React from 'react';
import {getLabel} from '../helper';
import {TextInputField} from '../../TextInputField/TextInputField';
import {CustomFieldProps} from '../../../apptypes';

export const CustomFieldText: React.FC<CustomFieldProps> = ({
  fieldConfig,
  control,
  name,
  t,
  multiline = false,
}) => {
  const placeholder =
    fieldConfig?.saveConfig?.placeholderMessage ||
    t(`placeholder.${fieldConfig?.key}`);

  console.log('placeholder', placeholder);

  return (
    <TextInputField
      control={control}
      name={name}
      labelKey={getLabel(fieldConfig)}
      placeholder={placeholder}
      multiline={multiline}
    />
  );
};
