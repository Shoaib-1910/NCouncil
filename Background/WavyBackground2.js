import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const WavyBackground2 = () => {
  const { width } = Dimensions.get('window');
  const svgHeight = 180; // Reduced height to 180

  return (
    <View style={styles.backgroundContainer}>
      <Svg
        width={width}
        height={svgHeight}
        viewBox={`0 0 ${width} 180`} // Adjust viewBox to match the height
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={styles.svg}
      >
        <Path
          d={`
            M0 0 
            H${width} 
            V140 
            C${width} 140 ${width - 60} 180 ${width / 2} 180 
            C60 180 0 140 0 140 
            V0Z
          `}
          fill="url(#paint0_linear_2005_2)"
        />
        <Defs>
          <LinearGradient
            id="paint0_linear_2005_2"
            x1={width / 2}
            y1="0"
            x2={width / 2}
            y2="180" // Adjust gradient for the new height
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
    height: 180, // Match the height of the SVG
    borderBottomLeftRadius: 40, // Equal rounded corners for both sides
    borderBottomRightRadius: 40,
    overflow: 'hidden', // Ensure rounded corners are clipped
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
});

export default WavyBackground2;
