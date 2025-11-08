import React, { useEffect, useState } from 'react';
import { Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View, TextInput, Share, Alert, ActivityIndicator,  } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import DividerLine from '../../Background/LineDivider';
import baseURL  from '../Api';

export default function InviteMember ( {route} ) {
  const { width } = useWindowDimensions(); // screen width
  const[link, setLink] = useState({});
  const {councilId} = route.params
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getJoinCode = async () => {
      try {
        const response = await fetch(`${baseURL}Council/GetCouncil?councilId=${councilId}`);
        if (response.ok) {
          const json = await response.json();
          console.log('Council Data:', json);
          setLink(json);
        } else {
          Alert.alert('Failed to fetch Join Code');
          console.log('Failed to fetch Join Code');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while loading data');
      }
    };
    getJoinCode();
  }, [councilId]);

  const handlePress = async() => {
    setLoading(true)
    if (link) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const joinCodeMessage = `You’ve been invited to join *${link.Name}*!\n\nUse the code below within the Neighborhood Council App under “Join Council” to get started.\n\n*Join Code*: ${link.JoinCode}`;
      Share.share({
        message: joinCodeMessage,
      }).catch((error) => console.log('Error sharing the link', error));
    } else {
      Alert.alert('Error', 'No join code available to share');
    }
    setLoading(false)
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.titleText}>Invite Residents</Text>
      <Text style={styles.header}>Add Residents by Inviting them Through this link </Text>
    <View style={styles.signInButton1}> 
        <Text style={styles.signInButtonText1}>{link?.JoinCode || 'Loading...'}</Text>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={styles.signInButtonText}>Share Join Code!</Text>
      )}
    </TouchableOpacity>

    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    alignItems:'center',
    justifyContent:'center'
  },
  header:{
    color : 'black', 
    fontSize: 20, 
    marginBottom : 50,
  marginRight: 10,
    marginLeft: 10
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: useWindowDimensions,
    zIndex: -1,
  },
  titleText: {
    bottom : 150,
    color: 'black',
    margin: 10,
    fontSize: 30,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 40,
    color : 'black',
  },
  signInButton: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
  },
  signInButton1: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText1: {
    color: '#000',
  },

});