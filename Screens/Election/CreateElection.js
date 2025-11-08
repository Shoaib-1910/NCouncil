// import React, { useState } from 'react';
// import { TouchableOpacity, TextInput, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Alert, KeyboardAvoidingView } from 'react-native';
// import WavyBackground from '../Background/WavyBackground';
// import { useNavigation } from '@react-navigation/native';
// import { Dropdown } from 'react-native-element-dropdown';
// import { ScrollView } from 'react-native-gesture-handler';
// import DatePicker from 'react-native-date-picker';
// import  baseURL  from './Api';


// export default function CreateElection ({navigation, route}) {

//   const { width } = useWindowDimensions(); // screen width
//   const[electionName, setElectionName] = useState('');

//   const { councilID } = route.params

//   const[sd, setSd] = useState(new Date());
//   const[ed, setEd] = useState(new Date());
//   const [open, setOpen] = useState(false); 

//   const [sdData, setSdData] = useState('SELECT START DATE');
//   const [edData, setEdData] = useState('SELECT END DATE');
     
//   const addElection = async () => {
//         if (!electionName ) {
//         Alert.alert('Please Enter Name of Election!')
//         return;
//         }

//         const eData = {
//             Name : electionName,
//             status : "Ongoing",
//             StartDate : sd,
//             EndDate : ed,
//             Council_id : councilID,
//         }
//             try {
//               const response = await fetch(`${baseURL}Elections/InitiateElection`, {
//                 method: 'POST',
//                 headers: {
//                   'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(eData),
//               });
        
//               if (response.ok) {
//                 console.log('Election Added Successfully')
//                 // Alert.alert(
//                 //   'Added Successfully!',
//                 //   'Now Login to Continue.',
//                 //   [{ text: 'OK', onPress: () => navigation.navigate('Login') }] 
//                 // );
//                 console.log('Added Successfully!')
//               } else {
//                 Alert.alert('Error', 'User already exists! Try Signing In.' );
//                 console.log('Response Status:', response.status); 
//                 console.log('Response Body:', await response.text());
//               }
//             } catch (error) {
//               Alert.alert('Error', 'An error occurred');
//               console.log('Error:', error);
//             }
//       };
      
//   return (
//     <SafeAreaView style={styles.container}>
//       <WavyBackground />
//       <ScrollView>
//       <View style={styles.textContainer}>
//         <Text style={styles.header}>Form Committee By Starting an Elecion</Text> 
//         <TextInput style={styles.input} placeholder="Enter Election Name" keyboardType="default" onChangeText={setElectionName} placeholderTextColor="#000" />
//         <TouchableOpacity style={styles.dobButton} onPress={() => setOpen(true)} >
//           <Text style={styles.signUpButtonText} >{sdData}</Text>
//         </TouchableOpacity>``
//       <DatePicker
//         modal
//         open={open}
//         date={sd}
//         mode="date"
//         onConfirm={(sd) => {
//           setOpen(false);
//           setSd(sd);
//           setSdData(sd.toDateString())
//         }}
//         onCancel={() => {
//           setOpen(false);
//         }}
//       />
//        <TouchableOpacity style={styles.dobButton} onPress={() => setOpen(true)} >
//           <Text style={styles.signUpButtonText} >{edData}</Text>
//         </TouchableOpacity>``
//       <DatePicker
//         modal
//         open={open}
//         date={ed}
//         mode="date"
//         onConfirm={(ed) => {
//           setOpen(false);
//           setEd(ed);
//           setEdData(ed.toDateString())
//         }}
//         onCancel={() => {
//           setOpen(false);
//         }}
//       /><TouchableOpacity style={styles.signUpButton} onPress={addElection} >
//           <Text style={styles.signUpButtonText} >Sign Up</Text>
//         </TouchableOpacity>
//       </View>
//       </ScrollView>
//       <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.keyboardAvoidingView}>
//       <Image
//           source={require('../assets/Footer.png')}
//           style={[styles.footer, { width: width }]} // image width to screen width
//           resizeMode="stretch" // Maintain aspect ratio
//         />
//   </KeyboardAvoidingView>
//     </SafeAreaView>
  
//   );
// };


// const styles = StyleSheet.create({
  
