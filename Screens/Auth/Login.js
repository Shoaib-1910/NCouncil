import React, { useCallback, useState } from 'react';
import {
  Text,
  Alert,
  View,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  // Modal
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';

export default function Login() {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔴 OTP STATES TEMPORARILY DISABLED
  // const [otpVisible, setOtpVisible] = useState(false);
  // const [otp, setOtp] = useState('');
  // const [loginPhoneNo, setLoginPhoneNo] = useState('');

  // Handle hardware back button
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
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  // Save user data
  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  // Add login history
  const addLoginHistory = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      const deviceName = (await DeviceInfo.getModel()) || 'Unknown Device';

      const newRecord = {
        timestamp: new Date().toISOString(),
        ip,
        device: deviceName,
        phoneNo
      };

      const existingHistory = await AsyncStorage.getItem('loginHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [newRecord, ...history].slice(0, 10);

      await AsyncStorage.setItem('loginHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to add login history:', error);
    }
  };

  // Handle login
  const handlePress = async () => {
    if (!phoneNo.trim() || !password.trim()) {
      Alert.alert('Please enter your credentials!');
      return;
    }

    if (phoneNo.length !== 11) {
      Alert.alert('Phone Number should be 11 digits');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `${baseURL}Account/Login?phoneNo=${phoneNo}&password=${password}`
      );
      const json = await response.json();

      if (response.ok && json.data) {
        const userData = {
          memberId: json.data.id,
          phoneNo: json.data.PhoneNo,
          fullName: json.data.Full_Name,
          gender: json.data.Gender,
          dateOfBirth: json.data.DoB,
          province: json.data.Province,
          city: json.data.City,
          address: json.data.Address,
          password: json.data.Password,
          dateJoined: json.data.Date_joined
        };

        await storeUserData(userData);
        await AsyncStorage.setItem('userToken', 'LoggedIn');

        // 🔴 OTP FLOW DISABLED FOR NOW
        // setLoginPhoneNo(json.data.PhoneNo);
        // setOtpVisible(true);

        // ✅ DIRECT NAVIGATION AFTER LOGIN
        await addLoginHistory();
        navigation.navigate('HomeScreen', { memberID: json.data.PhoneNo });

      } else if (response.status === 401) {
        Alert.alert('Error', 'Incorrect Password');
      } else {
        Alert.alert('Error', 'No Member Registered with ' + phoneNo);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Failed to log in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 OTP VERIFICATION FUNCTION DISABLED
  // const handleVerifyOtp = async () => {};

  return (
    <View style={styles.container}>
      <WavyBackground />

      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/UserProfile.png')}
            style={styles.image}
          />
        </View>
      </View>

      <Text style={styles.title1}>Hello there!</Text>
      <Text style={styles.title}>Sign In to Continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone No"
        keyboardType="phone-pad"
        value={phoneNo}
        onChangeText={setPhoneNo}
        placeholderTextColor="#000"
      />

      <View style={styles.container2}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#000"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.icon}
        >
          <IconButton
            icon={showPassword ? 'eye-off' : 'eye'}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.signInButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          Don’t have an account?{' '}
          <Text style={styles.signUpLink}>Sign Up!</Text>
        </Text>
      </TouchableOpacity>

      {/* 🔴 OTP MODAL TEMPORARILY DISABLED */}
      {/*
      <Modal visible={otpVisible} transparent animationType="slide">
        ...
      </Modal>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff'
  },
  logoContainer: { marginBottom: 40 },
  image: { height: 150, width: 150 },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  title1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'KronaOne-Regular',
    color: '#000'
  },
  container2: {
    width: '100%',
    alignItems: 'center',
    position: 'relative'
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black'
  },
  inputPassword: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    paddingRight: 50
  },
  icon: {
    position: 'absolute',
    right: '12%',
    justifyContent: 'center',
    height: '90%'
  },
  signInButton: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold'
  },
  signUpText: { color: '#A0A0A0' },
  signUpLink: { color: '#F0C38E', fontWeight: 'bold' }
});
