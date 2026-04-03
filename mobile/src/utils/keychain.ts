import * as Keychain from 'react-native-keychain';

export const SecureStore = {
  async saveToken(key: string, value: string) {
    await Keychain.setGenericPassword(key, value, { service: key });
  },
  async getToken(key: string) {
    const result = await Keychain.getGenericPassword({ service: key });
    if (result) {
      return result.password;
    }
    return null;
  },
  async deleteToken(key: string) {
    await Keychain.resetGenericPassword({ service: key });
  }
};
