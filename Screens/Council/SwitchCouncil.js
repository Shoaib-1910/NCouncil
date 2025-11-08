import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet, 
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image,
} from 'react-native';
import WavyBackground2 from '../../Background/WavyBackground2';
import baseURL, { baseImageURL }  from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SwitchCouncil({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { councilName, memberId, councilId } = route.params;
  const [councils, setCouncils] = useState([]);
  const [filteredCouncils, setFilteredCouncils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [councilLink, setCouncilLink] = useState('')
  const [memberID, setMemberID] = useState(null);
  const [phoneNo, setPhoneNo] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [gender, setGender] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [address, setAddress] = useState(null);
  const [dateJoined, setDateJoined] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setMemberID(userData.memberId);
        setPhoneNo(userData.phoneNo);
        setFullName(userData.fullName);
        setGender(userData.gender);
        setDateOfBirth(userData.dateOfBirth);
        setProvince(userData.province);
        setCity(userData.city);
        setAddress(userData.address);
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

  // useEffect(() => {
  //   fetchCouncils();
  // }, [councilId]);


const checkAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth); // Convert string to Date object
  const today = new Date(); // Get current date

  const age = today.getFullYear() - dob.getFullYear();

  // Adjust age if birthdate hasn't occurred yet this year
  const hasBirthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  const finalAge = hasBirthdayPassed ? age : age - 1;

  console.log("Age:", finalAge);

  return finalAge;
};

useEffect(() => {
//  const dateOfBirth = "2005-06-15"; // Replace with the actual date
  const age = checkAge(dateOfBirth);
  if (age >= 18) {
    console.log("User is an adult.");
  } else {
    console.log("User is a minor.");
  }
}, [dateOfBirth]);

  const fetchCouncils = async () => {
    try {
      const response = await fetch(`${baseURL}Council/GetAllCouncils?memberId=${memberId}`);
      const result = await response.json();

      if (response.ok) {
        setCouncils(result);
        setFilteredCouncils(result);
      } else {
        Alert.alert('Failed to fetch councils', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching councils:', error);
      Alert.alert('Error', 'Failed to load councils.');
    } finally {
      setLoading(false); // Uncommented to ensure loading state is updated
    }
  };
  

  const switchCouncil = async (newCouncilId) => {
    try {
      const response = await fetch(`${baseURL}Council/switchCouncil?OldCouncilId=${councilId}memberId=${memberId}&NewCouncilId=${newCouncilId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
    }
        );
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Council switched successfully!', 'Now you will be redirected to Home.');
        navigation.navigate('HomeScreen', { memberID: memberId })
      } else if(response.status == 401) {
        Alert.alert('Error', 'You have Uncleared Due Payments in this Council. Please clear dues before switching.');
      }
      else{
        console.log('Failed to switch council:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching councils:', error);
      Alert.alert('Error', 'Failed to load councils.');
    } finally {
      setLoading(false); // Uncommented to ensure loading state is updated
    }
  };
  const SwitchCouncilUsingJoinCode = async () => {
    if(!councilLink){
      Alert.alert('Please Enter Code to Join Council.')
      return;
    }
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch(`${baseURL}Council/SwitchCouncilUsingCode?councilId=${councilId}&memberId=${memberId}&joinCode=${councilLink}`, {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (response.ok) {
        console.log(JSON.stringify(json));
        Alert.alert('Council added successfully!', 'Now you will be redirected to Home.', 
          [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen', { member: memberId })}]);
      } 
      else if( response.status == 403) {
        Alert.alert(json)
      } 
      else if( response.status == 409) {
        Alert.alert(json)
      }
      else{
        Alert.alert(json);
      }
    } catch (error) {
      Alert.alert('Error', 'No Councils Associated with this Code');
    }
    setLoading(false)
  };

  // const handleSearch = (query) => {
  //   setSearchQuery(query);
  //   const filtered = councils.filter((council) =>
  //     council.Name.toLowerCase().includes(query.toLowerCase())
  //   );
  //   setFilteredCouncils(filtered);
  // };

  // const handleSwitchCouncil = (newCouncilId, councilName) => {
  //   Alert.alert(
  //     'Switching Council',
  //     `Are you sure you want to switch to "${councilName}"?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Yes', onPress: () => switchCouncil(newCouncilId) },
  //     ]
  //   );
  // };

  // const renderCouncilItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.councilItem}
  //     onPress={() => handleSwitchCouncil(item.id, item.Name)}
  //   >
  //     {item.DisplayPictureUrl && (
  //       <Image
  //         source={{ uri: `${baseImageURL}${item.DisplayPictureUrl}` }} // Fixed variable reference
  //         style={styles.councilImage} // Corrected style name
  //         resizeMode="cover"
  //       />
  //     )}
  //     <View style={styles.councilDetails}>
  //       <Text style={styles.councilName}>{item.Name ? String(item.Name) : 'Unnamed Council'}</Text>
  //       <Text style={styles.councilDescription}  ellipsizeMode="tail" numberOfLines={2}>
  //         {item.Description ? String(item.Description) : 'No Description Available'}
  //       </Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <View style={styles.contentContainer}>
      <Text style={styles.header}>Switch Council</Text>
      {/* <Text style={styles.header}>Switch Council {checkAge(dateOfBirth)}</Text> */}
        <Text style={styles.currentCouncilText}>
          Current Council: {councilName ? String(councilName) : 'N/A'}
        </Text>
        <TextInput style={styles.input} placeholder="Enter Code Here!" onChangeText={setCouncilLink} placeholderTextColor="#0007" />
        <TouchableOpacity style={styles.button} onPress={SwitchCouncilUsingJoinCode} disabled={loading}>
          {loading ? (
            <ActivityIndicator size={'small'} color={'#000'}/>
          ):(
            <Text style={styles.buttonText}>Swap Existing Council</Text>
          )}  
          </TouchableOpacity>
        {/* <TextInput
          style={styles.searchInput}
          placeholder="Search councils..."
          placeholderTextColor="#000"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
            <View style={styles.contentContainer2}>
          <FlatList
            data={filteredCouncils}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCouncilItem}
            contentContainerStyle={styles.councilList}
          />
          </View>
        )} */}
      </View>
      <View style={styles.footerContainer}>
        <Image source={require('../../assets/Footer.png')} style={styles.footerImage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  currentCouncilText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
    color: 'black',
  },
  councilList: {
    paddingBottom: 10,
  },
  contentContainer2:{
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  councilItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5d8a0',
    marginBottom: 10,
  },
  councilImage: { // Correct style name referenced here
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  councilDetails: {
    flex: 1,
  },
  councilName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  councilDescription: {
    fontSize: 14,
    color: '#000',
  },
  button: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    marginTop: 50,
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  footerImage: {
    width: '100%',
    resizeMode: 'stretch',
  },
});