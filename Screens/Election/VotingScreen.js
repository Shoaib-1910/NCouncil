// import React, { useEffect, useState } from 'react';
// import { Alert, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
// import WavyBackground from '../../Background/WavyBackground';
// import baseURL from '../Api'
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function VotingScreen ({route, navigation}) {
//   const { width } = useWindowDimensions(); // screen width
//   const { councilId } = route.params;
//   const [electionData, setElectionData] = useState([])
//   const [memberId, setMemberId] = useState(0)
//   const [electionId, setElectionId] = useState(0)
//   const [candidates, setCandidates] = useState([])
//   const [selectedCandidate, setSelectedCandidates] = useState(null)
//   const [isActive, setIsActive] = useState(false)

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userData = await getUserData();
//         if (userData && userData.memberId) {
//           setMemberId(userData.memberId);
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
//  fetchUserData()
//   }, []);

//     const getUserData = async () => {
//       try {
//         const jsonValue = await AsyncStorage.getItem('userData');
//         return jsonValue != null ? JSON.parse(jsonValue) : null;
//       } catch (error) {
//         console.error('Failed to fetch user data:', error);
//       }
//     };

//   const fetchCandidates = async () => {
//     try {
//       const response = await fetch(`${baseURL}election/getelectionforvotes?councilId=${councilId}`);
//       console.log('Response: '+response)
//       const data = await response.json();
//       if (response.ok) {
//       setElectionId(data.ElectionId)
//       setElectionData({
//         electionId: data.ElectionId,
//         electionName: data.ElectionName,
//         status: data.Status,
//       });

//       if (data.Candidates && data.Candidates.length > 0) {
//         const candidatesData = data.Candidates.map((candidate) => ({
//           candidateId: candidate.CandidateId,
//           candidateName: candidate.CandidateName,
//           voteCount: candidate.VoteCount,
//         }))
//     setCandidates(candidatesData);
//     }
//     setIsActive(data.Status === 'Active')
//     console.log('Election data fetched successfully!');
//     }
//     else{
//         Alert.alert('No Data Found')
//     }
//  } catch (error) {
//       Alert.alert("Error", "Failed to load candidates.");
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchCandidates()
//   }, [councilId])

//   const castVote = async () => {
//     if (selectedCandidate === 0) {
//       Alert.alert("Error", "Please select a candidate to vote.");
//       return;
//     }

//     try {
//       const response = await fetch(`${baseURL}election/CastVote`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           voter_id: memberId,
//           candidate_id: selectedCandidate,
//           election_id: electionId,
//         }),
//       });

//       if (response.ok) {
//         Alert.alert("Success", "Your vote has been cast successfully.");
//       } else {
//         const errorData = await response.json();
//         Alert.alert("Error", errorData.message || "Failed to cast vote.");
//       }
//     } catch (error) {
//       Alert.alert("Error", "An error occurred while casting your vote.");
//       console.error(error);
//     }
//   };
//   return (
//     <SafeAreaView style={styles.container}>
//       <WavyBackground />
//       <Text>{councilId}</Text>
//       <View style={styles.footerContainer}>
//         <Image
//           source={require('../../assets/Footer.png')}
//           style={[styles.footer, { width: width }]} // image width to screen width
//           resizeMode="stretch" // Maintain aspect ratio
//         />
//       </View>
//     </SafeAreaView>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Set the background color to white
//   },
//   footerContainer: {
//     position: 'absolute',
//     bottom: 0, 
//     width: '100%',
//     alignItems: 'center',
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground2 from '../../Background/WavyBackground2';

export default function VotingScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { councilId } = route.params;
  const [electionData, setElectionData] = useState({});
  const [memberId, setMemberId] = useState(0);
  const [electionId, setElectionId] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.memberId) {
          setMemberId(userData.memberId);
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

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${baseURL}election/getelectionforvotes?councilId=${councilId}`);
      const data = await response.json();
      if (response.ok) {
        setElectionId(data.ElectionId);
        setElectionData({
          electionId: data.ElectionId,
          electionName: data.ElectionName,
          status: data.Status,
        });
        setCandidates(data.Candidates || []);
        setIsActive(data.Status === 'Active');
          openMenu()
      } else {
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load candidates.');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [councilId]);

  const castVote = async () => {
    if (!selectedCandidate) {
      Alert.alert('Error', 'Please select a candidate to vote.');
      return;
    }
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch(`${baseURL}election/CastVote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_id: memberId,
          candidate_id: selectedCandidate,
          election_id: electionId,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your vote has been cast successfully.');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while casting your vote.');
      console.error(error);
    }
    setLoading(false)
  };

  const renderCandidateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.candidateButton,
        selectedCandidate === item.CandidateId && styles.selectedCandidateButton,
      ]}
      onPress={() => setSelectedCandidate(item.CandidateId)}
    >
      <Text style={styles.candidateText}>{item.CandidateName}</Text>
      <Text style={styles.voteCountText}>⁓ For Chairman</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <Text style={styles.titleText}>Vote Now!</Text>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{electionData.electionName}</Text>
        <Text style={{color: 'green', marginTop: 10, fontSize: 17}}>Status: {isActive ? 'Active' : 'Inactive'}</Text>
      </View>
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        //onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText2}>Voting Instruction</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <Text style={{color:'black', fontWeight:'600', fontSize: 23}}>To vote,</Text>
            <Text style={{color:'black', textAlign : 'left', fontSize: 22}}>
            Simply review the list of candidates. Select your preferred candidate by tapping the corresponding button, and then submit your vote.
            Ensure your selection is correct before finalizing your submission.
            </Text>
        </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {isActive ? (
        <View style={{top : 150}}>

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.CandidateId.toString()}
          renderItem={renderCandidateItem}
          contentContainerStyle={styles.candidatesList}
        />
        <TouchableOpacity style={styles.voteButton} onPress={castVote}>
          {loading? (
            <ActivityIndicator size={'small'} color={'black'}/>
          ):(
            <Text style={styles.voteButtonText}>Cast Vote</Text>
          )}
      </TouchableOpacity>
      </View>
      ) : (
        <Text style={styles.inactiveText}>No Election is Active in the Council.</Text>
      )}
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    top : 110,
    paddingTop: 20,
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    top : 50,
    marginBottom: 0,
    fontSize: 30,
    textAlign: 'center',
  },
  headerText: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    bottom: 10,
  },
  candidatesList: {
    padding: 20,
  },
  candidateButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedCandidateButton: {
    backgroundColor: '#F0C38E', //4CAF50
  },
  candidateText: {
    fontSize: 16,
    color: '#333',
  },
  voteCountText: {
    fontSize: 12,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
    menuContainer: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 10,
      overflow: 'hidden',
    },
    headerContainer2: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F0C38E', 
      padding: 15,
    },
    headerText2: {
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
  voteButton: {
    backgroundColor: '#F0C38E',
    padding: 15,
    marginVertical: 20,
    marginHorizontal: 100,
    borderRadius: 8,
    alignItems: 'center',
  },
  voteButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inactiveText: {
    textAlign: 'center',
    justifyContent: 'center',
    color: '#FF0000',
    marginTop: 200,
    fontSize: 20,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  instructionsTitle: {
    color: 'black',
    fontWeight: '600',
    fontSize: 23,
    marginBottom: 10,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bulletPoint: {
    color: 'black',
    fontSize: 20,
    marginRight: 6,
  },
  bulletText: {
    color: 'black',
    fontSize: 20,
    flex: 1,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
