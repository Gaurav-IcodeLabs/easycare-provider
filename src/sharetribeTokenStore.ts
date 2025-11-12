import localStore from '@react-native-async-storage/async-storage';

interface TokenData {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

const generateKey = (clientId: string, namespace: string) =>
  `${namespace}-${clientId}-token`;

const sharetribeTokenStore = ({clientId}: {clientId: string}) => {
  const namespace = 'st';
  const key = generateKey(clientId, namespace);

  const getToken = async () =>
    JSON.parse((await localStore.getItem(key)) as string);

  const setToken = async (tokenData: TokenData) =>
    localStore.setItem(key, JSON.stringify(tokenData));

  const getCookieToken = async () => {
    const token = await getToken();
    return `${key}=${JSON.stringify(token)}`;
  };

  const removeToken = async () => localStore.removeItem(key);

  return {
    getToken,
    setToken,
    removeToken,
    getCookieToken,
  };
};

export default sharetribeTokenStore;
