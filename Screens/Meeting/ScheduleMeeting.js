import React, { useEffect, useState } from 'react';
import { Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import  baseURL  from '../Api';

export default function ScheduleMeeting ({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const { memberId, councilId, problemId, projectId, Title, Description} = route.params;
  const [title, setTitle] = useState('')
  const [agenda, setAgenda] = useState('')
  const [location, setLocation] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date());
  const TypeList = [
    { label: 'General', value: 'General' },
    { label: 'Project', value: 'Project' },
    { label: 'Hearing', value: 'Hearing' },
  ];
  const [type, setType] = useState('')
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [mdData, setMdData] = useState('Select Meeting Date and Time')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(Title){
      setTitle(Title)
    }
    if(Description){
      setAgenda(Description)
    }
  }, [Title, Description])

  const postMeeting = async() => {
    let meeting = {
      title : title,
      description : agenda,
      address : location,
      problem_id : problemId? problemId : 0,
      project_id : projectId? projectId: 0,
      council_id : councilId,
      scheduled_date : meetingDate,
      meeting_type : 'General'
    }
    if(!title || !agenda || !location || !meetingDate ){
      Alert.alert('Please Fill All Fields!')
      return;
    }
    
    try{
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch(`${baseURL}meeting/postMeeting`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(meeting)}
      )

      if(response.ok){
        console.log('Meeting Added')
        Alert.alert('Meeting Scheduled Successfully!')
        navigation.replace('Meeting', {councilId : councilId, memberId : memberId})
      }
      else{
        console.log('Failed to Schedule Meeting.')
      }
    }
    catch(error){
      console.log('Unable to Schedule Meeting.')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.header}>Schedule a Meeting</Text>
        <TextInput style={styles.input} placeholder="Enter Title" keyboardType="default" onChangeText={setTitle} value={Title} placeholderTextColor="#000" />
        <TextInput style={styles.input} placeholder="Enter Agenda" keyboardType="default" onChangeText={setAgenda} value={Description} placeholderTextColor="#000" />
        <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={styles.dobButton} onPress={() => setStartDatePickerOpen(true)}>
            <Text style={styles.signUpButtonText}>{mdData}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={startDatePickerOpen}
            date={meetingDate}
            mode="datetime"
            onConfirm={(date) => {
              setStartDatePickerOpen(false);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              setMeetingDate(localDate);
              setMdData(date.toISOString());
            }}
            onCancel={() => setStartDatePickerOpen(false)}
          />
           {/* <Dropdown
          data={TypeList}
          style={styles.dropDown}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder="Select Type"
          value={type}
          onChange={(item) => {
            setType(item.value);
          }}
          renderItem={(item) => <Text style={{ color: 'black' }}>{item.label}</Text>}
          selectedTextStyle={{ color: 'black' }} // Ensures the selected text is black
          placeholderStyle={{ color: 'black' }} // Ensures the placeholder text is black
        /> */}
        </View>
        <TextInput style={styles.input} placeholder="Meeting Location" keyboardType="default" onChangeText={setLocation} placeholderTextColor="#000" />
        <TouchableOpacity style={styles.signInButton} onPress={postMeeting}>
          {loading ?(
            <ActivityIndicator size={'small'} color={'black'} />
          ):(
            <Text style={styles.signInButtonText}>Schedule Meeting</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: '#FFFFFF', 
    alignItems:'center',
    justifyContent:'center'
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
      bottom : 100,
      color : '#493D18',
      justifyContent : 'center',
      alignItems : 'center',
      fontWeight : '500',
     },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: useWindowDimensions,
    zIndex: -1,
  },
  desc:{
    fontSize: 20,
    textAlign: 'center',
    alignItems : 'center'
  },
  dropDown :{
    width: '40%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
    placeholderTextColor : 'black',
    //fontSize: 5
  },
  signInButton: {
    top: 40,
    width: '90%',
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
  signUpButton: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dobButton: {    
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginBottom: 10,
  },
});