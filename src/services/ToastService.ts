// src/services/ToastService.ts
import Toast from 'react-native-toast-message';

export default class ToastService {
  static show(type: 'success' | 'error' | 'info', text1: string, text2?: string): void {
    Toast.show({
      type,
      text1,
      text2,
      position: 'bottom',
      visibilityTime: 2500,
      autoHide: true,
      bottomOffset: 80,
    });
  }
}
