// src/services/MediaService.ts
import * as MediaLibrary from 'expo-media-library';
import ToastService from './ToastService';

export default class MediaService {
  static async savePhoto(uri: string): Promise<void> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        ToastService.show('error', 'Fotoğrafı kaydetmek için medya kütüphanesi izni gerekli.');
        console.error('Medya kütüphanesi izni verilmedi.');
        throw new Error('Medya kütüphanesi izni verilmedi.');
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      console.log('Fotoğraf başarıyla galeriye kaydedildi:', uri);
    } catch (error) {
      console.error('Fotoğrafı kaydederken bir hata oluştu:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Bilinmeyen hata.';
      ToastService.show('error', `Fotoğraf kaydedilemedi: ${errorMessage}`);
      throw error;
    }
  }
}
