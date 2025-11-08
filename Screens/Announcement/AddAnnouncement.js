import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import WavyBackground2 from '../../Background/WavyBackground2';
import { Button } from 'react-native-paper';
import baseURL from '../Api';

export default function AddAnnouncement({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const { councilId, memberID } = route.params;
  const [title, setTitle]= useState('');
  const [desc,  setDesc] = useState('');
  const [loading, setLoading] = useState(false)

  async function CreateCouncil() {
    if (!title || !desc) {
        Alert.alert('Please add a Title and Description.');
        return;
    }
    
    const post = {
        title: title,
        Description: desc,
    };
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
        const response = await fetch(`${baseURL}announcement/PostAnnouncement?memberId=${memberID}&councilId=${councilId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post), 
        });

        const json = await response.json();
          
        if (response.ok) {
            console.log(JSON.stringify(json));
            Alert.alert('Announcement added successfully!', '', 
              [{ text: 'OK', onPress: () => navigation.navigate('Announcement', { memberID: memberID, councilId: councilId })}]);
        } else {
            Alert.alert('Failed to create post.'+response.status);
            console.log('Failed to create post.'+response.status)
        }
    } catch (error) {
        Alert.alert('An error occurred while creating the post.');
    }
    setLoading(false)
}


  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>Add Announcement</Text>
        <View style={styles.logoContainer}>
        <View style={styles.logo}>
            <Image source={require('../../assets/announcement2.png')} style={styles.image}></Image>
          </View>
        </View>
        <TextInput style={styles.input} placeholder="Title " keyboardType="default" onChangeText={setTitle} placeholderTextColor="#000" />
        <TextInput style={styles.description} placeholder="Description" multiline={true}
        numberOfLines={5} 
        selectionColor={'#f5d8a0'}
        textAlignVertical="top" 
        keyboardType="default"onChangeText={setDesc} placeholderTextColor="#000" />
        <TouchableOpacity style={styles.signInButton} onPress={CreateCouncil}>
          {loading?(
            <ActivityIndicator size={'small'} color={'black'} />
          ):(
            <Text style={styles.signInButtonText}>Create</Text>
          ) }
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  image : {
    height : 100,
    width : 100
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    bottom : 70,
    color: 'black',
    margin: 10,
    fontSize: 30,
    textAlign: 'center',
  },
  memberIdText: {
    color: 'black',
    marginBottom: 20,
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  description: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    height: 150,
    paddingBottom : 20,
    textAlignVertical: 'top',
    },
  signInButton: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});

