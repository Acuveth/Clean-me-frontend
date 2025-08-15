import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStorage = {
  setItemAsync: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getItemAsync: async (key) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (error) {
      return Promise.reject(error);
    }
  },
  deleteItemAsync: async (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export default storage;