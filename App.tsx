    import React, { useState, useEffect } from 'react';
    import {
      SafeAreaView,
      StyleSheet,
      View,
      TouchableOpacity,
      Text,
      Dimensions,
      Platform,
    } from 'react-native';

    // Diğer bileşenleri ve servisleri explicit .tsx uzantısıyla import et
    import CameraBox from './src/components/CameraBox.tsx'; // .tsx eklendi
    import ColorSelect from './src/components/ColorSelect.tsx'; // .tsx eklendi
    import Toast from 'react-native-toast-message';
    import StorageService from './src/services/StorageService.ts'; // .ts eklendi

    // MARK: - ToastService (Servis)
    // Eğer src/services/ToastService.ts dosyasından import ediliyorsa, buradaki tanımına gerek yok.
    // Ancak önceki hatalar nedeniyle bu tanımı burada tutuyorum,
    // eğer ToastService.ts dosyası doğru import edilirse bu kısım kaldırılabilir.
    class ToastService {
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

    // MARK: - App Bileşeni
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    export default function App() {
      const [appBackgroundColor, setAppBackgroundColor] = useState<string>('#f0f0f0');
      const [showColorPalette, setShowColorPalette] = useState<boolean>(false);

      useEffect(() => {
        const loadColor = async () => {
          try {
            const storedColor = await StorageService.getColor();
            if (storedColor) {
              setAppBackgroundColor(storedColor);
            }
          } catch (error) {
            console.error("Renk yüklenirken hata oluştu:", error);
          }
        };
        loadColor();
      }, []);

      const handleColorChange = async (color: string) => {
        setAppBackgroundColor(color);
        try {
          await StorageService.saveColor(color);
        } catch (error) {
          console.error("Renk kaydedilirken hata oluştu:", error);
        }
      };

      return (
        <SafeAreaView style={[styles.container, { backgroundColor: appBackgroundColor }]}>
          {/* Kamera kutusu */}
          <View style={styles.cameraBoxWrapper}>
            <CameraBox />
          </View>

          {/* Renk paleti menüsü için düğme */}
          <TouchableOpacity
            style={styles.toggleColorPaletteButton}
            onPress={() => setShowColorPalette(!showColorPalette)}
          >
            <Text style={styles.toggleButtonText}>
              {showColorPalette ? 'Arka plan Rengi' : 'Arka plan rengi'}
            </Text>
          </TouchableOpacity>

          {/* Renk paleti, sadece showColorPalette true ise gösterilir */}
          {showColorPalette && (
            <View style={styles.colorSelectContainer}>
              <ColorSelect onColorChange={handleColorChange} />
            </View>
          )}

          <Toast />
        </SafeAreaView>
      );
    }

    // MARK: - Stiller (App.tsx için özel)
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
      },
      cameraBoxWrapper: {
        flex: 1,
        marginTop: 50,
        marginBottom: 20,
        marginHorizontal: 20,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: 'black',
        width: screenWidth - 40,
      },
      toggleColorPaletteButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: 20,
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 3,
      },
      toggleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      colorSelectContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: screenWidth * 0.7,
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        zIndex: 2,
      },
    });
    