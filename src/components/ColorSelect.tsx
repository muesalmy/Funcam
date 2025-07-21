// src/components/ColorSelect.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ColorSelectProps {
  onColorChange: (color: string) => void;
}

const colors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Default', hex: '#f0f0f0' },
];

const ColorSelect: React.FC<ColorSelectProps> = ({ onColorChange }) => {
  return (
    <View style={styles.container}>
      {colors.map((colorItem) => (
        <TouchableOpacity
          key={colorItem.name}
          style={[styles.colorButton, { backgroundColor: colorItem.hex }]}
          onPress={() => onColorChange(colorItem.hex)}
        >
          {/* Renk butonlarının üzerine metin eklemeyebiliriz veya küçük bir simge koyabiliriz. */}
          {/* <Text style={styles.buttonText}>{colorItem.name}</Text> */}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
  },
});

export default ColorSelect;
