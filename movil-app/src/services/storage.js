import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const guardarSesion = async (token, user) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

export const leerToken = () => AsyncStorage.getItem(TOKEN_KEY);

export const leerUsuario = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const leerSesion = async () => {
  const [[, token], [, rawUser]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  return { token, user: rawUser ? JSON.parse(rawUser) : null };
};

export const borrarSesion = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};
