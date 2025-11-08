import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../Background/WavyBackground';
const screenWidth = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from './Api'

export default function SecretaryScreen ({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const {Council, councilName, councilDescription, role} = route.params;
  
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
  const [AnnouncementsData, setAnnouncementsData] = useState([])
  const [menuVisible, setMenuVisible] = useState(false);
 
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const [menuVisible2, setMenuVisible2] = useState(false);
 
  const openMenu2 = () => setMenuVisible2(true);
  const closeMenu2 = () => setMenuVisible2(false);


  const [menuVisible3, setMenuVisible3] = useState(false);
 
  const openMenu3 = () => setMenuVisible3(true);
  const closeMenu3 = () => setMenuVisible3(false);

  
  const [menuVisibleForReportProblem, setMenuVisibleForReportProblem] = useState(false);
  
  const openMenu5 = () => setMenuVisibleForReportProblem(true);
  const closeMenu5 = () => setMenuVisibleForReportProblem(false);
  
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

  const [announcementFound, setAnnouncementFound] = useState(false);

  const getAnnouncementsForResidents = async() =>{
    try{
      const response = await fetch(`${baseURL}Announcement/getAnnouncementsForCouncil?memberId=${memberId}&councilId=${Council}`)
      const data = await response.json()
      if(response.ok){
        console.log('Announcements Loaded')
        console.log(response.status)
        if (data && data.length > 0) {
          const annData = data.map((ann) => ({
            AnnouncementId: ann.AnnouncementId,
            Title: ann.Title,
            Description: ann.Description,
            Date : ann.Date,
            MemberName : ann.AddedBy,
            RoleId : ann.RoleName
          }));
          setAnnouncementFound(data.length > 0);
        setAnnouncementsData(annData)
        console.log(AnnouncementsData)
      }else{
        console.log("No Announcements Found")
      }
    }else{
      console.log('No Announcementsss Found')
    }
  }
    catch(error){
      console.log('Error Fetching Announcements'+ error)
    }
  }

  useEffect(() => {
    getAnnouncementsForResidents()
  }, [memberId, Council]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.date}>{new Date(item.Date).toDateString()}</Text>
     
    </View>
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const[notificationFound, setNotificationFound] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${baseURL}notification/GetNotifications?councilId=${Council}&memberId=${memberId}`
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Notifications Loaded Successfully!")
        setNotificationFound(data.length > 0);
        setNotifications(data); 
      } else {
        console.error("Error fetching notifications:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleReportProblemScreen = () => {
    navigation.navigate('ReportProblem', {councilId : Council, memberId : memberId})
    closeMenu5()
  }
  
  const handleProblemViewScreen = () => {
    navigation.navigate('ViewReportedProblems', { councilId: Council })
    closeMenu5()
  }
  
  const RenderNotification =  React.memo(({ item }) =>{
    return(
    <TouchableOpacity style={styles.notificationCard}>
      <Text style={styles.title1}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.CreatedAt).toDateString()}</Text>
    </TouchableOpacity>
    )
  });

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <Text>Loading notifications...</Text>
  //     </View>
  //   );
  // }
  
  return (
    <SafeAreaView style={styles.container}>
    <WavyBackground />

    {/* Header */}
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.nameText}>{fullName}<Text style={{color: 'black', fontSize: 15}}> ⁓{role}</Text></Text>

      {/* Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Announcement', {councilId: Council})}> 
        <Image
          source={
         require('../assets/notification.png')
        }
        style={styles.icon}
        />
      {announcementFound && (
        <View style={styles.badge} />
      )}
        </TouchableOpacity>

        {/* Menu Modal For Announcement*/}
      <Modal
        visible={menuVisible2}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu2}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Announcements</Text>
              <TouchableOpacity onPress={closeMenu2} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <FlatList
              data={AnnouncementsData}
              keyExtractor={(item) => item.AnnouncementId.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => {
                <Text style={{color: 'black'}}>No Announcement Found, Try Adding One from the Plus Icon.</Text>
              }}
            />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

        <TouchableOpacity onPress={openMenu}>
        <Image source={require('../assets/info.png')} style={styles.icon} />
      </TouchableOpacity>

      {/* Menu Modal For Information*/}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Information</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <Text style={{color:'black', fontWeight:'600'}}>Council Name</Text>  
          <Text style={{color:'black'}}>{councilName}</Text>
            <Text style={{color:'black', fontWeight:'600', marginTop: 20}}>Description</Text>  
            <Text style={{color:'black', textAlign : 'left'}}>{councilDescription}</Text>
            <Text style={{color:'black', fontWeight:'600', marginTop: 20}}>About the App:</Text>  
            <Text style={{color:'black', textAlign : 'left'}}>
              The app facilitates community involvement by allowing residents to report issues, form committees, and participate in democratic processes, promoting collaborative problem-solving and local governance.
            </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
        <TouchableOpacity onPress={openMenu3}>
          <Image source={require('../assets/message.png')} style={styles.icon} />
          {notificationFound && (
        <View style={styles.badge} />
      )}
        </TouchableOpacity>

        <Modal
        visible={menuVisible3}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu3}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Notifications</Text>
              <TouchableOpacity onPress={closeMenu3} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <RenderNotification item={item} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
            />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      </View>
    </View>

    {/* Buttons */}
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReportProblem', {councilId : Council, memberId : memberId})}>
        <Image source={require('../assets/ReportProblem.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Report Issue</Text>

        
        <Modal
          visible={menuVisibleForReportProblem}
          transparent={true}
          animationType="fade"
          onRequestClose={closeMenu5}
        >
          <View style={styles.modalOverlay} >
            <View style={styles.menuContainer}>
              {/* Modal Header with Close Button */}
              <View style={styles.headerContainer2}>
                <Text style={styles.headerText}>Report Problem</Text>
                <TouchableOpacity onPress={closeMenu5} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>

        {/* Modal Content */}
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleReportProblemScreen}
          >
            <Image
              source={require('../assets/report.png')}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Report Problem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleProblemViewScreen}
          >
            <Image
              source={require('../assets/viewReport.png')}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>View Reported</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('Meeting', {councilId : Council, memberId : memberId})}}> 
        <Image source={require('../assets/meetings.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Meetings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('Project', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/projects.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Projects</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}  onPress={() => {navigation.navigate('ComplaintDiaryForPanel', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/ViewIssues.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>View Problems</Text>
      </TouchableOpacity>
    </View>
    <Image
          source={require('../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch" 
        />
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
},
headerContainer: {
  alignItems: 'center',
  marginTop: 50,
},
welcomeText: {
  fontFamily: 'KronaOne-Regular',
  fontSize: 24,
  fontWeight: 'bold',
  color: 'black',
},
nameText: {
  fontSize: 20,
  top : 5,
  fontWeight: '600',
  color: 'black',
},
iconContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 30,
  width: screenWidth * 0.8,
},
icon: {
  width: 50,
  height: 50,
  borderRadius: 75,
  backgroundColor: '#fff',
},
buttonsContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  bottom: 20
},
button: {
  width: screenWidth * 0.7, 
  backgroundColor: '#eab676',
  borderRadius: 15,
  paddingVertical: 15,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 13,
},
buttonIcon: {
  width: 50,
  height: 50,
  marginRight: 20,
},
buttonText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: 'black',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
menuContainer: {
  width: '85%',
  maxHeight: '90%', // Restricts height to 80% of the screen
  backgroundColor: '#fff',
  borderRadius: 10,
  overflow: 'hidden',
  position: 'absolute', // Use if the container is floating
  // top: 40, // Adjust to prevent going off-screen
  // bottom: 20,
},

  headerContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0C38E', 
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  metaData: {
    fontSize: 12,
    color: '#888',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  notificationCard: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title1: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: 'black',
  },
  message: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#aaa",
    marginTop: 20,
  },
  badge: {
    position: 'absolute',
    top: -2, // Adjust as needed for the badge's position
    right: -2, // Adjust as needed for the badge's position
    width: 14, // Badge size
    height: 14,
    backgroundColor: 'red', // Badge color
    borderRadius: 10, // Make it circular (half of width/height)
    borderWidth: 1, // Optional: border for better visibility
    borderColor: '#fff', // Matches the background (for example, white)
  },
footer: {
  position: 'absolute',
  bottom: 0,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: useWindowDimensions,
  zIndex: -1,
},
});
