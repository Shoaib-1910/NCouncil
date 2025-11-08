import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Alert, Image } from 'react-native';

export default function Fyp() {

  const handlePress = () => {
    Alert.alert('Heheheheheh')
  };
const[phone, setPhone] = useState(0);
const[password, setPassword]= useState('');
  const Validate = () =>{
    if(phone.trim()&&password.trim())
    {
      Alert.alert('You have entered things')
    }
    else
    {
      Alert.alert('Enter All things')
    }
  }

    return (
    <View style={styles.container}>
      <ImageBackground source={require('./background.png') } style={styles.background}>
      <View style={styles.logoContainer}>
          <View style={styles.logo}>
            {/* Icon placeholder */}
            <Image source={require('./icons8-cross-50.png')} style={styles.image}></Image>
          </View>
        </View>
        <View>
        <Text style={styles.title}>Sign In</Text>
        </View>
        <TextInput style={styles.input} placeholder="Phone No" keyboardType="phone-pad" onChangeText={setPhone} placeholderTextColor="#000" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} placeholderTextColor="#000"/>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={Validate}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.signUpText}>
            Don’t have an account? <Text style={styles.signUpLink} onPress={handlePress}>Sign Up!</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          {/* Footer content */}
        </View>
        </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    resizeMode: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  image : {
    height : 150,
    width : 150
  },

  logo: {
    width: 150,
    height: 150,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color : 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginLeft: '45%',
    color: '#A0A0A0',
    marginBottom: 20,
  },
  signInButton: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#A0A0A0',
  },
  signUpLink: {
    color: '#F0C38E',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '10%',
  },
});
