import React, { useState } from 'react';
import { TouchableOpacity, TextInput, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Alert, KeyboardAvoidingView, ActivityIndicator, Platform } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { ScrollView } from 'react-native-gesture-handler';
import DatePicker from 'react-native-date-picker';
import  baseURL  from '../Api';

export default function SignUp () {
  const { width } = useWindowDimensions();
  const[fname, setFname] = useState('');
  const[gender, setGender]= useState(null);
  const[phoneNo, setPhoneNo] = useState('');
  const[Email, setEmail] = useState('');
  const[dob, setDob] = useState(new Date());
  const[province, setProvince] = useState('');
  const[city, setCity] = useState('');
  const[address, setAddress] = useState('');
  const[password , setPassword] = useState('');
  const[confirmPassword, setConfirmPassword] = useState('');
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const cityList = [
    { label: 'Islamabad', value: 'Islamabad' },
    { label: 'Rawalpindi', value: 'Rawalpindi' },
    { label: 'Lahore', value: 'Lahore' },
    { label: 'Multan', value: 'Multan' },
    { label: 'Faisalabad', value: 'Faisalabad' },
    { label: 'Karachi', value: 'Karachi' },
    { label: 'Hyderabad', value: 'Hyderabad' },
    { label: 'Peshawar', value: 'Peshawar' },
    { label: 'Quetta', value: 'Quetta' },
    { label: 'Sialkot', value: 'Sialkot' },
    { label: 'Gujranwala', value: 'Gujranwala' },
    { label: 'Sargodha', value: 'Sargodha' },
    { label: 'Bahawalpur', value: 'Bahawalpur' },
    { label: 'Sukkur', value: 'Sukkur' },
    { label: 'Abbottabad', value: 'Abbottabad' },
    { label: 'Mardan', value: 'Mardan' },
    { label: 'Mingora', value: 'Mingora' },
    { label: 'Chitral', value: 'Chitral' },
    { label: 'Muzaffarabad', value: 'Muzaffarabad' },
    { label: 'Gilgit', value: 'Gilgit' },
    { label: 'Skardu', value: 'Skardu' },
    { label: 'Mirpur', value: 'Mirpur' },
    { label: 'Gujrat', value: 'Gujrat' },
    { label: 'Jhelum', value: 'Jhelum' },
    { label: 'Sahiwal', value: 'Sahiwal' },
    { label: 'Rahim Yar Khan', value: 'Rahim Yar Khan' },
    { label: 'Dera Ghazi Khan', value: 'Dera Ghazi Khan' },
    { label: 'Nawabshah', value: 'Nawabshah' },
    { label: 'Larkana', value: 'Larkana' },
    { label: 'Khuzdar', value: 'Khuzdar' },
    { label: 'Gwadar', value: 'Gwadar' },
    { label: 'Zhob', value: 'Zhob' },
    { label: 'Chaman', value: 'Chaman' },
  ];

  const provinceList = [
    { label: 'Punjab', value: 'Punjab'},
    { label: 'KPK', value: 'KPK'},
    { label: 'ICT', value: 'ICT'},
    {  label: 'Sindh', value: 'Sindh'},
    {  label: 'Balochistan', value: 'Balochistan'},
    {  label: 'Gilgit Baltistan', value: 'Gilgit Baltistan'},
  ];

  const [loading, setLoading] = useState(false);
  const [dobData, setDobData] = useState('Select Date of Birth');

  const saveMember = async () => {
    if (
      !fname ||
      !phoneNo||
      !Email||
      !province||
      !city||
      !address||
      !password||
      !confirmPassword
    ) {
      Alert.alert('Please Fill All Fields!')
      return;
    }
    if (phoneNo.length !== 11 ) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 11 characters long.');
      return;
    }
    if(password.length <6 || confirmPassword.length <6)
    {
      Alert.alert('Password should be Atleast 6 Characters')
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match');
      return;
    }
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch(`${baseURL}Account/SignUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PhoneNo: phoneNo,
          Email:Email,
          Full_Name: fname,
          Gender: gender,
          DoB: dob,
          Province: province,
          City: city,
          Address: address,
          Password: password,
          Date_joined: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Login Successfull')
        Alert.alert(
          'Registered Successfully!',
          'Now Login to Continue.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', 'User already exists! Try Signing In.' );
        console.log('Response Status:', response.status);
        console.log('Response Body:', await response.text());
        console.log(phoneNo, fname, gender, dob, city, province, address, password, confirmPassword )
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.log('Error:', error);
    }
    setLoading(false)
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textContainer}>
            <Text style={styles.header}>Sign Up to Join</Text>
            <Text style={styles.header}>Neighborhood Council</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              keyboardType="default"
              onChangeText={setFname}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone No"
              keyboardType="phone-pad"
              onChangeText={setPhoneNo}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholderTextColor="#666"
            />

            <Text style={styles.radioText}>Gender</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity onPress={() => setGender('M')}>
                <Text style={styles.radioOption}>
                  Male {gender === 'M' ? '●' : '○'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setGender('F')} style={styles.radioButton}>
                <Text style={styles.radioOption}>
                  Female {gender === 'F' ? '●' : '○'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.dobButton} onPress={() => setOpen(true)}>
              <Text style={styles.dobButtonText}>{dobData}</Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={open}
              date={dob}
              mode="date"
              onConfirm={(dob) => {
                setOpen(false);
                setDob(dob);
                setDobData(dob.toDateString())
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />

            <View style={styles.dropdownRow}>
              <Dropdown
                data={cityList}
                style={styles.dropDown}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder='City'
                value={city}
                onChange={item => {
                  setCity(item.value);
                }}
                renderItem={(item) => (
                  <Text style={styles.dropdownItem}>{item.label}</Text>
                )}
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
              />

              <Dropdown
                data={provinceList}
                style={styles.dropDown}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder='Province'
                value={province}
                onChange={item => {
                  setProvince(item.value);
                }}
                renderItem={(item) => (
                  <Text style={styles.dropdownItem}>{item.label}</Text>
                )}
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Address"
              keyboardType="default"
              onChangeText={setAddress}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              keyboardType="default"
              secureTextEntry={true}
              onChangeText={setPassword}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              keyboardType="default"
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={saveMember}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLink} onPress={() => navigation.navigate("Login")}>Sign In!</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    fontSize: 28,
    color: '#493D18',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginTop: 15,
    color: '#000',
    fontSize: 16,
  },
  radioText: {
    color: '#000',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '500',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  radioButton: {
    marginLeft: 30,
  },
  radioOption: {
    color: '#000',
    fontSize: 16,
  },
  dobButton: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginTop: 15,
  },
  dobButtonText: {
    color: '#666',
    fontSize: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  dropDown: {
    width: '48%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
  },
  dropdownItem: {
    color: '#000',
    padding: 10,
  },
  dropdownSelectedText: {
    color: '#000',
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  signUpButton: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  signUpButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signInText: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
  },
  signInLink: {
    color: '#F0C38E',
    fontWeight: 'bold',
  },
});