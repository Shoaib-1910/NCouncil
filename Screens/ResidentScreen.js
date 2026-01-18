import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../Background/WavyBackground';
const screenWidth = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import DividerLine from '../Background/LineDivider';
import baseURL from './Api'

export default function ResidentScreen ({ route, navigation }) {
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
  const [announcementsData, setAnnouncementsData] = useState([])
  const [menuVisible, setMenuVisible] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const [menuVisible2, setMenuVisible2] = useState(false);

  const openMenu2 = () => setMenuVisible2(true);
  const closeMenu2 = () => setMenuVisible2(false);

  const [menuVisibleForNomination, setMenuVisibleForNominations] = useState(false);

  const openMenu3 = () => setMenuVisibleForNominations(true);
  const closeMenu3 = () => setMenuVisibleForNominations(false);

  const [menuVisible4, setMenuVisible4] = useState(false);

  const openMenu4 = () => setMenuVisible4(true);
  const closeMenu4 = () => setMenuVisible4(false);

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

  const getAnnouncementsForResidents = async () => {
    try {
      const response = await fetch(
        `${baseURL}Announcement/getAnnouncementsForCouncil?councilId=${Council}`
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
          setAnnouncementFound(data.length > 0)
          setAnnouncementsData(annData);
          console.log("Announcements Loaded", annData);
        } else {
          console.log("No Announcements Found");
          setAnnouncementsData([]); 
        }
      } else {
        console.log("Failed to fetch announcements, Status:", response.status);
      }
    } catch (error) {
      console.log("Error Fetching Announcements: ", error);
    }
  };
  
  const fetchElection = async () => {
    try {
      const response = await fetch(`${baseURL}election/getelectionforvotes?councilId=${Council}`);
      const data = await response.json();
      console.log("data is",data)
      if (response.ok) {
        setIsElectionActive(data.Status === 'Active');
        console.log("Election Status: " + data.Status)
      } else {
        console.log("Election Status: " + data.Status)
        setIsElectionActive(false)
      }
    } catch (error) {
      console.log('Error', 'Failed to load candidates.');
      console.error(error);
    }
  };

  const handleNominationScreen = () => {
    navigation.navigate('NominatePanel', { councilId: Council })
    closeMenu3()
  }
  
  const handleNominationViewScreen = () => {
    navigation.navigate('ViewNomination', { councilId: Council })
    closeMenu3()
  }

  const handleReportProblemScreen = () => {
    navigation.navigate('ReportProblem', { councilId: Council })
    closeMenu5()
  }
  
  const handleProblemViewScreen = () => {
    navigation.navigate('ViewReportedProblems', { councilId: Council })
    closeMenu5()
  }

  useEffect(() => {
    fetchElection()
    getAnnouncementsForResidents()
  }, [memberId, Council]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationFound, setNotificationFound] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${baseURL}notification/GetNotifications?councilId=${Council}&memberId=${memberId}`
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Notifications Found")
        setNotificationFound(data.length > 0);
        setNotifications(data);
      } else {
        console.log("Error fetching notifications:", data);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const RenderNotification =  React.memo(({ item }) =>  {
    return(
    <TouchableOpacity style={styles.notificationCard}>
      <Text style={styles.title1}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.CreatedAt).toDateString()}</Text>
      {/* <DividerLine/> */}
    </TouchableOpacity>
    )
  })

  const RenderAnnouncements = React.memo(({ item }) => {
    return(
      <View style={styles.announcementCard}>
            <Text style={styles.title}>{item.Title}</Text>
            <Text style={styles.description}>{item.Description}</Text>
            <Text style={styles.metaData}>
            ⁓ {item.MemberName} ({item.RoleName}) | Date: {new Date(item.Date).toDateString()}
          </Text>
        </View>
    )
  })
  const fetchRoleName = (role) =>{
    if(role === 'Member')
      return 'Resident';
    else 
    return role;
  }

  const handleSwitchCouncilScreen = () => {
    navigation.navigate('SwitchCouncil', { councilId: Council, memberId: memberId, councilName: councilName })
    closeMenu()
  }
  
  const handleLeaveCouncil = () => {
    Alert.alert(
      'Are you sure?',
      'Do you want to leave this Council? Doing so will remove you from the council and you will no longer be able to participate in its activities.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: async () => {
            try {
              closeMenu();
              leaveCouncil(Council, memberId);
              // await AsyncStorage.removeItem('userToken');
              // navigation.replace('Login');
              // console.log('Data Cleared and Logged Out.')
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  };

  // LeaveCouncil API Call
const leaveCouncil = async (councilId, memberId) => {
  try {
    const response = await fetch(`${baseURL}Council/LeaveCouncil?councilId=${councilId}&memberId=${memberId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const result = await response.json();
      Alert.alert(result); // Display success message
      navigation.replace('HomeScreen',{ memberID : memberId})
    } else {
      const error = await response.json();
      Alert.alert(`Error: ${error}`);
    }
  } catch (error) {
    console.error('Error leaving council:', error);
    Alert.alert('An error occurred. Please try again later.');
  }
};

  return (
    <SafeAreaView style={styles.container}>
    <WavyBackground />

    {/* Header */}
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Welcome to {councilName}</Text>
      <Text style={styles.nameText}>{fullName}<Text style={{color: 'black', fontSize: 15}}> ⁓{role}</Text></Text>
      {/* <Text style={styles.nameTextForRole}>You're as {role} in this Council</Text> */}
      {/* Icons */}
      <View style={styles.iconContainer}>
      
        <TouchableOpacity onPress={openMenu2}>
          <Image source={require('../assets/notification.png')} style={styles.icon} />
          {announcementFound && 
            <View style={styles.badge} />
          }
        </TouchableOpacity>
        <Modal
        visible={menuVisible2}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu2}
      >
        {/*Modal for Bell Icon to show Announcements */}
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
            {/* FlatList for Announcements */}
            <FlatList
              data={announcementsData}
              keyExtractor={(item) => item.AnnouncementId.toString()}
              renderItem={({ item }) => <RenderAnnouncements item={item} />}
              initialNumToRender={10} // Render only 10 items initially
              maxToRenderPerBatch={10} // Batch render 10 items
              windowSize={5}
              ListEmptyComponent={<Text style={{color : 'black'}}>No Announcements Found!</Text>}
            />
          </View>
        </View>
      </TouchableOpacity>
      </Modal>

        <TouchableOpacity onPress={openMenu}>
        <Image source={require('../assets/info.png')} style={styles.icon} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} >
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
            <Text style={{color:'black', textAlign : 'left', marginBottom: 10}}>
              The app facilitates community involvement by allowing residents to report issues, form committees, and participate in democratic processes, promoting collaborative problem-solving and local governance.
            </Text>
            <View style={{flex: 1, flexDirection: 'row'}}>
            {/* <TouchableOpacity
            style={styles.buttonInsideInfoForLeaving}
            onPress={handleLeaveCouncil}
          >
            <Image
              source={require('../assets/leave.png')}
              style={styles.buttonIconInsideInfo}
            />
            <Text style={styles.buttonTextInsideInfoForLeaving}>Leave Council</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
            style={styles.buttonInsideInfo}
            onPress={handleSwitchCouncilScreen}
          >
            <Image
              source={require('../assets/switch.png')}
              style={styles.buttonIconInsideInfo}
            />
            <Text style={styles.buttonTextInsideInfo}>Switch Council</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
        <TouchableOpacity onPress={openMenu4}>
          <Image source={require('../assets/message.png')} style={styles.icon} />
          {notificationFound && (
        <View style={styles.badge} />
      )}
        </TouchableOpacity>

        <Modal
                visible={menuVisible4}
                transparent={true}
                animationType="fade"
                onRequestClose={closeMenu4}
              >
                <TouchableOpacity style={styles.modalOverlay}>
                  <View style={styles.menuContainer}>
                    {/* Modal Header with Close Button */}
                    <View style={styles.headerContainer2}>
                      <Text style={styles.headerText}>Notifications</Text>
                      <TouchableOpacity onPress={closeMenu4} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
        
                    {/* Modal Content */}
                    <View style={styles.modalContent}>
                    <FlatList
                      data={notifications}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => <RenderNotification item={item} />}
                      initialNumToRender={10} // Render only 10 items initially
                      maxToRenderPerBatch={10} // Batch render 10 items
                      windowSize={5} // Adjust the window size for rendering
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
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('ReportProblem', { councilId: Council })}
      >
        <Image source={require('../assets/ReportProblem.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Report Issue</Text>
      </TouchableOpacity>

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

        {/* Modal Content For Report Problem*/}
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

      {isElectionActive ? (
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {navigation.navigate('VotingScreen', { councilId: Council })}}
        >
          <Image source={require('../assets/votepng.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Vote Now!</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={styles.button2}
          onPress={() => {}}
        >
          <Image source={require('../assets/votepng.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Vote Now!</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={()=>{navigation.navigate('ProjectDetails' , {councilID: Council})}}
      >
        <Image source={require('../assets/projects.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Projects</Text>
      </TouchableOpacity>


     {/* Menu Modal for Nominations*/}
    <TouchableOpacity
      style={styles.button}
      onPress={openMenu3}
    >
      <Image
        source={require('../assets/nominate.png')}
        style={styles.buttonIcon}
      />
      <Text style={styles.buttonText}>Nominate Panel</Text>
    </TouchableOpacity>

    <Modal
      visible={menuVisibleForNomination}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMenu3}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.menuContainer}>

          {/* Modal Header */}
          <View style={styles.headerContainer2}>
            <Text style={styles.headerText}>Setup Nomination</Text>
            <TouchableOpacity
              onPress={closeMenu3}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNominationScreen}
            >
              <Image
                source={require('../assets/setNomination.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Nominate Panel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleNominationViewScreen}
            >
              <Image
                source={require('../assets/viewNomination.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>View All Nominations</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>



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
  fontSize: 20,
  fontWeight: 'bold',
  color: 'black',
},
nameText: {
  fontSize: 18,
  top : 5,
  fontWeight: '600',
  color: 'black',
},
nameTextForRole: {
  marginTop: 5,
  fontSize: 16,
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
button2: {
  width: screenWidth * 0.7, 
  backgroundColor: 'gray',
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
buttonInsideInfo: {
  width: screenWidth * 0.4, 
  backgroundColor: '#FEF3C7',
  borderRadius: 15,
  paddingVertical: 5,
  paddingHorizontal: 10,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 5,
},
buttonInsideInfoForLeaving: {
  width: screenWidth * 0.4, 
  backgroundColor: '#FEE2E2',
  borderRadius: 15,
  paddingVertical: 5,
  paddingHorizontal: 10,
  marginLeft: 5,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 5,
},
buttonIconInsideInfo: {
  width: 30,
  height: 30,
  marginRight: 10,
},
buttonTextInsideInfo: {
  fontSize: 13,
  fontWeight: 'bold',
  color: 'black',
},
buttonTextInsideInfoForLeaving: {
  fontSize: 13,
  fontWeight: 'bold',
  color: 'red',
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
  // top: 20, // Adjust to prevent going off-screen
  // bottom: 20,
},
badge: {
  position: 'absolute',
  top: -2, // Adjust as needed for the badge's position
  right: -2, // Adjust as needed for the badge's position
  width: 16, // Badge size
  height: 16
  ,
  backgroundColor: 'red', // Badge color
  borderRadius: 10, // Make it circular (half of width/height)
  borderWidth: 1, // Optional: border for better visibility
  borderColor: '#fff', // Matches the background (for example, white)
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
    padding: 10,
    alignItems: 'center',
    paddingBottom : 30
  },
  announcementCard: {
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
footer: {
  position: 'absolute',
  bottom: 0,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: useWindowDimensions,
  zIndex: -1,
},
});
