import React, { useCallback, useEffect, useState } from 'react';
import { Text, Image, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View, FlatList, Dimensions, Modal, TextInput, Alert, KeyboardAvoidingView, Switch, ScrollView } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import DividerLine from '../../Background/LineDivider';
import { ActivityIndicator, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  baseURL  from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import WavyBackground2 from '../../Background/WavyBackground2';

export default function MeetingScreen ({route, navigation}) {
  const { width } = useWindowDimensions();
  const { councilId } = route.params;

  // All useState hooks MUST be at the top - DO NOT move or add hooks after this section
  const [memberId, setMemberId] = useState(0);
  const [meetingsData, setMeetingsData] = useState([]);
  const [meetingMinutesData, setMeetingMinutesData] = useState([]);
  const [minutesTitle, setMinutesTitle] = useState('');
  const [minutesDesc, setMinutesDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loadingForMinutes, setLoadingForMinutes] = useState(false);

  const [selectedId, setSelectedId] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const [selectedId1, setSelectedId1] = useState(0);
  const [menuVisible1, setMenuVisible1] = useState(false);

  const [selectedId2, setSelectedId2] = useState(0);
  const [menuVisible2, setMenuVisible2] = useState(false);
  const [postMeetingSummary, setPostMeetingSummary] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // useEffect hooks - must come after all useState
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

  useFocusEffect(
    useCallback(() => {
      getMeeting();
      getMeetingMinutes();
    }, [councilId])
  );

  // Regular functions - after all hooks
  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const openMenu = (id) => {
    console.log('Opening menu for meeting:', id);
    setSelectedId(id);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    console.log('Closing menu');
    setSelectedId(null);
    setMenuVisible(false);
  };

  const openMenu1 = (id) => {
    getMeetingMinutes(id);
    setSelectedId1(id);
    setMenuVisible1(true);
  };

  const closeMenu1 = () => {
    setSelectedId1(null);
    setMenuVisible1(false);
  };

  const openMenu2 = async (id) => {
    console.log('Opening attendance menu for meeting:', id);
    setSelectedId2(id);
    setMenuVisible2(true);
    await fetchAttendanceEmployees();
  };

  const closeMenu2 = () => {
    console.log('Closing attendance menu');
    setSelectedId2(null);
    setMenuVisible2(false);
    setPostMeetingSummary('');
    setAttendanceData([]);
  };

  const toggleAttendance = (userId) => {
    setAttendanceData(attendanceData.map(user =>
      user.id === userId ? { ...user, isPresent: !user.isPresent } : user
    ));
  };

  const fetchAttendanceEmployees = async () => {
    setLoadingAttendance(true);
    try {
      const response = await fetch(`${baseURL}/Council/GetattendanceEmp?councilId=${councilId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(employee => ({
          id: employee.id,
          name: employee.name,
          isPresent: false
        }));
        setAttendanceData(formattedData);
        console.log('Fetched attendance employees:', formattedData);
      } else {
        console.log('Failed to fetch attendance employees:', response.status);
        Alert.alert('Error', 'Failed to load attendance list');
      }
    } catch (error) {
      console.error('Error fetching attendance employees:', error);
      Alert.alert('Error', 'Unable to load attendance list');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!postMeetingSummary.trim()) {
      Alert.alert('Please enter Post Meeting Summary');
      return;
    }

    const attendancePayload = attendanceData.map(user => ({
      Member_Id: user.id,
      Status: user.isPresent ? 'present' : 'absent'
    }));

    const payload = {
      summary: postMeetingSummary,
      attendance: attendancePayload
    };

    console.log('Submitting attendance:', payload);

    try {
      setSavingAttendance(true);
      const response = await fetch(`${baseURL}/Council/SaveAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert('Success', 'Attendance and Summary submitted successfully!');
        closeMenu2();
      } else {
        console.log('Failed to save attendance:', response.status);
        Alert.alert('Error', 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Unable to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const getMeeting = async() =>{
    setLoading2(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    try{
      const response = await fetch(`${baseURL}meeting/getMeetings?councilId=${councilId}`)
      if(response.ok){
        const data = await response.json()
        setMeetingsData(data);
        console.log(data)
        }
        else{
          console.log('Failed to Fetch Meetings' + response.status)
        }
    }
    catch{
      console.log('Unable to Fetch Meetings data')
    }
    setLoading2(false)
  }

  const addMeetingMinutes = async(meetingId) =>{
    let Minutes ={
      meeting_id : meetingId,
      minutes : minutesDesc,
      recorded_by : memberId,
      created_at : new Date().toISOString(),
    }
    if(!minutesDesc){
      Alert.alert('Please Enter the Minutes of Meeting')
      return
    }
    try{
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
    const response = await fetch(`${baseURL}Meeting/AddMinutesOfMeeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Minutes)}
    )
    if(response.ok){
      Alert.alert('Minutes Saved Successfully!')
      closeMenu()
      }
      else{
        console.log('Failed to Save Minutes')
      }
    }
    catch{
      console.log('Unable to add Minutes.')
    }
    setLoading(false)
  }

  const getMeetingMinutes = async (meetingId) => {
    setLoadingForMinutes(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
      const response = await fetch(
        `${baseURL}Meeting/GetMeetingMinutes?meetingId=${meetingId}&councilId=${councilId}`
      );
      if (response.ok) {
        const data = await response.json();
        const meetingMinutes = data.map((meeting) => ({
          MeetingId: meeting.MeetingId,
          Title: meeting.Title,
          Description: meeting.Description,
          ScheduledDate: meeting.ScheduledDate,
          Address: meeting.Address,
          MeetingType: meeting.MeetingType,
          CreatedAt: meeting.CreatedAt,
          MinutesId: meeting.MinutesId,
          Minutes: meeting.Minutes,
          RecordedBy: meeting.RecordedBy,
          RoleName: meeting.RoleName?.[0] || "N/A",
          MinutesCreatedAt: meeting.MinutesCreatedAt,
        }));
        setMeetingMinutesData(meetingMinutes);

      } else {
        console.log("No meeting minutes found.");
      }
    } catch (error) {
      console.error("Error fetching meeting minutes:", error);
    } finally {
      setLoadingForMinutes(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{}}>
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>Meeting Location: {item.address}</Text>
      <Text style={styles.date}>Scheduled date: {new Date(item.scheduled_date).toLocaleString()}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
      <TouchableOpacity style={styles.actionButton} onPress={() => openMenu(item.id)}>
            <Text style={styles.actionButtonText}>Add Minutes</Text>
          </TouchableOpacity>

              {/* Modal for adding Minutes of Meeting*/}
      <Modal
        visible={menuVisible && selectedId === item.id}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <KeyboardAvoidingView style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Add Minutes</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <Text style={{color:'black', fontWeight:'600'}}></Text>
            <TextInput style={styles.desc}
              placeholder="State the Minutes of Meeting"
              multiline={true}
              numberOfLines={5}
              selectionColor={'#000'}
              textAlignVertical="top"
              keyboardType="default"
              onChangeText={setMinutesDesc}
              placeholderTextColor="#000" />
            </View>
            <TouchableOpacity style={styles.actionButton2} onPress={() => {addMeetingMinutes(item.id)}}>
            {loading? (
              <ActivityIndicator size={'small'} color={'black'} />
            ):(
              <Text style={styles.actionButtonText2}>Save</Text>
            )}
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

          <TouchableOpacity style={styles.actionButton} onPress={() => {openMenu1(item.id)}}>
            <Text style={styles.actionButtonText}>Show Details</Text>
          </TouchableOpacity>
        <Modal
        visible={menuVisible1 && selectedId1 === item.id}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu1}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Meeting Minutes</Text>
              <TouchableOpacity onPress={closeMenu1} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>

            {meetingMinutesData.length > 0 ? (
              <FlatList
                data={meetingMinutesData}
                keyExtractor={(item) => item.MinutesId.toString()}
                renderItem={renderMeeting}
              />
              ) : (
              <Text style={styles.noDataText}>No Meeting Minutes Found</Text>
              )}
            </View>
           </View>
        </TouchableOpacity>
      </Modal>

          {/* New Attendance & Summary Button */}
          <TouchableOpacity style={styles.actionButton} onPress={() => openMenu2(item.id)}>
            <Text style={styles.actionButtonText}>Attendance</Text>
          </TouchableOpacity>

          {/* Modal for Attendance & Summary */}
          <Modal
            visible={menuVisible2 && selectedId2 === item.id}
            transparent={true}
            animationType="fade"
            onRequestClose={closeMenu2}
          >
            <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
              <View style={styles.menuContainerLarge}>
                {/* Modal Header */}
                <View style={styles.headerContainer2}>
                  <Text style={styles.headerText}>Attendance & Summary</Text>
                  <TouchableOpacity onPress={closeMenu2} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent}>
                  {/* Attendance Section */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Attendance</Text>

                    {loadingAttendance ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#F0C38E" />
                        <Text style={styles.loadingText}>Loading attendance list...</Text>
                      </View>
                    ) : attendanceData.length > 0 ? (
                      attendanceData.map((user) => (
                        <View key={user.id} style={styles.attendanceRow}>
                          <Text style={styles.userName}>{user.name}</Text>
                          <View style={styles.toggleContainer}>
                            <Text style={[styles.toggleLabel, !user.isPresent && styles.activeLabel]}>
                              Absent
                            </Text>
                            <Switch
                              value={user.isPresent}
                              onValueChange={() => toggleAttendance(user.id)}
                              trackColor={{ false: '#d3d3d3', true: '#90EE90' }}
                              thumbColor={user.isPresent ? '#228B22' : '#f4f3f4'}
                            />
                            <Text style={[styles.toggleLabel, user.isPresent && styles.activeLabel]}>
                              Present
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No members found</Text>
                    )}
                  </View>

                  {/* Post Meeting Summary Section */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Post Meeting Summary</Text>
                    <TextInput
                      style={styles.summaryTextArea}
                      placeholder="Enter post meeting summary..."
                      multiline={true}
                      numberOfLines={6}
                      textAlignVertical="top"
                      value={postMeetingSummary}
                      onChangeText={setPostMeetingSummary}
                      placeholderTextColor="#888"
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitAttendance}
                    disabled={savingAttendance}
                  >
                    {savingAttendance ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>
          </View>
          </View>
    </View>
  );

  const renderMeeting = ({ item }) => (
    <View style={styles.card2}>
      <Text style={styles.title}>Minutes: {item.Minutes}</Text>
      <Text style={styles.metaData}>
                    ⁓ {item.RecordedBy} ({item.RoleName})
                  </Text>
      <Text style={styles.metaData}>
                      {`\t`} {new Date(item.MinutesCreatedAt).toDateString()}
                  </Text>
      <DividerLine/>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <View style={{marginTop: 40}}>
      <Text style={styles.titleText}>Meetings</Text>
      <View style={styles.contentContainer}>
        <FlatList
          data={meetingsData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={loading2}
          onRefresh={getMeeting}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
                <Text style={{color: 'black', textAlign : 'center', fontSize : 17}}>No Meetings Scheduled!</Text>
              }
        />

      </View>
      </View>
        <FAB
        icon="plus"
        style={styles.fab}
        color="#F0C38E"
        onPress={() => navigation.navigate('ScheduleMeeting', { memberID: memberId, councilId: councilId })}
      />
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems:'center',
    justifyContent:'center'
  },
  titleText: {
    marginBottom: 50,
    color: 'black',
    margin: 10,
    fontSize: 35,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: useWindowDimensions,
    zIndex: -1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    shadowColor: '#000',
    shadowOpacity: 1,
    backgroundColor: '#555',
  },
  desc: {
    width: '100%',
    backgroundColor: '#F8E6D1',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#F0C38E',
    lineHeight: 20,
    marginTop: 10,
    textAlignVertical: 'top',
  },
  signInButton: {
    width: '90%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 15,
    height: '80%',
    borderRadius : 35,
    width: Dimensions.get('window').width - 25,
  },
  card2: {
    flex: 1,
    marginHorizontal: 13,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 7,
    height: '90%',
    borderRadius : 25,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  date: {
    fontSize: 14,
    color: '#222',
    textAlign: 'right',
    marginTop: 0,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  actionButton: {
    marginRight: 10,
    marginBottom: 10,
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
  flatListContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 10,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuContainerLarge: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  actionButton2: {
    backgroundColor: '#F0C38E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  actionButtonText2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  noDataText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#F8E6D1',
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 5,
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTextArea: {
    width: '100%',
    backgroundColor: '#F8E6D1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#F0C38E',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#F0C38E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '60%',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});