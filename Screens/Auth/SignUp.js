import React, { useState } from 'react';
import { TouchableOpacity, TextInput, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { ScrollView } from 'react-native-gesture-handler';
import DatePicker from 'react-native-date-picker';
import  baseURL  from '../Api';

export default function SignUp () {
  const { width } = useWindowDimensions(); // screen width
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
    {  label: 'Sindh', value: 'Islamabad'},
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
                  Date_joined: new Date().toISOString(), // Date.now to ISO stringv for storing Current Date.
                }),
              });

              if (response.ok) {
                console.log('Login Successfull')
                Alert.alert(
                  'Registered Successfully!',
                  'Now Login to Continue.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Login') }] // Navigate after the alert is dismissed
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
      <ScrollView>

      <View style={styles.textContainer}>
        <Text style={styles.header}>Sign Up to Join Neighborhood</Text>
        <Text style={styles.header}>Council</Text>
        <TextInput style={styles.input} placeholder="Enter Full Name" keyboardType="default" onChangeText={setFname} placeholderTextColor="#000" />
        <TextInput style={styles.input} placeholder="Phone No" keyboardType="phone-pad" onChangeText={setPhoneNo} placeholderTextColor="#000" />
       <TextInput style={styles.input} placeholder="Enter Email" keyboardType="default" onChangeText={setEmail} placeholderTextColor="#000" />
        <Text style={styles.radioText }> Gender   </Text>
        <View style={{marginBottom: 10, justifyContent:'center', flexDirection: 'row' }} >
      <TouchableOpacity onPress={() => setGender('M')}>
        <Text style={{color: 'black'}}>Male   {gender === 'M' ? '●' : '○'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setGender('F')} style={{ marginLeft: 20 }}>
        <Text style={{color: 'black'}}>     Female   {gender === 'F' ? '●' : '○'} </Text>
      </TouchableOpacity>
    </View>
        <TouchableOpacity style={styles.dobButton} onPress={() => setOpen(true)} >
          <Text style={styles.signUpButtonText} >{dobData}</Text>
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
       <View style={{flexDirection:'row'}}>
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
            <Text style={{ color: 'black' }}>{item.label}</Text>
          )}
          selectedTextStyle={{ color: 'black' }} // Ensures the selected text is black
          placeholderStyle={{ color: 'black' }} // Ensures the placeholder text is black
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
              <ScrollView>
              <Text style={{ color: 'black'}}>{item.label}</Text>
              </ScrollView>
            )}
            selectedTextStyle={{ color: 'black' }} // Ensures the selected text is black
            placeholderStyle={{ color: 'black' }} // Ensures the placeholder text is black
          />
          </View>
        <TextInput style={styles.input} placeholder="Address" keyboardType="default" onChangeText={setAddress} placeholderTextColor="#000" />
        <TextInput style={styles.input} placeholder="Password" keyboardType="default" onChangeText={setPassword} placeholderTextColor="#000" />
        <TextInput style={styles.input} placeholder="Confirm Password" keyboardType="default" onChangeText={setConfirmPassword} placeholderTextColor="#000" />
        <TouchableOpacity style={styles.signUpButton} onPress={saveMember} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      )}
    </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.signInText}>
           Already have an account? <Text style={styles.signInLink} onPress={()=> navigation.navigate("Login")}>Sign In!</Text>
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>


    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
    textContainer:{
      top : 10,
     flex : 1,
     alignItems : 'center',
     position : 'relative',
     justifyContent : 'center',
     marginBottom : 20,
    },
    input: {
      width: '80%',
      padding: 15,
      borderRadius: 25,
      backgroundColor: '#F8F9FA',
      marginBottom: 10,
      color : 'black',
      },
    header : {
        fontSize : 30,
        color : '#493D18',
        justifyContent : 'center',
        alignItems : 'center',
        fontWeight : '500',
       },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: useWindowDimensions,
    zIndex: -1,
  },
  signUpButton: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 10,
  },
  signUpButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  RadioButton : {
    justifyContent : 'center'
  },
  signInText: {
    color: '#A0A0A0',
  },
  signInLink: {
    color: '#F0C38E',
    fontWeight: 'bold',
  },
  radioText: {
    color : '#000',
    fontSize : 15,
    left : '20'
},
dropDown :{
  width: '40%',
  padding: 15,
  borderRadius: 25,
  backgroundColor: '#F8F9FA',
  marginBottom: 10,
  placeholderTextColor : 'black',
  fontSize: 5
},
dobButton : {
  width: '60%',
  padding: 15,
  borderRadius: 25,
  backgroundColor: '#F8F9FA',
  alignItems: 'center',
  marginBottom : 10
  }
});
