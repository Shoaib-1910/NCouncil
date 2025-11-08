import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function DividerLine() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1, // Thickness of the line
    width: '90%', // Fills the width of the screen
    backgroundColor: '#000', // Line color
    marginVertical: 10, // Space above and below the line
    alignItems:'center'
  },
});