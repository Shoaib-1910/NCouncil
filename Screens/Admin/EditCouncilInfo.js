import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  useWindowDimensions, 
  View 
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import WavyBackground2 from '../../Background/WavyBackground2';

export default function EditCouncilInfo({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const [name, setName] = useState('');
  const {Name, Desc, councilId, memberId} = route.params;
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock current council data (replace with actual data fetching logic)
  useEffect(() => {
    const fetchCouncilInfo = async () => {
      // Simulate API call to fetch council data

      setName(Name);
      setDesc(Desc);
    };

    fetchCouncilInfo();
  }, []);

const updateCouncil = async () => {
    try {
      const response = await fetch(`${baseURL}Council/UpdateCouncil?councilId=${councilId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: name,
          Description: desc,
        }),
    }
        );
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Council Updated successfully!', 'Now you will be redirected to Home.');
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

  const handlePress = () => {
    if (!Name || !Desc) {
      Alert.alert('Please Enter the Name & Description Of Council!');
      return;
    } 
    Alert.alert(
      'Are you sure?',
      'Do you want to Update Council Info?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: updateCouncil,
        },
      ]
    );
  };
  // const handleSave = async () => {
  //   setLoading(true);

  //   // Simulate saving the updated council data
  //   try {
  //     const updatedCouncilData = {
  //       name,
  //       description: desc,
  //     };

  //     console.log('Saving council data:', updatedCouncilData);
  //     // Perform API call here
  //     // await updateCouncilAPI(updatedCouncilData);

  //     alert('Council information updated successfully!');
  //   } catch (error) {
  //     console.error('Error updating council information:', error);
  //     alert('Failed to update council information.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Edit Council Info</Text>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image 
              source={require('../../assets/group.png')} 
              style={styles.image}
            />
          </View>
        </View>
        
        <TextInput 
          style={styles.input} 
          selectionColor={'#f5d8a0'} 
          placeholder="Name" 
          keyboardType="default" 
          value={name}
          onChangeText={setName} 
          placeholderTextColor="#000" 
        />
        <TextInput 
          style={styles.description} 
          placeholder="Description" 
          multiline={true}
          numberOfLines={5} 
          selectionColor={'#f5d8a0'}
          textAlignVertical="top" 
          keyboardType="default"
          value={desc}
          onChangeText={setDesc} 
          placeholderTextColor="#000" 
        />
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={handlePress} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.signInButtonText}>✔ Save</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footerContainer}>
        <Image 
          source={require('../../assets/Footer.png')} 
          style={[styles.footer, { width: width }]} 
          resizeMode="stretch" 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  header: {
    color: 'black',
    marginBottom: 10,
    fontSize: 30,
    bottom: 40,
    fontWeight: '400',
  },
  image: {
    height: 100,
    width: 100,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  description: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    height: 150,
    textAlignVertical: 'top',
  },
  signInButton: {
    width: '85%',
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
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
