import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { baseImageURL } from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { Picker } from '@react-native-picker/picker';

export default function ViewIssues({ navigation, route }) {
  const { width } = useWindowDimensions(); // screen width
  const { role, councilId, problemStatus } = route.params;
  const [problemData, setProblemData] = useState([]);
  const [memberId, setMemberId] = useState(0);
   const [selectedId, setSelectedId] = useState(0)
    const [menuVisible, setMenuVisible] = useState(false);
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
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [membersName, setMembersName] = useState([]);
  const [solverIds, setSolverIds] = useState({}); // Store solverId per problem
  const [memberData, setMemberData] = useState([]);

const handleSolverChange = async(problemId, selectedSolverId) => {
  try{
    const response = await fetch(`${baseURL}ReportProblem/AssignProblemToPanelMember?councilId=${councilId}&solverId=${selectedSolverId}&problemId=${problemId}`,
      {method : 'POST',  
        headers: {
        'Content-Type': 'application/json',
      }})
      const data = await response.json();
    if(response.ok){
        console.log(`${data}`);
        getReportedProblem();
    }
    else{
      console.log('Failed to Assign Id to Problem '+ response.status)
    }
  }
  catch{
    console.log('Unable to change status of Reported Problem', error);
  }
  // setSolverIds((prev) => ({
  //   ...prev,
  //   [problemId]: selectedSolverId, // Update only the solverId for the specific problem
  // }));
  console.log(`Selected Solver ID for Problem ${problemId}: ${selectedSolverId}`);
};

const [memberName, setMemberName] = useState('');
const [memberRole, setMemberRole] = useState('');

const getMemberName = async (memberId) => {
  try {
    const response = await fetch(`${baseURL}ReportProblem/FetchMemberById?memberId=${memberId}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`Member Data Fetched for: ${memberId}`);
      setMemberName(data.getMember); // Update the member name state
      setMemberRole(data.memberRole); // Update the member role state
    } else {
      console.log('Failed to fetch member data');
    }
  } catch (error) {
    console.log('Unable to fetch member data', error);
  }
};

  // useEffect(() => {
  //   if (item.SolverId) {
  //     getMemberName(item.SolverId); // Fetch the member data on mount or when SolverId changes
  //   }
  // }, [item.SolverId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.memberId) {
          setMemberId(userData.memberId);
          setMemberName(userData.fullName)
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

  const getReportedProblem = async () => {
    try {
      const response = await fetch(`${baseURL}ReportProblem/GetReportedProblemForChairman?councilId=${councilId}&status=${problemStatus}`);
      if (response.ok) {
        const data = await response.json(); // Await the JSON parsing
        if (data && data.length > 0) {
          // Map and sort the data
          const sortedData = data
            .map((rp) => ({
              ProblemId: rp.ProblemId,
              Title: rp.Title,
              Description: rp.Description,
              Status: rp.Status,
              ProblemType: rp.ProblemType,
              Category: rp.Category,
              CreatedAt: rp.CreatedAt,
              VisualEvidence: rp.VisualEvidence,
              MemberId: rp.MemberId,
              SolverId: rp.SolverId,
              SolverRole: rp.SolverRole,
              CouncilId: rp.CouncilId,
            }))
            .sort((a, b) => {
              if (a.Status === 'Opened' && b.Status !== 'Opened') return -1; // Opened comes first
              if (a.Status !== 'Opened' && b.Status === 'Opened') return 1;
              if (a.Status === 'Pending' && b.Status !== 'Pending') return -1; // Pending comes next
              if (a.Status !== 'Pending' && b.Status === 'Pending') return 1;
              return new Date(b.CreatedAt) - new Date(a.CreatedAt); // Sort by CreatedAt within groups
            });
  
          setProblemData(sortedData);
          console.log('Sorted Data:', sortedData);
        } else {
          console.log('No reported problems found.');
        }
      } else {
        console.log(`Failed to load reported problems. Status: ${response.status}`);
      }
    } catch (error) {
      console.log('Unable to get Reported Problems', error);
    }
  };

  useEffect(() => {
    getMembersName();
  }, [councilId])
  
const getMembersName = async () => {
  try {
    console.log('Loading Members Name..')
    const response = await fetch(`${baseURL}reportProblem/GetCouncilMembersForAssigning?councilId=${councilId}`);
   
    if (response.ok) {
      console.log('Members Name Response' + response)
      const responseText = await response.text(); 
      console.log('Members Name Loaded!')
      if (responseText) {
        const data = JSON.parse(responseText); 
        // Format data for the dropdown
        if (data && data.length > 0) {
          console.log('Members Name' + data)
        const MembersData = data.map((member) => ({
          label: member.MembersName, // Display name
          value: member.MembersId,   // Member id
          role: member.MemberRole
          }))
        setMembersName(MembersData);
        }
        else{
          setMembersName([])  
        }
      }
    } else {
      Alert.alert('Failed to fetch members: ' + response.status);
    }
  } catch (error) {
    console.error('Failed to Load Data: ' + error);
  }
};


  const setProblemStatusToOpen = async(problemId) => {
    try{
      const response = await fetch(`${baseURL}ReportProblem/SetStatusToOpen?problemId=${problemId}`,
        {method : 'POST',  
          headers: {
          'Content-Type': 'application/json',
        }})
      if(response.ok){
          console.log(`Status Set to Opened for ${problemId}`)
          Alert.alert('Success', 'Problem Opened Successfully!')
          getReportedProblem();
          navigation.goBack();
      }
      else{
        console.log('Failed to Change Status to Open')
      }
    }
    catch{
      console.log('Unable to change status of Reported Problem', error);
    }
  }

  const setProblemStatusToClose = async(problemId) => {
    try{
      const response = await fetch(`${baseURL}ReportProblem/SetStatusToClose?problemId=${problemId}`,
        {method : 'POST',  
          headers: {
          'Content-Type': 'application/json',
        }})
      if(response.ok){
          console.log(`Status Set to Closed for ${problemId}`)
          Alert.alert('Success', 'Problem Closed Successfully!')
          getReportedProblem();
          navigation.goBack();
      }
      else{
        console.log('Failed to Change Status to Close')
      }
    }
    catch{
      console.log('Unable to change status of Reported Problem', error);
    }
  }
  const handlePress = (ProblemId, selectedItem, label, MemberRole) => {
    if (!ProblemId || !selectedItem) {
      Alert.alert('Please Select a Panel Member!');
      return;
    }  
    Alert.alert(
      'Are you sure?',
      `Assign this Problem to ${label} (${MemberRole})?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => handleSolverChange(ProblemId, selectedItem),
        },
      ]
    );
  };


  const submitSolverComment = async (problemId) => {
    if (!comment.trim() || !status) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    try {
      const response = await fetch(`${baseURL}reportProblem/AddSolverComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Problem_id: problemId, // Pass the current problem's ID
          Solver_id: memberId,  // Pass the solver's ID
          Comment: comment,
          Status: status,
        }),
      });
  
      if (response.ok) {
        Alert.alert("Success", "Comment added successfully!");
        setComment(""); // Clear input
        setStatus(""); // Reset picker
        closeMenu(); // Close modal
        //refreshComments(); // Optionally refresh the comments list
      } else {
        console.log("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  useEffect(() => {
    getReportedProblem();
  }, [memberId, councilId, problemStatus]);


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewProblemProgressForPanel',{problemId: item.ProblemId, problemStatus: item.Status, councilId: councilId, memberId: memberId})}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{item.Title || 'No Title'}</Text>
        <Text style={styles.status(item.Status)}>{item.Status || 'NO Status'}</Text>
      </View>
      <Text style={styles.description}>{item.Description || 'No Description'}</Text>
      {item.VisualEvidence ? (
        <Image
        source={{ uri: `${baseImageURL}${item.VisualEvidence}` }} // Construct full URL
        style={styles.image}
        resizeMode="cover"
      />
      ) : (
        <Text style={styles.noImageText}>No Visual Evidence</Text>
      )}
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Type: {item.ProblemType || 'No Type'}</Text>
        <Text style={styles.metaText}>Category: {item.Category || 'No Category'}</Text>
      </View>
      <Text style={[styles.metaText,{marginTop: 5}]}>Reported At: {new Date(item.CreatedAt).toDateString() || 'No Date'}</Text>
      {!item.SolverId? (<View style={styles.buttonContainer2}>
        {item.Status === 'Pending' && (
         <>
          <TouchableOpacity
          style={[styles.button, styles.tickButton, {width: '60%', marginBottom: 10}]}
          onPress={() => navigation.navigate('ScheduleMeeting',{Title: item.Title, Description: item.Description, problemId: item.ProblemId , councilId: councilId, memberId: memberId})}
          >
          <Text style={styles.buttonText}>Schedule Meeting</Text>
        </TouchableOpacity>
          <Text style={[styles.metaText,{marginBottom: 2, marginLeft: 8}]}>Assign Someone to Solve this? </Text>
          <Dropdown
          data={membersName}
          style={styles.dropDown}
          maxHeight={200}
          labelField="label"   
          valueField="value"   
          placeholderTextColor = '#000'
          placeholder="Select Panel Member"
          value={solverIds[item.ProblemId] || null} // Retrieve solverId for this problem
          onChange={(selectedItem) => {
            handlePress(item.ProblemId, selectedItem.value, selectedItem.label, selectedItem.role)
            //handleSolverChange(item.ProblemId, selectedItem.value); // Update state for this problem
          }}
          renderPlaceholder={() => (
            <Text style={{ color: '#333' }}>Select Panel Member</Text>
        )}
          renderItem={(item) => (
            <ScrollView>
              <Text style={{ color: 'black', fontSize: 15, padding: 15 }}>{item.label}  ⁓{item.role}</Text>
            </ScrollView>
          )}
          /> 
           <View style={styles.orContainer}>
        <Text style={styles.orText}>OR</Text>
      </View>
          {/* <Text style={[styles.metaText,{alignItems: 'center', width: '100%', justifyContent: 'center', marginVertical: 5}]}>OR</Text> */}
          <TouchableOpacity
            style={[styles.button2, styles.tickButton]}
            onPress={() => setProblemStatusToOpen(item.ProblemId)}
          >
            <Text style={styles.buttonText}>Open</Text>
          </TouchableOpacity>
          </>
        )}
        {item.Status === 'Opened' && (
          <View style = {{flex : 1, flexDirection : 'row', }}>
            {/*Add Working Button */}
             <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => {openMenu(item.ProblemId)}} // Pass the problem ID
        >
          <Text style={styles.buttonText}>Add Working Updates!</Text>
        </TouchableOpacity>
        {/*Schedule Meeting Button */}
        <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('ScheduleMeeting',{Title: item.Title, Description: item.Description, problemId: item.ProblemId , councilId: councilId, memberId: memberId})}
        >
          <Text style={styles.buttonText}>Schedule Meeting</Text>
        </TouchableOpacity>
        {/*Close Button */}
        <TouchableOpacity
            style={[styles.button, styles.crossButton]}
            onPress={() => setProblemStatusToClose(item.ProblemId)}
          >
            <Text style={styles.closeButtonText}>❌ Close</Text>
          </TouchableOpacity>
          
          {/*Modal for Adding Project Update*/}
        <Modal
        visible={menuVisible && selectedId === item.ProblemId}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
          >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            {/* Modal Header */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Add Work Update</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              {/* Comment Input */}
              <Text style={styles.label}>Work Comment</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your comment"
                value={comment}
                placeholderTextColor={'black'}
                onChangeText={(text) => setComment(text)}
                multiline
              />

              {/* Status Picker */}
              <Text style={styles.label}>Status</Text>
              <Picker
                selectedValue={status}
                style={styles.picker}
                onValueChange={(value) => setStatus(value)}
              >
                <Picker.Item label="Select Status" value="" />
                <Picker.Item label="Solved" value="Solved" />
                <Picker.Item label="Partially Solved" value="Partially Solved" />
                <Picker.Item label="Not Solved" value="Not Solved" />
              </Picker>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {submitSolverComment(item.ProblemId)}} // Pass the problem ID
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

          {/*
        <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('AddProject',{Title: item.Title, Description: item.Description, problemId: item.ProblemId, councilId: councilId, memberID : memberId})}
        >
          <Text style={styles.buttonText}>Start Project</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.button, styles.crossButton]}
            onPress={() => setProblemStatusToClose(item.ProblemId)}
          >
            <Text style={styles.closeButtonText}>❌ Close</Text>
          </TouchableOpacity> */}
        </View>
        )}
      </View>):(
        <Text style={[styles.metaText, {fontSize: 15, marginTop: 15, fontWeight: 500}]}>Problem is Assigned to {item.SolverId} ({item.SolverRole})</Text>
      )}
      
    </TouchableOpacity>
  );
// For Open button text
//Start Now, take action, get Started, Fix It, Solve It
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.screenTitle}>Reported Problems</Text>
      <View style={styles.contentContainer}>
      <FlatList
        data={problemData}
        keyExtractor={(item) => item.ProblemId.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{color: 'black', fontSize: 16, textAlign: 'center'}}>No Problems Reported Yet!</Text>}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
      
      </View>
      {/* <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    //paddingBottom: 80,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropDown: {
    width: '100%', // Full width
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#333',
    marginBottom: 10, // Add space below dropdown
    color: '#fff',
    fontSize: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  status: (status) => ({
    fontSize: 14,
    fontWeight: '600',
    color: status === 'Pending' ? '#F59E0B' : status === 'Opened' ? '#10B981' : status === 'Closed' ? '#EF4444' : '#000',
    backgroundColor: status === 'Pending' ? '#FEF3C7' : status === 'Opened' ? '#D1FAE5' : status === 'Closed' ? '#FEE2E2': '##ccd0db',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  }),
  description: {
    fontSize: 15,
    color: '#6B7280',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginTop: 8,
  },
  noImageText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  buttonContainer2: {
    flexDirection: 'column', // Stack items vertically
    alignItems: 'flex-start', // Align to the start
    marginTop: 16,
  },
  
  dropDown: {
    width: '100%', // Full width
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#333',
    marginBottom: 10, // Add space below dropdown
    color: '#fff',
    fontSize: 15,
  },
  
  button2: {
    width: '100%', // Full width
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5d8a0',
    marginTop: 10, // Add space above the button
  },
  orContainer: {
    //marginVertical: 1, // Space above and below "OR"
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
    width: '100%',
  },  
  orText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickButton: {
    backgroundColor: '#f5d8a0',
  },
  crossButton: {
    backgroundColor: '#FEE2E2',
  },
  buttonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  closeButtonText: {
    fontSize: 15,
    color: '#cf2500',
    fontWeight: '600',
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  menuContainer: { backgroundColor: "#F8F9FA", padding: 20, borderRadius: 10, width: "90%" },
  headerContainer2: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerText: { fontSize: 18, fontWeight: "bold", color: "black" },
  closeButton: { padding: 5 },
  closeButtonText: { fontSize: 16, color: "#000" },
  modalContent: { marginBottom: 10 },
  label: { fontSize: 16, color: "black", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, height: 100, textAlignVertical: "top", marginBottom: 10, color: 'black' },
  picker: { color: "black", height: 50, width: "100%", marginBottom: 20 },
  submitButton: { backgroundColor: "#f5d8a0", padding: 10, borderRadius: 5, alignItems: "center" },
  submitButtonText: { color: "black", fontWeight: "bold", fontSize: 16 },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  footer: {
    height: 80,
  },
});