//     textContainer:{
//       top : 0,
//      flex : 1,
//      alignItems : 'center',
//      position : 'relative',
//      justifyContent : 'center',
//      bottom : 0,
//     },
//     input: {
//       width: '80%',
//       padding: 15,
//       borderRadius: 25,
//       backgroundColor: '#F8F9FA',
//       marginBottom: 10,
//       color : 'black',
//       },
//     header : {
//         fontSize : 30,
//         color : '#493D18',
//         justifyContent : 'center',
//         alignItems : 'center',
//         fontWeight : '500',
//         marginTop : 50,
//        },
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Set the background color to white
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: useWindowDimensions,
//     zIndex: -1,
//   },
//   signUpButton: {
//     width: '80%',
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: '#F0C38E',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   signUpButtonText: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   signInText: {
//     color: '#A0A0A0',
//   },
//   signInLink: {
//     color: '#F0C38E',
//     fontWeight: 'bold',
//   },
// dobButton : {    
//   width: '60%',
//   padding: 15,
//   borderRadius: 25,
//   backgroundColor: '#F8F9FA',
//   alignItems: 'center',
//   marginBottom : 10
//   }
// });
import React, { useState } from 'react';
import { TouchableOpacity, TextInput, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { ScrollView } from 'react-native-gesture-handler';
import DatePicker from 'react-native-date-picker';
import baseURL from '../Api';

export default function CreateElection({ navigation, route }) {
  const { width } = useWindowDimensions(); // screen width
  const [electionName, setElectionName] = useState('');
  const { councilID } = route.params;
  const [sd, setSd] = useState(new Date());
  const [ed, setEd] = useState(new Date());
  
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const [sdData, setSdData] = useState('SELECT START DATE');
  const [edData, setEdData] = useState('SELECT END DATE');
  const [loading, setLoading] = useState(false);
  
  const currentDate = new Date(); //Current date initialized to check whether Date is in future
  
  const addElection = async () => {
    setLoading(true)
    const eData = {
      Name: electionName,
      status: "Ongoing",
      StartDate: sd,
      EndDate: ed,
      Council_id: councilID,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await fetch(`${baseURL}Election/InitiateElection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eData),
      });
      const json = await response.json();
      if (response.ok) {
        Alert.alert('Success!', 'Election Added Successfully, Now head over to View Election!', 
            [{ text: 'OK', onPress: () => navigation.navigate('View Election' , {councilID: councilID})}]);
        console.log('Election Added Successfully');
      } else if(response.status == 302){
        Alert.alert('Error', 'Election Already Exists, Close the previous one First!');
        //navigation.goBack();
        console.log('Response Status:', response.status); 
        console.log('Response Body:', await response.text());
      } else if(response.status == 400){
        Alert.alert('Tenure Incomplete', `${json}`);
        console.log('Error Creating Election');
        console.log('Response Status:', response.status); 
        //console.log('Response Body:', await response.text());
      } else{
        console.log('Error Creating Election');
        console.log('Response Status:', response.status); 
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.log('Error:', error);
    }
    setLoading(false)
  };

  const handlePress = () => {
    if (!electionName) {
      Alert.alert('Please Enter the Name of the Election!');
      return;
    }
    if(!sd || !ed){
      Alert.alert('Please select Election Dates!')
      return;
    }

    if (sd < currentDate) {
    Alert.alert('Invalid Start Date', 'The start date cannot be in the past.');
    return;
    }

   if (ed <= sd) {
    Alert.alert('Invalid End Date', 'The end date must be after the start date.');
    return;
    }   
    Alert.alert(
      'Are you sure?',
      'Do you want to start an Election?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: addElection,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <ScrollView>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Form Committee By Starting an Election</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Election Name"
            keyboardType="default"
            onChangeText={setElectionName}
            placeholderTextColor="#000"
          />
          {/* Start Date Picker */}
          <TouchableOpacity style={styles.dobButton} onPress={() => setStartDatePickerOpen(true)}>
            <Text style={styles.signUpButtonText}>{sdData}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={startDatePickerOpen}
            date={sd}
            mode="datetime"
            onConfirm={(date) => {
              setStartDatePickerOpen(false);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              setSd(localDate);
              setSdData(date.toLocaleString());
            }}
            onCancel={() => setStartDatePickerOpen(false)}
          />
         {/*  setSdData(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString());*/}

          {/* End Date Picker */}
          <TouchableOpacity style={styles.dobButton} onPress={() => setEndDatePickerOpen(true)}>
            <Text style={styles.signUpButtonText}>{edData}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={endDatePickerOpen}
            date={ed}
            mode="datetime"
            onConfirm={(date) => {
              setEndDatePickerOpen(false);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              setEd(localDate);
              setEdData(date.toLocaleString());
            }}
            onCancel={() => setEndDatePickerOpen(false)}
          />
          {/* Create Election Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handlePress} disabled={loading}>
            {loading ? (
              <ActivityIndicator size={'small'} color={'#000'}/> 
            ) : (
              <Text style={styles.signUpButtonText}>Create Election</Text>
            )}
            </TouchableOpacity>
        </View>
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
    color: 'black',
    marginTop: 100,
  },
  header: {
    fontSize: 30,
    color: '#493D18',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '500',
    marginTop: 100,
    marginVertical: 20,
    textAlign: 'center'
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
    zIndex: -1,
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
    width: '65%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginBottom: 20,
  },
});
