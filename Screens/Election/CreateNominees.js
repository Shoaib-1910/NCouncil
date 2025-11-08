import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DividerLine from '../../Background/LineDivider';

export default function CreateNominees ({route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
    const [membersName, setMembersName] = useState([]);
    const [membersId, setMembersId] = useState({});
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [panel, setPanel] = useState('');
    const [candidateId, setCandidateId] = useState(0)
    const { councilId, electionId, electionName } = route.params;
    const [loading, setLoading] = useState(false);
//Nominating Candidates one by one
const nominateCandidate = async () => {
  if (!panel) {
    Alert.alert('Please Enter a Panel Name.');
    return;
  }
  if (candidateId === 0) {
    Alert.alert('Please Select a Candidate');
    return;
  }

  try {
    console.log('Selected Candidate ID: '+candidateId)
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Encode query parameters
    const encodedPanel = encodeURIComponent(panel);
    const encodedCandidateId = encodeURIComponent(candidateId);
    const encodedElectionId = encodeURIComponent(electionId);
    const encodedCouncilId = encodeURIComponent(councilId);

    const response = await fetch(
      `${baseURL}Election/NominateCandidateForPanel?councilMemberId=${encodedCandidateId}&electionId=${encodedElectionId}&panelName=${encodedPanel}&councilId=${encodedCouncilId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    if (response.ok) {
      Alert.alert('Member Nominated For Elections', 'Nomination successful');
      console.log('Member Nominated successfully');
      getNomination()
      getMembersName()
      setPanel('')
      setCandidateId(0)
    } else {
      console.log('Failed to Nominate Member', result);
      Alert.alert('Error', 'Failed to Nominate Member');
    }
  } catch (error) {
    console.log('Unable to Access Data:', error);
    Alert.alert('Error', 'Unable to process nomination.');
  } finally {
    setLoading(false);
  }
};


//Remove Nomination for election
    const removeNomination = async(candidateId, electionId) =>{
      try{
        const response = await fetch(`${baseURL}election/RemoveCandidatefrompanel?councilMemberId=${candidateId}&electionId=${electionId}&councilId=${councilId}`,
         {
          method: 'DELETE',
          headers: {
          'Content-Type': 'application/json',
        },
          },
        )
        const result = await response.json()
        if(response.ok){
          Alert.alert('Nomination Removed')
          console.log('Nomination Removed Successfully')
          await new Promise(resolve => setTimeout(resolve, 1000))
          getMembersName()
          getNomination()
        }
        else{
          console.log('Failed to set Candidate to user'+ response.status)
        }
      }
      catch(error){
        console.log('Error','Unable to fetch Data')
      }
    }


//Retriving Members Name associated with the council besides being Admin and already part of a panel.
const getMembersName = async () => {
  try {
    console.log('Loading Members Name..')
    const response = await fetch(`${baseURL}Council/GetCouncilMembers?councilId=${councilId}`);
   
    if (response.ok) {
      console.log('Members Name Response' + response)
      const responseText = await response.text(); 
      console.log('Members Name Loaded!')
      if (responseText) {
        const data = JSON.parse(responseText); 
        // Format data for the dropdown
        if (data && data.length > 0) {
          console.log('Members Name' + data)
        const MembersData = data.map((member) => ({
          label: member.MembersName, // Display name
          value: member.MembersId,   // Member id
          }))
        setMembersName(MembersData);
        }
        else{
          setMembersName([])
          Alert.alert(
            'No Members Found',
            'Add New Members to Nominate For Election',
            [
              {
                text: 'View Nominations',
                style : 'cancel',
              },
              {
                text: 'Go Back',
                onPress: async () => {
                 navigation.replace('Nominate Candidate',{councilID : councilId});
                },
              },
            ]
          );  
        }
      } else {
        Alert.alert(
          'No Members Found',
          'Add New Members to Nominate For Election',
          [
            {
              text: 'View Nominations',
              style : 'cancel',
            },
            {
              text: 'Go Back',
              onPress: async () => {
               navigation.replace('Nominate Candidate',{councilID : councilId});
              },
            },
          ]
        );
      }
    } else {
      Alert.alert('Failed to fetch members: ' + response.status);
    }
  } catch (error) {
    console.error('Failed to Load Data: ' + error);
  }
};

//Retriving Nominated Members along with the panel name
const getNomination = async () => {
  try {
    console.log('Fetching Nominations...');
    const response = await fetch(`${baseURL}election/getselectedCandidates?electionId=${electionId}`);

    console.log('Raw Response:', response);
    
    if (response.ok) {
      console.log('Response Status OK');
      // Check if content-type is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Parsed Data:', data);

        if (data && data.length > 0) {
          const MembersData = data.map((member) => ({
            MemberId: member.MemberId,
            MemberName: member.MemberName,
            PanelName: member.PanelName,
          }));
          setSelectedCandidates(MembersData);
        } else {
          console.log('No Nominations Found');
          setSelectedCandidates([])
        }
      } else {
        console.log('Expected JSON response, but received:', contentType);
      }
    } else {
      console.log('Failed to fetch nomination data. Status:', response.status);
    }
  } catch (error) {
    console.log('Unable to Fetch Data:', JSON.stringify(error));
  }
};



useFocusEffect(
  useCallback(()=> {
    getNomination()
  }, [electionId])
);

// useEffect(() => {
//   getNomination()
// }, [electionId])

const renderItems= ({item}) =>{
  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: 'gray',
      
    }}>
      <View style={{ flexDirection: 'row', marginBottom : 10 }}>
        <Text style={{  color: 'black', fontWeight: 'bold', fontSize: 17}}>Panel: {item.PanelName}   </Text>
        <Text style={{ color : 'gray' , fontSize : 17}}>Candidate: {item.MemberName}  </Text>
      </View>
      <TouchableOpacity
        onPress={() => removeNomination(item.MemberId, electionId)}
        style={{
          padding: 10,
          backgroundColor: '#333',
          borderRadius: 5,
          flexWrap : 'wrap'
        }}>
        <Text style={{ color: 'white' }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}
  
    // const renderItem = ({ item }) => (
    //   <TouchableOpacity>
    //     <View style={styles.itemContainer}>
    //       <Text style={styles.itemText}>{item}</Text>
    //     </View>
    //     </TouchableOpacity>
    //   );

      useEffect(()=>{
        getMembersName();
      },[councilId])

      // useFocusEffect(
      //   useCallback(() => {
      //   getMembersName();
      //   }, [councilId]) 
      // );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.cont}>
      <Text style={styles.titleText}>Create Nominations for the {electionName}</Text>
      <TextInput style={styles.input} placeholder="Enter Panel Name" keyboardType='default' onChangeText={setPanel} placeholderTextColor="#000" />
      {/* <FlatList
          data={membersName}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()} 
          ListEmptyComponent={<Text style={{color: 'black'}}>No members found</Text>}
        /> */}
        <View style={styles.setText}>
        <Text style={styles.candidateText}>Choose Candidate</Text>
       <Dropdown
        data={membersName}
        style={styles.dropDown}
        maxHeight={200}
        labelField="label"   
        valueField="value"   
        placeholderTextColor = '#000'
        placeholder="Select Candidate"
        value={candidateId}
        onChange={(item) => {
          setCandidateId(item.value); // Store selected candidate ID
          console.log('Selected Candidate ID: '+candidateId)
        }}
        renderPlaceholder={() => (
          <Text style={{ color: '#333' }}>Select Candidate</Text>
       )}
        renderItem={(item) => (
          <ScrollView>
            <Text style={{ color: 'black', fontSize: 17, padding: 15 }}>{item.label}</Text>
          </ScrollView>
        )}
      />
      </View>
        <TouchableOpacity style={styles.signInButton} onPress={nominateCandidate} disabled={false}>
          {loading ?(
            <ActivityIndicator size={'small'} color={'#000'} />
          ): (
          <Text style={styles.signInButtonText}>Create Nomination</Text>
          )}
        </TouchableOpacity>
        <DividerLine style={styles.line}/>  
        <FlatList
          style={{marginTop:5, marginBottom : 70}}
          data={selectedCandidates}
          renderItem={renderItems}
          keyExtractor={(item) => item.MemberId.toString()}
          ListEmptyComponent={<Text style={{color: 'black'}}>No Nomination Made!</Text>}
          />
        </View>
        <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
   container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  cont:{
    marginTop: 60,
    justifyContent:'center',
    alignItems:'center',
    //flex: 1
  },
  setText:{
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  candidateText:{
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    padding: 10,
    fontSize: 15,
  },
  dropDown :{
    width: '40%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#333',
    marginBottom: 5,
    color : '#000',
    fontSize: 5
  },
  signInButton: {
    width: '50%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  titleText: {
    bottom : 50,
    color: 'black',
    margin: 10,
    fontSize: 30,
    textAlign: 'center',
  },
  itemContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    justifyContent:'center',
    alignItems:'center',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  input: {
    width: '90%',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
  },
});


// import React, { useCallback, useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
// import WavyBackground from '../../Background/WavyBackground';
// import baseURL from '../Api';
// import { useFocusEffect } from '@react-navigation/native';
// import { Dropdown } from 'react-native-element-dropdown';
// import DividerLine from '../../Background/LineDivider';

// export default function CreateNominees ({route, navigation}) {
//   const { width } = useWindowDimensions();
//   const [membersName, setMembersName] = useState([]);
//   const [membersId, setMembersId] = useState({});
//   const [selectedCandidates, setSelectedCandidates] = useState([]);
//   const [panel, setPanel] = useState('');
//   const [candidateId, setCandidateId] = useState(0)
//   const { councilId, electionId, electionName } = route.params;
//   const [loading, setLoading] = useState(false);

//   const nominateCandidate = async() => {
//     if (!panel) {
//       Alert.alert('Please Enter a Panel Name.');
//       return;
//     }
//     if (candidateId === 0) {
//       Alert.alert('Please Select a Candidate');
//       return;
//     }

//     try {
//       setLoading(true);
//       await new Promise(resolve => setTimeout(resolve, 3000));
//       const response = await fetch(
//         `${baseURL}Election/NominateCandidateForPanel?councilMemberId=${candidateId}&electionId=${electionId}&panelName=${panel}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const result = await response.json();
//       if (response.ok) {
//         Alert.alert('Member Nominated For Elections', { text: 'Ok' });
//         console.log('Member Nominated successfully');
//       } else {
//         console.log('Failed to Nominate Member');
//       }
//     } catch (error) {
//       console.log('Unable to Access Data' + error);
//     }
//     setLoading(false);
//   };

//   const removeNomination = async(candidateId, electionId) => {
//     try {
//       const response = await fetch(
//         `${baseURL}election/RemoveCandidatefrompanel?councilMemberId=${candidateId}&electionId=${electionId}`,
//         { method: 'DELETE' }
//       );
//       const result = await response.json();
//       if (response.ok) {
//         Alert.alert('Nomination Removed');
//         console.log('Nomination Removed Successfully');
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         getMembersName();
//       } else {
//         console.log('Failed to set Candidate to user' + response.status);
//       }
//     } catch (error) {
//       console.log('Error', 'Unable to fetch Data');
//     }
//   };

//   const getMembersName = async () => {
//     try {
//       const response = await fetch(`${baseURL}Council/GetCouncilMembers?councilId=${councilId}`);
      
//       if (response.ok) {
//         const responseText = await response.text();
//         if (responseText) {
//           const data = JSON.parse(responseText);
//           if (data && data.length > 0) {
//             const formattedMembers = data.map((member) => ({
//               label: member.MembersName,
//               value: member.MembersId,
//             }));
//             setMembersName(formattedMembers);
//           }
//         } else {
//           Alert.alert(
//             'No Members Found',
//             'Add New Members to Nominate For Election',
//             [
//               { text: 'Cancel', style: 'cancel' },
//               { text: 'Ok', onPress: async () => navigation.navigate('Nominate Candidate', { councilID: councilId }) }
//             ]
//           );
//         }
//       } else {
//         Alert.alert('Failed to fetch members: ' + response.status);
//       }
//     } catch (error) {
//       console.error('Failed to Load Data: ' + error);
//     }
//   };

//   const getNomination = async () => {
//     try {
//       const response = await fetch(`${baseURL}election/getselectedCandidates?electionId=${electionId}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data && data.length > 0) {
//           const formattedMembers = data.map((member) => ({
//             MemberId: member.MemberId,
//             MemberName: member.MemberName,
//             PanelName: member.PanelName,
//           }));
//           setSelectedCandidates(formattedMembers);
//         } else {
//           console.log('No Nominations Found');
//         }
//       } else {
//         console.log('Failed to fetch nomination data.');
//       }
//     } catch (error) {
//       console.log('Unable to Fetch Data:', error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       getNomination();
//     }, [electionId])
//   );

//   const renderItems = ({ item }) => {
//     return (
//       <View style={styles.listItemContainer}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.candidateName}>Candidate: {item.MemberName}</Text>
//           <Text style={styles.panelName}>Panel Name: {item.PanelName}</Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => removeNomination(item.MemberId, electionId)}
//           style={styles.removeButton}
//         >
//           <Text style={styles.removeButtonText}>Remove</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   useEffect(() => {
//     getMembersName();
//   }, [councilId]);

//   return (
//     <SafeAreaView style={styles.container}>
//       <WavyBackground />
//       <View style={styles.cont}>
//         <Text style={styles.titleText}>Create Nominations for the {electionName}</Text>
//         <TextInput style={styles.input} placeholder="Enter Panel Name" keyboardType='default' onChangeText={setPanel} placeholderTextColor="#000" />
        
//         <View style={styles.setText}>
//           <Text style={styles.candidateText}>Choose Candidate</Text>
//           <Dropdown
//             data={membersName}
//             style={styles.dropDown}
//             maxHeight={200}
//             labelField="label"
//             valueField="value"
//             placeholder="Select a candidate"
//             placeholderTextColor="black"
//             value={candidateId}
//             onChange={(item) => {
//               setCandidateId(item.value);
//             }}
//             renderItem={(item) => (
//               <ScrollView>
//                 <Text style={{ color: 'black', fontSize: 17, padding: 15 }}>{item.label}</Text>
//               </ScrollView>
//             )}
//           />
//         </View>
        
//         <TouchableOpacity style={styles.signInButton} onPress={nominateCandidate} disabled={loading}>
//           {loading ? (
//             <ActivityIndicator size="small" color="#000" />
//           ) : (
//             <Text style={styles.signInButtonText}>Create Nomination</Text>
//           )}
//         </TouchableOpacity>
        
//         <DividerLine style={styles.line} />  
        
//         <FlatList
//           style={{ marginTop: 20 }}
//           data={selectedCandidates}
//           renderItem={renderItems}
//           keyExtractor={(item) => item.MemberId.toString()}
//           ListEmptyComponent={<Text style={{ color: 'black' }}>No Nomination Made!</Text>}
//         />
//       </View>
      
//       <View style={styles.footerContainer}>
//         <Image
//           source={require('../../assets/Footer.png')}
//           style={[styles.footer, { width: width }]}
//           resizeMode="stretch"
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   // other styles...
//   listItemContainer: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   candidateName: {
//     color: 'black',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   panelName: {
//     color: 'gray',
//     fontSize: 14,
//   },
//   removeButton: {
//     padding: 10,
//     backgroundColor: '#333',
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   removeButtonText: {
//     color: 'white',
//   },
//   container: {
//         flex: 1,
//         padding: 20,
//         backgroundColor: '#fff',
//       },
//       cont:{
//         marginTop: 60,
//         justifyContent:'center',
//         alignItems:'center',
//         //flex: 1
//       },
//       setText:{
//         marginTop: 5,
//         flexDirection: 'row',
//         alignItems: 'center'
//       },
//       candidateText:{
//         justifyContent: 'center',
//         alignItems: 'center',
//         color: 'black',
//         padding: 10,
//         fontSize: 15,
//       },
//       dropDown :{
//         width: '40%',
//         padding: 15,
//         borderRadius: 25,
//         backgroundColor: '#F8F9FA',
//         marginBottom: 5,
//         color : '#000',
//         fontSize: 5
//       },
//       signInButton: {
//         width: '50%',
//         padding: 15,
//         borderRadius: 25,
//         backgroundColor: '#f5d8a0',
//         alignItems: 'center',
//         marginTop: 20,
//         marginBottom: 10,
//       },
//       signInButtonText: {
//         color: '#000',
//         fontWeight: 'bold',
//       },
//       titleText: {
//         bottom : 50,
//         color: 'black',
//         margin: 10,
//         fontSize: 30,
//         textAlign: 'center',
//       },
     
//       footerContainer: {
//         position: 'absolute',
//         bottom: 0, 
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: -1,
//       },
//       input: {
//         width: '90%',
//         padding: 15,
//         borderRadius: 15,
//         backgroundColor: '#F8F9FA',
//         marginBottom: 10,
//         color : 'black',
//       },
// });

