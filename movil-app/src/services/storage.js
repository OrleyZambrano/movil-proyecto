import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

export const guardarToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const leerToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const borrarToken = () => AsyncStorage.removeItem(TOKEN_KEY);
