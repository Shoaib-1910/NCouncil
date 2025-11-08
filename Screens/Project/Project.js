import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Alert, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { FAB, IconButton, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  baseURL  from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import WavyBackground2 from '../../Background/WavyBackground2';


export default function Project({navigation, route }) {
  const { width } = useWindowDimensions();
  const { councilId } = route.params;
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData && userData.memberId) {
        setMemberId(userData.memberId);
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

//   // Function to fetch announcements data
//   const fetchAnnouncements = async () => {
//     try {
//       const response = await fetch(`${baseURL}announcement/getAnnouncements?memberId=${memberId}&councilId=${councilId}`);
//       const json = await response.json();

//       if (response.ok) {
//         if (json && json.length > 0) {
//           const annData = json.map((ann) => ({
//             AnnouncementId: ann.AnnouncementId,
//             Title: ann.Title,
//             Description: ann.Description,
//             Date : ann.Date
//           }));
//           console.log('Announcements Loaded')
//           setAnnouncements(annData);
//         } else {
//           setAnnouncements([])
//           console.log('No announcements Found');
//         }
//       } else {
//         console.log("No Announcements found.");
//       }
//     } catch (error) {
//       console.error("Error fetching announcements:", error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleDeleteAnnouncement = async (memberId, councilId) => {
//     try {
//       const response = await fetch(`${baseURL}Contact/deletecontact?id=${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         loadContacts();
//       } else {
//         Alert.alert('Error', 'Failed to delete contact');
//       }
//     } catch (error) {
//       console.error('Error deleting contact:', error);
//     }
//   };

//   useFocusEffect(
//     useCallback(()=>{
//       fetchAnnouncements()
//     } , [memberId, councilId])
//   )

  // useEffect(() => {
  //   fetchAnnouncements();
  // }, );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.date}>{new Date(item.Date).toDateString()}</Text>
     
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Projects</Text>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={()=>{navigation.navigate('ManageProjects', {councilID: councilId, memberID: memberId})}}>
          <Text style={styles.signInButtonText}>Manage Project</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={()=>{navigation.navigate('ProjectDetails' , {councilID: councilId, memberID: memberId})}}>
            <Text style={styles.signInButtonText}>Project Details</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.signInButton} onPress={()=>{navigation.navigate('ProjectLogs' , {councilID: councilId})}}>
            <Text style={styles.signInButtonText}>Project Logs</Text>
        </TouchableOpacity> */}

    {/* {loading ? (
      <ActivityIndicator size="large" color="#0000ff" style={{justifyContent: 'center'}} />
      ) : (
    <View style={styles.contentContainer}>
            <FlatList
              data={announcements}
              keyExtractor={(item) => item.AnnouncementId.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => {
                <Text style={{color: 'black'}}>No Announcement Found, Try Adding One from the Plus Icon.</Text>
              }}
            />
          </View>
      )} */}
      
      <FAB
            style={styles.fab}
            color = {'#F0C38E'}
            icon={'plus'} // Switch between plus and close icon
            onPress={ () => navigation.navigate('AddProject', { memberID: memberId, councilId : councilId })}
          />
      <Image
        source={require('../../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent : 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent : 'center',
    alignContent : 'center',
    marginTop: 0,
    marginBottom: 20,
    bottom: 50,
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 30,
    color: '#000',
    marginBottom: 55,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContainer: {
    alignItems : 'center',
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width : '90%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft : 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#555',
  },
  signInButton: {
    top: 20,
    width: '90%',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
