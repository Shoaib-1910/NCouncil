import React, { useEffect, useState } from 'react';
import { Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View, Alert } from 'react-native';
//import WavyBackground from '../Background/WavyBackground';
import DividerLine from '../../Background/LineDivider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground2 from '../../Background/WavyBackground2';
import baseURL  from '../Api';

export default function AdminScreen ({ route }) {
  const { width } = useWindowDimensions(); // screen width
  const navigation = useNavigation();
  const [councilData , setCouncilData] = useState({});
  const [membersCount, setMembersCount] = useState(0);
  const { Council, role} = route.params;
  const [memberId, setMemberId] = useState(null);
  const [phoneNo, setPhoneNo] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [gender, setGender] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [address, setAddress] = useState(null);
  const [password, setPassword] = useState(null);
  const [dateJoined, setDateJoined] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setMemberId(userData.memberId);
        setPhoneNo(userData.phoneNo);
        setFullName(userData.fullName);
        setGender(userData.gender);
        setDateOfBirth(userData.dateOfBirth);
        setProvince(userData.province);
        setCity(userData.city);
        setAddress(userData.address);
        setPassword(userData.password);
        setDateJoined(userData.dateJoined);
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

  
  const checkPanelTenure = async (councilId) => {
    try {
        const response = await fetch(`${baseURL}election/SetPanelMembersToMember?councilId=${councilId}`);
        const data = await response.json();

        if (response.ok) {
            console.log("Panel tenure check:", data);
            return { isTenureComplete: true, message: data };
        } else {
            console.log("Panel tenure not completed:", data);
            return { isTenureComplete: false, message: data };
        }
    } catch (error) {
        console.error("Error checking panel tenure:", error);
        return { isTenureComplete: false, message: "Error checking tenure" };
    }
};

useEffect(() => {
  const interval = setInterval(async () => {
      const result = await checkPanelTenure(Council);
      if (result.isTenureComplete) {
          console.log("Tenure is completed. You can initiate a new election.");
      } else {
          console.log(result.message);
      }
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval); // Cleanup interval on unmount
}, []);


  const getCouncilData = async () => {
    try {
      const response = await fetch(`${baseURL}Council/GetCouncil?councilId=${Council}`);
      if (response.ok) {
        const json = await response.json();
        console.log(json)
        setCouncilData(json);
      } else {
        Alert.alert('Error', 'Failed to load data');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while loading data');
    }
  };


  const getCouncilMemberCount = async () => {
    try {
      const response = await fetch(`${baseURL}Council/CountCouncilMembers?councilId=${Council}`);
      if (response.ok) {
        const json = await response.json();
        console.log(json);
        setMembersCount(json.MemberCount);  // Extract MemberCount from the response
      } else {
        Alert.alert('Error', 'Failed to load data');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while loading data');
    }
  };

  useEffect(() => {
    getCouncilData();
    getCouncilMemberCount();
  }, []);

  useEffect(() => {
    if (councilData) {
      console.log('Council Data updated:', councilData);
      console.log('Council Members:', membersCount);
    }
  }, [councilData]);

return (
  <SafeAreaView style={styles.container}>
    <WavyBackground2/>
    <Text style={styles.name}>{councilData?.Name || 'Loading...'}</Text>
    <Text style={styles.memberCount}>Members: {membersCount}</Text>
    {/* Invite Resident */}
    <View style={styles.iconRow}>
      <TouchableOpacity onPress={() => navigation.replace('Invite Resident', { councilId: Council })}>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/JoinLink.png')} style={styles.icon} />
        <Text style={styles.iconLabel}>Invite</Text>
      </View>
      </TouchableOpacity>
      {/* Announcement Icon */}
      <TouchableOpacity onPress={() => navigation.replace('Announcement', {councilId: Council})}>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/announcement.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>Announce</Text>
        </View>
      </TouchableOpacity>
      {/* Election Icon */}
    <TouchableOpacity onPress={() => navigation.replace('Administrate Election', { councilId: Council })}>
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/election.png')} style={styles.icon} />
        <Text style={styles.iconLabel}>Election</Text>
      </View>
    </TouchableOpacity>
  </View>

  <DividerLine />
  <Text style={styles.desc}>{councilData?.Description || 'Loading...'}</Text>
  <DividerLine />

  <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('EditCouncilInfo', { councilId: Council, Name: councilData?.Name, Desc: councilData?.Description, memberId: memberId })}>
    <Text style={styles.signInButtonText}>Edit Community Info</Text>
  </TouchableOpacity>
  {/* <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('ManageMembers', { councilId: Council })}>
    <Text style={styles.signInButtonText}>Manage Members</Text>
  </TouchableOpacity> */}
  <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('ReportProblem', { councilId: Council })}>
    <Text style={styles.signInButtonText}>Report Problem</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.signInButton} onPress={() => {navigation.navigate('Meeting', {councilId : Council, memberId : memberId})}}>
    <Text style={styles.signInButtonText}>Meetings</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.signInButton} onPress={() => {navigation.navigate('ViewIssues', {role , councilId : Council, memberId : memberId})}}>
    <Text style={styles.signInButtonText}>Complaints</Text>
  </TouchableOpacity>


</SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20, 
    alignItems: 'center',
  },
  name: {
    color: 'black',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 20,
  },
  memberCount: {
    color: 'gray',
    fontSize: 16,
    marginBottom: 30, 
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 60,
    width: 60,
    marginBottom: 5, 
    backgroundColor: '#f5d8a0',
    borderRadius: 10,
  },
  iconLabel: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
    textAlign: 'center',
    width: 80, 
  },
  desc: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
    marginVertical: 15,
  },
  signInButton: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginVertical: 10,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },

});