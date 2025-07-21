// src/components/GalleryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import ToastService from '../services/ToastService.ts';
import * as ImagePicker from 'expo-image-picker';

interface GalleryButtonProps {
  onPress?: () => void;
}

const GalleryButton: React.FC<GalleryButtonProps> = ({ onPress }) => {
  const openImagePickerGallery = async () => {
    try {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Galeri İzni Gerekli',
          'Fotoğraf seçmek için galeriye erişim iznine ihtiyacımız var. Lütfen uygulama ayarlarından bu izni etkinleştirin.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
          ]
        );
        ToastService.show('error', 'Galeriye erişim izni verilmedi.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        // Düzeltme: 'Images' yerine 'images' kullanıldı (küçük harf)
        mediaTypes: 'images', // 'images', 'videos', 'all' stringlerinden birini kullan
        allowsEditing: false,
        quality: 1,
        selectionLimit: 1,
      });

      if (!result.canceled) {
        ToastService.show('success', 'Fotoğraf başarıyla seçildi.', 'Galeri seçiciye erişildi.');
        console.log('Seçilen fotoğraf URI:', result.assets[0].uri);
      } else {
        ToastService.show('info', 'Galeri seçici açıldı ancak fotoğraf seçilmedi.');
      }
    } catch (error: any) {
      console.error('ImagePicker ile galeri açılırken hata:', error);
      ToastService.show('error', 'Galeri seçici açılamadı.', 'Bir hata oluştu: ' + error.message);

      Alert.alert(
        'Galeri Açılamadı',
        'Cihazınızın galeri seçicisi açılamadı. Fotoğraflarınız cihazınızın galerisine kaydediliyor olmalı. Lütfen manuel olarak kontrol edin.',
        [{ text: 'Tamam' }]
      );
    }
    onPress && onPress();
  };

  return (
    <TouchableOpacity style={styles.button} onPress={openImagePickerGallery}>
      <Text style={styles.buttonText}>Galeri</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GalleryButton;
