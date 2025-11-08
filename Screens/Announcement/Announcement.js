import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Alert, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, ActivityIndicator } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { FAB, IconButton, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  baseURL  from '../Api';
import { useFocusEffect } from '@react-navigation/native';


export default function Announcement({navigation, route }) {
  const { width } = useWindowDimensions();
  const { councilId } = route.params;
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);


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

  // Function to fetch announcements data
  const fetchAnnouncements = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve,1500))
    try {
      const response = await fetch(
        `${baseURL}Announcement/getAnnouncementsForCouncil?councilId=${councilId}`
      );
      if (response.ok) {
        const data = await response.json(); 
  
        if (data && data.length > 0) {
          
          const annData = data.map((ann) => ({
            AnnouncementId: ann.AnnouncementId,
            Title: ann.Title,
            Description: ann.Description,
            Date: ann.Date,
            MemberName: ann.AddedBy, 
            RoleName: ann.RoleName, 
          }));
  
          setAnnouncements(annData);
        } else {
          setAnnouncements([])
          console.log('No announcements Found');
        }
      } else {
        setAnnouncements([])
        console.log("No Announcements found.");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };


  const handleDeleteAnnouncement = async (memberId, councilId) => {
    try {
    } catch (error) {
    }
  };

  useFocusEffect(
    useCallback(()=>{
      fetchAnnouncements()
    } , [memberId, councilId])
  )

  // useEffect(() => {
  //   fetchAnnouncements();
  // }, );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.metaData}>
                    ⁓ {item.MemberName} ({item.RoleName}) | Date: {new Date(item.Date).toDateString()}
                  </Text>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Announcements</Text>
      </View>
    <View style={styles.contentContainer}>
            <FlatList
              data={announcements}
              keyExtractor={(item) => item.AnnouncementId.toString()}
              renderItem={renderItem}
              refreshing={loading}
             onRefresh={fetchAnnouncements}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={{color: 'black', textAlign : 'center', fontSize : 17}}>No Announcements Found!</Text>
              }
            />
          </View>
      <FAB
            style={styles.fab}
            color = '#F0C38E'
            icon={'plus'} // Switch between plus and close icon
            onPress={ () => navigation.navigate('AddAnnouncement', { memberID: memberId, councilId : councilId })}
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
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 20,
    color: '#000',
    marginBottom: 30,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 80,
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
    marginBottom : 10,
  },
  metaData: {
    fontSize: 12,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#555',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
