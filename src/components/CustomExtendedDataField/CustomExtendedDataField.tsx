import {StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {FieldConfig} from '../../apptypes';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
} from '../../utils';
import CustomFieldEnum from './components/CustomFieldEnum';
import CustomFieldMultiEnum from './components/CustomFieldMultiEnum';
import {CustomFieldText} from './components';
import CustomFieldLong from './components/CustomFieldLong';

// export const CustomExtendedDataField: FC = () => {
//   return (
//     <View>
//       <Text>CustomExtendedDataField</Text>
//     </View>
//   );
// };

export const CustomExtendedDataField = ({
  fieldConfig,
  ...rest
}: {
  fieldConfig: FieldConfig;
}) => {
  const {schemaType, enumOptions = []} = fieldConfig || {};
  console.log('schemaType', schemaType);
  switch (schemaType) {
    case SCHEMA_TYPE_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldEnum fieldConfig={fieldConfig} {...rest} />
      ) : null;
    case SCHEMA_TYPE_MULTI_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldMultiEnum fieldConfig={fieldConfig} {...rest} />
      ) : null;
    case SCHEMA_TYPE_TEXT:
      //   const disableField = !useWatch({
      //     control: rest.control,
      //     name: `pub_${ConfigFieldInputKey.BUSINESS_IS_DELIVERY_SERVICE_REQUIRED}`,
      //     exact: true,
      //   });
      //   if (
      //     fieldConfig.key == ConfigFieldInputKey.BUSINESS_DELIVERY_INSTRUCTIONS &&
      //     disableField
      //   ) {
      //     return null;
      //   }
      return <CustomFieldText fieldConfig={fieldConfig} {...rest} />;
    case SCHEMA_TYPE_LONG:
      //   const disableFields = !useWatch({
      //     control: rest.control,
      //     name: `pub_${ConfigFieldInputKey.IS_HOME_SERVICE_AVAILABLE}`,
      //     exact: true,
      //   });
      //   if (fieldConfig.key == 'home_service_fee' && disableFields) {
      //     return null;
      //   }
      return <CustomFieldLong fieldConfig={fieldConfig} {...rest} />;
    default:
      return <Text>Unknown schema type</Text>;
  }
};
