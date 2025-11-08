import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const WavyBackground = () => {
  const { width } = Dimensions.get('window');
  const svgHeight = 240; // Match the height from your SVG viewBox

  return (
    <View style={styles.backgroundContainer}>
      <Svg
        width={width}
        height={svgHeight}
        viewBox={`0 0 ${width} 240`} // Adjust viewBox to the screen width
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={styles.svg}
      >
        <Path
          d={`M0 0H${width}V205.768C${width} 205.768 ${width - 38} 143.877 ${width - 97.5} 205.768C${width - 157} 267.66 ${width / 2} 205.768 ${width / 2} 205.768C${width / 2} 205.768 ${width / 2 - 116.5} 120.567 ${width / 2 + 19.25} 205.768C${width / 2 + 78} 290.969 ${width / 2 - 52} 188.085 ${width / 2 - 97.5} 205.768C${width / 2 - 143} 223.452 0 205.768 0 205.768V0Z`}
          fill="url(#paint0_linear_2005_2)"
        />
        <Defs>
          <LinearGradient
            id="paint0_linear_2005_2"
            x1={width / 2}
            y1="0"
            x2={width / 2}
            y2="240"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#C2A776" />
            <Stop offset="0.46333" stopColor="#D3B989" />
            <Stop offset="1" stopColor="#EBCA86" />
          </LinearGradient>
        </Defs>
      </Svg>  
    </View>
  );
};
const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    //zIndex: -1, // Ensures this view is in the background
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
});

export default WavyBackground;


