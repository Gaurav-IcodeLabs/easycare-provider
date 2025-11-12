import {createContext, useContext} from 'react';
export const ColorsContext = createContext({});
export const ColorsProvider = ColorsContext.Provider;

export const useColors = () => {
  return useContext(ColorsContext);
};
