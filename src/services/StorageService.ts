// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastService from './ToastService';

const STORAGE_KEY = '@bg_color';
export default class StorageService {
  static async saveColor(color: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, color);
      console.log('Renk başarıyla kaydedildi:', color);
      ToastService.show('success', `Arka plan rengi '${color}' olarak ayarlandı.`);
    } catch (error) {
      console.error('Rengi kaydederken bir hata oluştu:', error);
      ToastService.show('error', 'Renk kaydedilemedi.');
      throw error;
    }
  }

  static async getColor(): Promise<string | null> {
    try {
      const color = await AsyncStorage.getItem(STORAGE_KEY);
      if (color) {
        console.log('Kaydedilen renk yüklendi:', color);
      } else {
        console.log('Kayıtlı bir renk bulunamadı.');
      }
      return color;
    } catch (error) {
      console.error('Rengi alırken bir hata oluştu:', error);
      ToastService.show('error', 'Kaydedilen renk alınamadı.');
      return null;
    }
  }
}
