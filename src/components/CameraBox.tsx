// src/components/CameraBox.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ScrollView, Dimensions } from 'react-native';
// FlashMode ve AutoFocus importları kaldırıldı
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions } from 'expo-camera'; 
import * as MediaLibrary from 'expo-media-library'; // MediaLibrary'yi import et
import ToastService from '../services/ToastService';
import MediaService from '../services/MediaService';

// Yeni import'lar
import ZoomControl from './ZoomControl'; // Sadece ZoomControl kaldı
import GalleryButton from './GalleryButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraBox() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  // MediaLibrary.usePermissions kullanıldı
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions(); 
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [availablePictureSizes, setAvailablePictureSizes] = useState<string[]>([]);
  const [selectedPictureSize, setSelectedPictureSize] = useState<string | undefined>(undefined);

  // Kamera özellikleri state'leri (Flaş ve Odak kaldırıldı)
  const [zoom, setZoom] = useState<number>(0);
  // focusPoint state'i kaldırıldı
  // const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined); 

  useEffect(() => {
    (async () => {
      const cameraPerm = await requestCameraPermission();
      const mediaPerm = await requestMediaLibraryPermission();

      if (!cameraPerm.granted) {
        Alert.alert('Kamera İzni Gerekli', 'Uygulamanın çalışması için kamera izni gereklidir.');
      }
      if (!mediaPerm.granted) {
        Alert.alert('Medya Kütüphanesi İzni Gerekli', 'Fotoğrafları kaydetmek için medya kütüphanesi izni gereklidir.');
      }
    })();
  }, []);

  const onCameraReady = useCallback(async () => {
    setIsCameraReady(true);
    console.log('Kamera hazır ve kullanıma uygun!');
    if (cameraRef.current) {
      try {
        const allSizes = await cameraRef.current.getAvailablePictureSizesAsync();
        console.log('Tüm Kullanılabilir Çözünürlükler:', allSizes);

        const desiredResolutions = [
          '3840x2160', // 4K UHD
          '2560x1440', // QHD
          '1920x1440', // Yüksek 4:3
          '2560x1080', // Ultra-wide (21:9)
          '1920x1080', // Full HD
          '1280x960',  // 4:3
          '1280x720',  // HD
          '800x600',   // SVGA
          '640x480',   // VGA
          '352x288',   // CIF
          '320x240',   // QVGA
        ];

        // İstenen çözünürlükleri alanlarına göre büyükten küçüğe sırala
        desiredResolutions.sort((a, b) => {
            const [aw, ah] = a.split('x').map(Number);
            const [bw, bh] = b.split('x').map(Number);
            return (bw * bh) - (aw * ah);
        }).reverse(); // Ters çevirerek en büyükten en küçüğe sırala

        const filteredSizes = desiredResolutions.filter(size => allSizes.includes(size));
        
        let sizesToDisplay = filteredSizes;
        // Eğer filtrelenmiş liste çok kısaysa (örn. 5'ten az) ve tüm mevcut boyutlar daha fazlaysa,
        // desteklenen tüm boyutlardan en yüksek olanları ekleyerek listeyi tamamla
        if (filteredSizes.length < 5 && allSizes.length > filteredSizes.length) {
            const sortedAllSizes = [...allSizes].sort((a, b) => {
                const [aw, ah] = a.split('x').map(Number);
                const [bw, bh] = b.split('x').map(Number);
                return (bw * bh) - (aw * ah);
            });
            
            for (const size of sortedAllSizes) {
                if (!sizesToDisplay.includes(size) && sizesToDisplay.length < 8) { // Maksimum 8 seçenekle sınırla
                    sizesToDisplay.push(size);
                }
            }
            // Tutarlı bir sıralama sağlamak için tekrar sırala (büyükten küçüğe)
            sizesToDisplay.sort((a, b) => {
                const [aw, ah] = a.split('x').map(Number);
                const [bw, bh] = b.split('x').map(Number);
                return (bw * bh) - (aw * ah);
            });
        } else if (filteredSizes.length > 8) { // Eğer filtrelenmiş çok fazlaysa, ilk 8'i al
            sizesToDisplay = filteredSizes.slice(0, 8);
        }
        
        // Son sıralama (en büyükten en küçüğe)
        sizesToDisplay.sort((a, b) => {
            const [aw, ah] = a.split('x').map(Number);
            const [bw, bh] = b.split('x').map(Number);
            return (bw * bh) - (aw * ah);
        }).reverse();


        setAvailablePictureSizes(sizesToDisplay);
        console.log('Gösterilecek Filtrelenmiş Çözünürlükler:', sizesToDisplay);

        if (!selectedPictureSize || !sizesToDisplay.includes(selectedPictureSize)) {
          let newDefaultSize = sizesToDisplay[0]; // Varsayılan olarak mevcut en büyük

          // Gösterilecek listeden tercih edilen yüksek çözünürlüğü bulmaya çalış
          for (const pSize of desiredResolutions) {
            if (sizesToDisplay.includes(pSize)) {
              newDefaultSize = pSize;
              break;
            }
          }
          setSelectedPictureSize(newDefaultSize);
          console.log('Varsayılan çözünürlük ayarlandı:', newDefaultSize);
        }
      } catch (error) {
        console.error('Çözünürlükler alınırken hata oluştu:', error);
        ToastService.show('error', 'Çözünürlükler alınamadı.');
      }
    }
  }, [selectedPictureSize]);

  if (!cameraPermission || !mediaLibraryPermission) {
    return <View style={styles.container}><Text style={styles.message}>İzinler yükleniyor...</Text></View>;
  }

  if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Kamerayı göstermek ve fotoğraf kaydetmek için izninize ihtiyacımız var.
        </Text>
        {!cameraPermission.granted && (
          <Button onPress={requestCameraPermission} title="Kamera İzni Ver" />
        )}
        {!mediaLibraryPermission.granted && (
          <Button onPress={requestMediaLibraryPermission} title="Medya Kütüphanesi İzni Ver" />
        )}
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    setSelectedPictureSize(undefined);
    setIsCameraReady(false);
    setZoom(0);
    // setFlashMode(FlashMode.off); // Flaş kaldırıldı
    // setAutoFocus(AutoFocus.on); // Odak kaldırıldı
    // setFocusPoint(undefined); // Odak kaldırıldığı için bu da kaldırıldı
  }

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const options: CameraPictureOptions = {
          quality: 0.9, // Fotoğraf kalitesi
          base64: false,
          exif: false,
          skipProcessing: true, // Görüntü işlemeyi atla (emülatörde siyah fotoğraf sorununa karşı)
        };
        const photo = await cameraRef.current.takePictureAsync(options);
        
        console.log('Çekilen fotoğraf objesi detayları:', JSON.stringify(photo, null, 2)); 

        if (photo && photo.uri) {
          if (!photo.uri.startsWith('file://') && !photo.uri.startsWith('content://')) {
              console.error('Geçersiz URI formatı:', photo.uri);
              ToastService.show('error', 'Fotoğraf URI\'si geçersiz.');
              return;
          }

          await MediaService.savePhoto(photo.uri);
          ToastService.show('success', 'Fotoğraf galeriye kaydedildi!');
        } else {
          ToastService.show('error', 'Fotoğraf çekilemedi veya geçerli bir URI alınamadı.');
        }
      } catch (error) {
        console.error('Fotoğraf çekme veya kaydetme hatası:', error);
        ToastService.show('error', `Fotoğraf kaydedilemedi. Hata: ${(error as Error).message}`);
      }
    } else {
      ToastService.show('error', 'Kamera henüz hazır değil veya izinler verilmedi.');
    }
  };

  // handleCameraPressForFocus fonksiyonu ve GestureResponderEvent importu kaldırıldı

  return (
    <View style={styles.container}>
      {/* TouchableOpacity kaldırıldı, CameraView doğrudan render ediliyor */}
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={onCameraReady}
        pictureSize={selectedPictureSize}
        zoom={zoom}
        // flash={flashMode} // Flaş kaldırıldı
        // autofocus={autoFocus} // Odak kaldırıldı
      />

      {/* Kamera üst kontrolleri (Sadece Zoom kaldı) */}
      <View style={styles.controlsOverlay}>
          <ZoomControl
            zoom={zoom}
            onZoomChange={setZoom}
          />
      </View>

      {/* Kamera alt kontrolleri (Çözünürlük, Çevir, Çek, Galeri) */}
      <View style={styles.bottomControlContainer}>
        {isCameraReady && availablePictureSizes.length > 0 && (
          <View style={styles.resolutionControlContainer}>
            <Text style={styles.resolutionText}>Çözünürlük: {selectedPictureSize || 'Yok'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resolutionScrollView}>
              {availablePictureSizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.resolutionButton,
                    selectedPictureSize === size && styles.selectedResolutionButton
                  ]}
                  onPress={() => setSelectedPictureSize(size)}
                >
                  <Text style={styles.resolutionButtonText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.mainButtonsRow}>
          <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Çevir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.buttonText}>Çek</Text>
          </TouchableOpacity>
          <GalleryButton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  // cameraTouchable kaldırıldı
  camera: {
    flex: 1,
    width: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  bottomControlContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    zIndex: 1,
  },
  mainButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sideButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resolutionControlContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  resolutionText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  resolutionScrollView: {
    maxHeight: 40,
  },
  resolutionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedResolutionButton: {
    backgroundColor: 'lightblue',
  },
  resolutionButtonText: {
    color: 'white',
    fontSize: 11,
  },
});
