import React, { useEffect, useState } from 'react';
import {SafeAreaView, View, ActivityIndicator, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import WavyBackground from '../Background/WavyBackground';
import { ProgressBar, MD3Colors } from 'react-native-paper';

export default function LoadingScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions() // screen width
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userDataString = await AsyncStorage.getItem('userData'); 
      
        if (userToken !== null && userDataString !== null) {
          const userData = JSON.parse(userDataString); // Parse userData from string
          
         
          if (userData && userData.memberId) {
            navigation.replace('HomeScreen', { memberID: userData.memberId }); // Navigate to home
          } else {
            navigation.replace('Login'); 
          }
        } else {
          navigation.replace('Login'); 
        }
      } catch (error) {
        console.error('Error fetching user token or data:', error);
        navigation.replace('Login'); 
      }
    };
  
    checkLoginStatus();
  }, [navigation]);
  
  return (
    <SafeAreaView style={styles.container}>
    <WavyBackground />
     <View style = {styles.textContainer} >
    <Text style={styles.header}>
       Neighborhood
      </Text>
      <Text  style={styles.header}>
       Council
      </Text>
      {/* <Text  style={styles.tagline}>
       Join Hands, Solve Together, Thrive as One Community.
      </Text> */}
      </View> 
    <ActivityIndicator style={{marginBottom :200}}size={'default'} color={'#000'}/>

    <View style={styles.footerContainer}>

    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header : {
   fontSize : 43,
   color : '#493D18',
   justifyContent : 'center',
   alignItems : 'center',
  textShadowRadius : 20
  },

  tagline: {
    fontSize : 30,
    color : 'black',
    justifyContent : 'space-evenly',
    alignItems : 'center',
    marginTop : 90,
    marginLeft : 10,
    marginRight : 10, 
    textAlign : 'center',
  },
  textContainer : {
    flex : 1,
    alignItems : 'center',
   position : 'relative',
   justifyContent : 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
    zIndex : -1
  },
});
