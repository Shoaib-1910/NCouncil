import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground from '../Background/WavyBackground';

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const [memberId, setMemberId] = useState(null);
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
        setMemberId(userData.memberId);
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

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={[styles.header, {top: 100} ]}>User Profile</Text>
      <View style={styles.profileContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{fullName || 'User Name'}</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{phoneNo}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{gender === 'M'? 'Male' : 'Female'}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{new Date(dateOfBirth).toDateString()}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Province:</Text>
              <Text style={styles.value}>{province}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{city}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{address}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Date Joined:</Text>
              <Text style={styles.value}>{new Date(dateJoined).toDateString()}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Image
        source={require('../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
        resizeMode="stretch"
      />

      <FAB
        style={styles.fab}
        color="#000"
        icon="pencil"
        onPress={{}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background for freshness
    padding: 10,
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#f5d8a0', 
  },
});
