import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { Dropdown } from 'react-native-element-dropdown';
import baseURL from '../Api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DividerLine from '../../Background/LineDivider';
import WavyBackground2 from '../../Background/WavyBackground2';

export default function NominatePanel ({route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
  const {councilId} = route.params;
  const [membersName, setMembersName] = useState([]);
  const [candidateId, setCandidateId] = useState(0)
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [roles] = useState([
    {value : 3, label : 'Councillor'},
    {value : 4, label : 'Treasurer'},
    {value : 6, label : 'Secretary'},
  ]);

  const [roless] = ['Councillor', 'Treasurer', 'Secretary']
  const [roleId, setRoleId] = useState(0);
  const [panel, setPanel] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState([]);

  const openRoleModal = (member) => {
    setSelectedMember(member);
    setIsModalVisible(true);
  };

  const assignRole = (role) => {
    setSelectedMembers((prev) => [
      ...prev,
      { ...selectedMember, role },
    ]);
    setIsModalVisible(false);
  };

  const addPanelMember = (member) => {
    if(selectedMembers.length >= 5){
        Alert.alert('You can only choose upto 5 members')
        return;
    }
    if (!selectedMembers.some((m) => m.value === member.value)) {
      setSelectedMembers((prev) => [...prev, member]); // Add member to selected list
    }
  };

  const removePanelMember = (memberValue) => {
    setSelectedMembers((prev) => prev.filter((m) => m.value !== memberValue)); // Remove member by value
  };

  const [memberName, setMemberName] = useState('')
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.memberId) {
          setMemberId(userData.memberId);
          setMemberName(userData.fullName)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const [panelFound, setPanelFound] = useState(false)
  const setUpPanel = async() => {
    if(!panel){
      Alert.alert('Please Fill All Fields!')
      return;
    }
    // if(selectedMembers.length < 2)
    // {
    //     Alert.alert('Please Select upto 2 panel Members!')
    //     return;
    // }
    const payload = { 
      CandidateId : memberId,
      panelMembers : selectedMembers.map(({ value, role }) => ({ MemberId: value, Role: role })),
      PanelName : panel,
      councilId : councilId,
      MemberId : memberId
    }
    console.log(payload)
    setLoading(true)
    try{
      await new Promise(resolve => setTimeout(resolve, 2000))
        const response = await fetch(`${baseURL}election/NominateCandidateForPanel`, {
          method : 'POST',
          headers : {
            'Content-Type': 'application/json'
          }
          , body : JSON.stringify(payload)
        })
        const json = await response.json()
        if(response.ok){
          Alert.alert('Panel Nominated Successfully!')
          setPanel('');
          setCandidateId(0);
          setSelectedMembers([]);
          getMembersName();
          setPanelFound(true)
          getNomination();
        }
        else{
          Alert.alert('Failed to Nominate Panel')
          console.log(json)
        }
    }
    catch(error){
      console.log('Unable to Nominate Panel')
    }
    setLoading(false)
  }


  useEffect(() => {
    getMembersName();
    getNomination();
  }, [memberId, councilId, panelFound])


const getNomination = async () => {
  try {
    console.log('Fetching Nominations...');
    const response = await fetch(`${baseURL}election/ShowNominationByMember?memberId=${memberId}&councilId=${councilId}`);

    console.log('Raw Response:', response);

    if (response.ok) {
      console.log('Response Status OK');
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Parsed Data:', data);

        if (data && data.length > 0) {
          // Transform API response into FlatList-friendly structure
          const flatListData = data.map((candidate) => ({
            CandidateId: candidate.CandidateId,
            CandidateName: candidate.CandidateName,
            PanelName: candidate.PanelName,
            PanelMembers: candidate.PanelMembers.map((member) => ({
              MemberId: member.MemberId,
              MemberName: member.MemberName,
              MemberRole: member.MemberRole
            })),
          }));
          setPanelFound(data.length > 0)
          console.log('Transformed Data for FlatList:', flatListData);

          setSelectedCandidates(flatListData); // Save data for FlatList
        } else {
          console.log('No Nominations Found');
          setSelectedCandidates([]); // No data case
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

//Remove Nomination for election
const removeNomination = async(candidateId) =>{

  const payload = {
    CandidateId : candidateId,
    CouncilId : councilId
  }
  try{
    const response = await fetch(`${baseURL}election/RemoveCandidateForPanel`,
     {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify(payload)
    },
    )
    const result = await response.json()
    if(response.ok){
      Alert.alert('Nomination Removed')
      console.log('Nomination Removed Successfully')
      await new Promise(resolve => setTimeout(resolve, 1000))
      getMembersName()
      getNomination()
      setPanelFound(false)
    }
    else{
      console.log('Failed to set Candidate to user'+ response.status)
    }
  }
  catch(error){
    console.log('Error','Unable to fetch Data')
  }
}

const renderCandidate = ({ item }) => (
 <View style={{
       alignItems: 'center',
       paddingVertical: 10,
       paddingHorizontal: 5,
       borderBottomWidth: 1,
       borderBottomColor: 'gray',
       
     }}>
    <Text style={styles.candidateName}>Candidate: {item.CandidateName}</Text>
    <Text style={styles.panelName}>Panel Name: {item.PanelName}</Text>
    <View style={{ flexDirection: 'row', marginBottom : 10 }}>
    <Text style={styles.membersHeading}>Panel Members:</Text>
    <View>
    {item.PanelMembers.map((member) => (
      <Text key={member.MemberId} style={styles.memberName}> {member.MemberName} ⁓{member.MemberRole}, 
      </Text>
    ))}
    </View>
    </View>
    <TouchableOpacity
            onPress={() => removeNomination(item.CandidateId, councilId)}
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
                   navigation.goBack();
                  },
                },
              ]
            );  
          }
        } else {
          Alert.alert(
            'No Members Found',
            'Add New Members to Nominate ',
            [
              {
                text: 'View Nominations',
                style : 'cancel',
              },
              {
                text: 'Go Back',
                onPress: async () => {
                 navigation.goBack();
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

  const fetchRole = (role) =>{
    if(role === 3){
      return 'Councillor'
    }
    else if(role === 4){
      return 'Treasurer'
    }
    else{
      return 'Secretary'
    } 
  }

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 /> 
      <View style={styles.cont}>
      <Text style={styles.titleText}>Setup your Panel</Text>
   {panelFound? (
            <Text style={{color: 'black', fontSize: 17, marginTop: 170, bottom: 100}}>Nomination Have been Made!</Text>
          ):(
            <>
            <TextInput style={styles.input} placeholder="Enter Panel Name" keyboardType='default' onChangeText={setPanel} placeholderTextColor="#000" />
      {/* <FlatList
          data={membersName}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()} 
          ListEmptyComponent={<Text style={{color: 'black'}}>No members found</Text>}
        /> */}
        <View style={styles.setText}>
        <Text style={styles.candidateText}>
          Create your Panel{'\n'}
          <Text>as a Chairman{'\t\t\t\t\t\t'}</Text>
        </Text>

       {/* <Dropdown
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
          removePanelMember(it;ggem.value)
        }}
        renderPlaceholder={() => (
          <Text style={{ color: '#fff' }}>Select Candidate</Text>
       )}
        renderItem={(item) => (
          <ScrollView>
            <Text style={{ color: 'black', fontSize: 17, padding: 15 }}>{item.label}</Text>
          </ScrollView>
        )}
      /> */}
      <View style={styles.submitButton2}>
        <Text style={styles.buttonText2}>{memberName}</Text>
      </View>
      </View>
       <View style={styles.setText}>
        <Text style={styles.candidateText}>Choose Panel Members</Text>
        <Dropdown
          data={membersName.filter(
            (member) =>
              member.value !== memberId &&
              !selectedMembers.some((m) => m.value === member.value)
          )}
          style={styles.dropDown}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholderTextColor="#000"
          placeholder="Select Panel Members"
          onChange={(item) => openRoleModal(item)}
          renderPlaceholder={() => (
            <Text style={{ color: '#333' }}>Select Panel Members</Text>
          )}
          renderItem={(item) => (
            <ScrollView>
              <Text style={{ color: 'black', fontSize: 17, padding: 15 }}>
                {item.label}
              </Text>
            </ScrollView>
          )}
        />
      </View>

      {/* Modal for Role Selection */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Assign Role to {selectedMember?.label || 'Unknown Member'}
            </Text> 
            <FlatList
              data={roles}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roleOption}
                  onPress={() => assignRole(item.value)}
                >
                  <Text style={styles.roleText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>


      {/* Display Selected Panel Members with Remove Option */}
      <View style={styles.selectedMembersContainer}>
        {selectedMembers.map((member) => (
          <View key={member.value} style={styles.memberChip}>
            <Text style={styles.memberName}>{member.label}  ⁓ {fetchRole(member.role)}</Text>
            <TouchableOpacity onPress={() => removePanelMember(member.value)}>  
              <Text style={styles.removeText}>✖</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={setUpPanel}>
        {loading ? (
          <ActivityIndicator color={'black'} size={'small'}/>
        ):(
          <Text style={styles.buttonText}>Submit Panel</Text>
        )}
      </TouchableOpacity>
      </>
          )}
      
      <DividerLine/>
       <FlatList
                style={{marginTop:5, marginBottom : 70}}
                data={selectedCandidates}
                renderItem={renderCandidate}
                keyExtractor={(item) => item.CandidateId.toString()}
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
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  titleText: {
    color: 'black',
    top : 50,
    marginBottom: 90,
    fontSize: 30,
    textAlign: 'center',
  },
  cont: {
    flex : 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom : 0
  },
  input: {
    width: '90%',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
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
  selectedMembersContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 10,
    marginLeft: 20,
    marginBottom : 5 
    },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  memberName: { 
    color: 'black', 
    marginRight: 10,
    },
  removeText: { 
    marginLeft: 5,
    color: 'red', 
    fontWeight: 'bold', 
    fontSize: 16 
    },
  submitButton: { 
    backgroundColor: '#f5d8a0', 
    padding: 17,
    width: '50%', 
    borderRadius: 20 
    },
  buttonText: { 
    color: '#000', 
    fontWeight: 'bold', 
    textAlign: 'center',
    fontSize: 16
    },
    submitButton2: { 
      backgroundColor: '#222', 
      padding: 17,
      width: '40%', 
      borderRadius: 20,
      marginBottom: 10, 
      },
    buttonText2: { 
      color: '#ffffff', 
      fontWeight: 'bold', 
      textAlign: 'center',
      fontSize: 16
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

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color : 'black'
  },
  roleOption: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  roleText: {
    color : 'black',
    fontSize: 16,
  },
  candidateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color : 'black'
  },
  panelName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  membersHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color : 'black'
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
  },
});
