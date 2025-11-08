import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';

export default function SelectCategory ({route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
  const { preference } = route.params
  const [category, setCategory] = useState('')
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={[styles.header, {top: 100} ]}>Select Category!</Text>
      <Text>{preference}</Text>
      <View style={styles.radioButton} >
            <TouchableOpacity onPress={() => setCategory('Construction')}>
                <Text style={{color: 'black',textAlign : 'center', fontWeight: '550'}}>{category === 'Construction' ? '●' : '○'}  Construction   </Text>
            </TouchableOpacity>
          <TouchableOpacity onPress={() => setCategory('Sanitation')} style={{ marginLeft: 20 }}>
            <Text style={{color: 'black', textAlign : 'center', fontWeight: '550'}}>{category === 'Sanitation' ? '●' : '○'}  Sanitation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCategory('House Conflict')} style={{ marginLeft: 20 }}>
            <Text style={{color: 'black', textAlign : 'center', fontWeight: '550'}}>{category === 'House Conflict' ? '●' : '○'}  House Conflict</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setCategory('Neighboring Matters')}} style={{ marginLeft: 20 }}>
            <Text style={{color: 'black', textAlign : 'center', fontWeight: '550'}}>{category === 'Neighboring Matters' ? '●' : '○'}  Neighboring Matters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCategory('Other')} style={{ marginLeft: 20 }}>
            <Text style={{color: 'black', textAlign : 'center', fontWeight: '550'}}>{category === 'Other' ? '●' : '○'}  Other</Text>
            </TouchableOpacity>        
            </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  radioButton:{
    top: 100,
    marginBottom: 0, 
    justifyContent:'center', 
    flexDirection: 'column',
    alignItems : 'flex-start',
    textAlign: 'left',
    marginVertical: 20 
},

  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
    zIndex: -1
  },
});
