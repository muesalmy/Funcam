// src/components/ZoomControl.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';

const { width: screenWidth } = Dimensions.get('window');

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoomChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>Yakınlaştırma: {Math.round(zoom * 100)}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={zoom}
        onValueChange={onZoomChange}
        minimumTrackTintColor="#007bff"
        maximumTrackTintColor="#aaa"
        thumbTintColor="#007bff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  labelText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  slider: {
    width: screenWidth * 0.8,
    height: 40,
  },
});

export default ZoomControl;
