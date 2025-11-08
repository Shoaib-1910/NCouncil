import React, { useCallback, useEffect, useState } from 'react';
import { Text, Alert, SafeAreaView, TouchableOpacity, View, TextInput, StyleSheet, ImageBackground, Image, Dimensions, useWindowDimensions, KeyboardAvoidingView, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import  baseURL  from '../Api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '../LoadingScreen';
import HomeScreen from '../Home';
import { IconButton } from 'react-native-paper';


export default function Login({}){
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const navigation= useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const { width } = useWindowDimensions();
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
          'Confirm Exit',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true; // prevent default behavior
      });

      // Cleanup using subscription.remove()
      return () => backHandler.remove();
    }, [])
  );


  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(token !== null);
      } catch (error) {
        console.error('Failed to fetch token from storage:', error);
      }
    };

    checkLoginStatus();
  }, []);

  // if (isLoggedIn === null) {
  //   return <LoadingScreen />;
  //  }

  // isLoggedIn ? (
  //   <HomeScreen navigation={navigation} />
  // ) : (
  //   <Login navigation={navigation} />
  // );

  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const handlePress = async () => {
    if (phoneNo.trim() && password.trim()) {
      if (phoneNo.length != 11){
        Alert.alert('Phone Number should be of 11 Characters')
        return;
      }
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await fetch(`${baseURL}Account/Login?phoneNo=${phoneNo}&password=${password}`);
        const json = await response.json();

        console.log('Response status:', response.status);


        if (response.ok) {
          const userData = {
              memberId: json.data.id,                // ID of the member
              phoneNo: json.data.PhoneNo,            // Phone number of the member
              fullName: json.data.Full_Name,         // Full name of the member
              gender: json.data.Gender,              // Gender of the member
              dateOfBirth: json.data.DoB,            // Date of birth of the member
              province: json.data.Province,          // Province where the member resides
              city: json.data.City,                  // City where the member resides
              address: json.data.Address,            // Address of the member
              password: json.data.Password,          // Password of the member
              dateJoined: json.data.Date_joined      // Date when the member joined
          };
          await storeUserData(userData);
          console.log('Stored Id: ' + userData.memberId);
          console.log('user data is',userData)

          await AsyncStorage.setItem('userToken', 'LoggedIn');
          console.log('Token saved');
          console.log(`Welcome to the Portal ${userData.fullName}`)
          navigation.replace('HomeScreen',{ memberID : userData.memberId}) 
          
        } else if(response.status === 401) {
          Alert.alert('Error', 'Incorrect Password');
        }
        else{
          Alert.alert('Error', 'No Member Registered with ' + phoneNo);
        }
      } catch (error) {
        console.error('Error during login:', error);
        Alert.alert('Error', 'Failed to log in. Please try again later.');
      }
    } else {
      Alert.alert('Please Enter your Credentials!');
    }
    setLoading(false)
  };
  return (
    
    <View style={styles.container}>
      <WavyBackground/>
      <View style={styles.logoContainer}>
          <View style={styles.logo}>
            {/* Icon placeholder */}
            <Image source={require('../../assets/UserProfile.png')} style={styles.image}></Image>
          </View>
        </View>
        <View>
        <Text style={styles.title1}>Hello there!</Text>
        <Text style={styles.title}>Sign In to Continue</Text>
        </View>
  
        <TextInput style={styles.input} placeholder="Phone No" keyboardType="phone-pad" onChangeText={setPhoneNo} placeholderTextColor="#000" />
        <View style={styles.container2}>
        <TextInput style={styles.inputPassword} placeholder="Password" secureTextEntry={!showPassword} onChangeText={setPassword} placeholderTextColor="#000"/>
      
        <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)} 
        style={styles.icon}
      >
        <IconButton
          icon={showPassword ? 'eye-off' : 'eye'} 
          color="black"
          onPress={() => setShowPassword(!showPassword)} 
        />
      </TouchableOpacity>
      </View>
        {/* <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity> */}
       <TouchableOpacity style={styles.signInButton} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={styles.signInButtonText}>Sign In</Text>
      )}
    </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.signUpText}>
            Don’t have an account? <Text style={styles.signUpLink} onPress={() => navigation.navigate('SignUp')}>Sign Up!</Text>
          </Text>
        </TouchableOpacity>

    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color : 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  title1: {
    color : 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'KronaOne-Regular',
    color: '#000',
    marginBottom: 5,
  },
  container2: {
    width: '100%',
    alignItems: 'center',
    position: 'relative', 
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
  },
  inputPassword: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    paddingRight: 50, // Add right padding for the icon space
  },
  icon: {
    position: 'absolute',
    right: '12%', // Position the icon to the right inside the input
    justifyContent: 'center',
    height: '90%',
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
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
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
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: useWindowDimensions,
    zIndex: -1,
  },
});