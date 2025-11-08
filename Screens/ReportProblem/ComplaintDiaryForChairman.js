import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { FAB } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import baseURL from '../Api'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ComplaintDairyForChairman ({route}) {
  const { width } = useWindowDimensions(); // screen width
  const [pending, setPending] = useState(0);
  const [open, setOpen] = useState(0);
  const { councilId } = route.params 
  const [total, setTotal] = useState(0);
  const [closed, setClosed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false)
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const [preference, setPreference] = useState(null)
  const [memberId, setMemberId] = useState(0)
  const navigation = useNavigation()


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

const [allProblemsData, setAllProblemsData] = useState([])
  const getProblemStatusSummary = async() => {
    try{
      const response = await fetch(`${baseURL}reportProblem/getProblemStatusSummaryForCouncil?councilId=${councilId}`)
        if(response.ok){
            const json = await response.json()
            console.log('Status Summary Fetched Successfully!')
            console.log(json)
            setTotal(json.Total)
            const mapCounts = json.StatusCounts.map((counts) => ({
              Status: counts.Status,
              count: counts.Count
            }))
            setAllProblemsData(mapCounts)
            //const firstData = mapCounts[0]
            mapCounts.forEach(element => {
              if(element.Status === 'Pending'){
                setPending(element.count)
              }
              if(element.Status === 'Closed'){
                setClosed(element.count)
              }
              if(element.Status === 'Opened'){
                setOpen(element.count)
              }
              if(element.Status === 'Completed'){
                setCompleted(element.count)
              }
            });
            }
      else{
        Alert.alert('Failed to Fetch Status Summary')
      }
    }
    catch(error){
      Alert.alert('Error', 'Unable to Fetch Status Summary' + error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getProblemStatusSummary()
    }, [memberId, councilId])
  )

const handlePress = () =>{
  if(preference == null){
    Alert.alert('Select Preference!')
    return;
  }
  navigation.navigate('SubmitReport', {preference: preference, councilId: councilId})
  closeMenu()
}
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      {/* Complaints Diary Title */}
      <Text style={styles.titleText}>View Reported Problems</Text>
      <View style={{marginTop:150}}>
      <Text style={styles.header}>COMPLAINTS DIARY</Text>
      {/* Total Complaints */}
      <View style={styles.statsContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.label}>TOTAL COMPLAINTS</Text>
          <Text style={styles.number}>{total}</Text>
        </View>
      </View>

      {/* Open, Closed, Pending Complaints */}
      <View style={styles.statusRow}>
      {open == 0?(
        <View style={styles.statusBox2} >
        <Text style={styles.statusLabel}>OPEN</Text>
        <Text style={styles.statusNumber}>{open}</Text>
      </View>
      ):(
        <TouchableOpacity style={styles.statusBox} onPress={() => navigation.navigate('ViewIssues', { councilId: councilId, problemStatus: 'Opened', memberId : memberId })}>
        <Text style={styles.statusLabel}>OPEN</Text>
        <Text style={styles.statusNumber}>{open}</Text>
      </TouchableOpacity>
      )}
      {closed == 0? (
        <View style={styles.statusBox2 } >
          <Text style={styles.statusLabel}>CLOSED</Text>
          <Text style={styles.statusNumber}>{closed}</Text>
        </View>
        ):(
        <TouchableOpacity style={styles.statusBox} onPress={() => navigation.navigate('ViewIssues', { councilId: councilId, problemStatus: 'Closed', memberId : memberId })}>
        <Text style={styles.statusLabel}>CLOSED</Text>
        <Text style={styles.statusNumber}>{closed}</Text>
      </TouchableOpacity>
      )}
        {pending == 0? (
        <View style={styles.statusBox2 } >
          <Text style={styles.statusLabel}>PENDING</Text>
          <Text style={styles.statusNumber}>{pending}</Text>
        </View>
        ):(
        <TouchableOpacity style={styles.statusBox} onPress={() => navigation.navigate('ViewIssues', { councilId: councilId, problemStatus: 'Pending', memberId : memberId })}>
        <Text style={styles.statusLabel}>PENDING</Text>
        <Text style={styles.statusNumber}>{pending}</Text>
      </TouchableOpacity>
      )}
      </View>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
            {completed == 0? (
              <View style={styles.statusBox2 } >
                <Text style={styles.statusLabel}>COMPLETED</Text>
                <Text style={styles.statusNumber}>{completed}</Text>
              </View>
              ):(
              <TouchableOpacity style={styles.statusBox} onPress={() => navigation.navigate('ViewReportedProblems', { councilId: councilId, problemStatus: 'Completed', memberId : memberId })}>
              <Text style={styles.statusLabel}>COMPLETED</Text>
              <Text style={styles.statusNumber}>{completed}</Text>
            </TouchableOpacity>
            )}
            </View>
      {/* <FAB
        icon="plus"
        style={styles.fab}
        color="#F0C38E"
        onPress={openMenu}
      /> */}
        <Modal
  visible={menuVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={closeMenu}
>
  <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
    <View style={styles.menuContainer}>
      {/* Modal Header with Close Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Select Problem Type</Text>
        <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Content */}
      <View style={styles.modalContent}>
        <View style={styles.optionContainer}>
          <TouchableOpacity onPress={() => setPreference('Personal')}>
            <Text style={[styles.optionText, preference === 'Personal' && styles.selectedOption]}>
              {preference === 'Personal' ? '●' : '○'} Personal Grievance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPreference('Social')} style={styles.optionSpacing}>
            <Text style={[styles.optionText, preference === 'Social' && styles.selectedOption]}>
              {preference === 'Social' ? '●' : '○'} Complaint as Social Responsibility
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {handlePress()}}>
            <Text style={styles.actionButtonText}>Ok</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeMenu} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
</Modal>

      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#555',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
    zIndex : -1
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  titleText: {
    color: 'black',
    top : 100,
    marginBottom: 30,
    fontSize: 30,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  totalContainer: {
    backgroundColor: '#fce4b0',
    padding: 20,
    borderRadius: 10,
    width: '95%',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  statusBox: {
    backgroundColor: '#fce4b0',
    padding: 20,
    borderRadius: 10,
    width: '32%',
    alignItems: 'flex-end',
  },
   statusBox2: {
    backgroundColor: '#999',
    padding: 20,
    borderRadius: 10,
    width: '32%',
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.2)', // Translucent background
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      width: '85%',
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      elevation: 5, // Adds shadow on Android
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      padding: 5,
     color: '#FF3B30',
      borderRadius: 10,
    },
    closeButtonText: {
      fontSize: 16,
      color: '#000',
    },
    modalContent: {
      marginTop: 10,
    },
    optionContainer: {
      marginBottom: 15,
    },
    optionText: {
      fontSize: 16,
      color: '#000',
      marginVertical: 10,
    },
    selectedOption: {
      fontWeight: 'bold',
      color: '#000',
    },
    optionSpacing: {
      marginTop: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    actionButton: {
      flex: 0.45,
      padding: 10,
      backgroundColor: '#F0C38E',
      borderRadius: 10,
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    signInButton: {
      width: '80%',
      padding: 10,
      borderRadius: 25,
      backgroundColor: '#f5d8a0',
      alignItems: 'center',
      marginBottom: 20,
    },
    signInButtonText: {
      color: '#000',
      fontWeight: 'bold',
    },
});
