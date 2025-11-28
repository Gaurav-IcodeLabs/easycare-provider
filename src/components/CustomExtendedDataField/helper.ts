import {FieldConfig} from '../../apptypes';

export const getLabel = (fieldConfig: FieldConfig | undefined) =>
  fieldConfig?.saveConfig?.label || fieldConfig?.label;
