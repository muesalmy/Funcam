import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraBox from './src/components/CameraBox';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraBox />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
