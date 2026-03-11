import React from 'react';
import {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
export const BottomSheetBackDropComponent = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.5}
  />
);
