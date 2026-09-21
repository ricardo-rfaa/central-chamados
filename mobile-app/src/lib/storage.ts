import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// expo-secure-store não tem implementação web (é decisão de design da
// equipe do Expo — armazenar "secure" em localStorage seria enganoso,
// já que não é criptografado). No nativo (iOS/Android) usa o
// Keychain/Keystore real; na web, cai para localStorage. Ver:
// https://docs.expo.dev/versions/latest/sdk/securestore/
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
}
