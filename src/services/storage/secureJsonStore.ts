import * as SecureStore from "expo-secure-store";

export const secureJsonStore = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  },
  async set<T>(key: string, value: T) {
    await SecureStore.setItemAsync(key, JSON.stringify(value), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
    });
  },
  remove: (key: string) => SecureStore.deleteItemAsync(key)
};
