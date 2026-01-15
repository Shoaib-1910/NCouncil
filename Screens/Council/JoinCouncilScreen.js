import React, { useEffect, useState } from 'react';
import {Text, TouchableOpacity ,Button, Image, SafeAreaView, StyleSheet, TextInput, useWindowDimensions, View, Alert, ActivityIndicator } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import WavyBackground2 from '../../Background/WavyBackground2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../Api'

export default function JoinCouncil ({route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
  const [councilLink, setCouncilLink] = useState('');
//  const { memberID } = route.params;
  const [memberID, setMemberID] = useState(null);
  const [loading, setLoading] = useState(false)


useEffect(() => {
  const loadMemberID = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setMemberID(userData.memberId);  // This is the ID
      } else {
        console.warn('No user data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading memberID from AsyncStorage', error);
    }
  };

  loadMemberID();
}, []);
  const JoinCouncilUsingJoinCode = async () => {
    if(!councilLink){
      Alert.alert('Please Enter Code to Join Council.')
      return;
    }
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch(`${baseURL}Council/JoinCouncilUsingCode?memberId=${memberID}&joinCode=${councilLink}`, {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('header is',response)
      if (response.ok) {
        const json = await response.json();
        console.log(JSON.stringify(json));
        Alert.alert('Council added successfully!', 'Now you will be redirected to Home.', 
          [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen', { member: memberID })}]);
      } 
      else if( response.status == 403) {
        Alert.alert('No Council Found with this Join Code')
      } 
      else if( response.status == 409) {
        Alert.alert('You are already a part of this council!')
      }
      else{
        Alert.alert('Error', 'Failed to load Data');
      }
    } catch (error) {
        console.error('Error joining council:', error);
        Alert.alert('Error', error.message || 'Something went wrong.');
      }

    setLoading(false)
  };

  const handlePress = async()=>{
    navigation.replace('CreateCouncil',{ Id : memberID})
  }
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      
      <Text style={styles.header}>Let's Get Started by Creating or Joining a Council.</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Create Council</Text>
        </TouchableOpacity>
        <Text style={{color: 'black', textAlign : 'center', fontSize: 18 , margin:8}}>OR  </Text>
      <TextInput style={styles.input} placeholder="Enter Code Here!" onChangeText={setCouncilLink} placeholderTextColor="#0007" />
      <TouchableOpacity style={styles.button} onPress={JoinCouncilUsingJoinCode} disabled={loading}>
          {loading ? (
            <ActivityIndicator size={'small'} color={'#000'}/>
          ):(
            <Text style={styles.buttonText}>Join Existing Council</Text>
          )}  
        </TouchableOpacity>
        <View style={styles.footerContainer}>

      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
    justifyContent: 'center',
    alignItems : 'center',
    
  },
  header:{
    color: 'black', 
    margin: 30, 
    fontSize: 30, 
    textAlign:'center', 
    bottom : 40,
    textTransform : 'capitalize'
  }
  ,
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
    zIndex : -1
  },
  button: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
  },
});
