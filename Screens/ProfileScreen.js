import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground from '../Background/WavyBackground';

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const [userData, setUserData] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchLoginHistory();
  }, []);

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      if (jsonValue != null) {
        setUserData(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Fetch last 10 login history records
  const fetchLoginHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('loginHistory');
      if (history) setLoginHistory(JSON.parse(history));
    } catch (error) {
      console.error('Failed to fetch login history:', error);
    }
  };

  // Edit Profile handler (placeholder)
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'This feature can be implemented later.');
  };

  // Show AsyncStorage contents (debugging helper)
  const showAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage contents:', stores);
      Alert.alert('AsyncStorage Data', JSON.stringify(stores, null, 2));
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={[styles.header, { top: 100 }]}>User Profile</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <View style={styles.profileContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{userData?.fullName || 'User Name'}</Text>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{userData?.phoneNo || '-'}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>
                  {userData?.gender === 'M' ? 'Male' : userData?.gender === 'F' ? 'Female' : '-'}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>
                  {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toDateString() : '-'}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Province:</Text>
                <Text style={styles.value}>{userData?.province || '-'}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{userData?.city || '-'}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{userData?.address || '-'}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>Date Joined:</Text>
                <Text style={styles.value}>
                  {userData?.dateJoined ? new Date(userData.dateJoined).toDateString() : '-'}
                </Text>
              </View>

              {/* Login History */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Login History</Text>
                {loginHistory.length === 0 ? (
                  <Text>No login history available</Text>
                ) : (
                  loginHistory.map((item, index) => (
                    <View key={index} style={styles.infoContainer}>
                      <Text style={styles.label}>{new Date(item.timestamp).toLocaleString()}</Text>
                      <Text style={styles.value}>{item.ip} ({item.device})</Text>
                    </View>
                  ))
                )}
              </View>
            </Card.Content>
          </Card>
        </View>
           <TouchableOpacity style={styles.debugButton} onPress={showAsyncStorage}>
                  <Text style={styles.debugButtonText}>Show AsyncStorage Log</Text>
                </TouchableOpacity>
      </ScrollView>

      <Image
        source={require('../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
        resizeMode="stretch"
      />

      {/* FAB for Edit */}
      <FAB
        style={styles.fab}
        color="#000"
        icon="pencil"
        onPress={handleEditProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  profileContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  header: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: 'black' },
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
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 15, textAlign: 'center' },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 16, color: '#000', fontWeight: '600' },
  value: { fontSize: 16, color: '#000' },
  footer: { position: 'absolute', bottom: 0, zIndex: -1 },
  fab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#f5d8a0' },
});
