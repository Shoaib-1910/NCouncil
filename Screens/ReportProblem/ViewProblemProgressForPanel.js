// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
// import WavyBackground from '../../Background/WavyBackground';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import baseURL from '../Api';

// export default function ViewProblemProgress ({route}) {
//   const { width } = useWindowDimensions(); // screen width
//   const {problemId, councilId, problemStatus} = route.params;

//   const [memberId, setMemberId] = useState(0);

//   const [memberName, setMemberName] = useState('')
//   const [hierarchy, setHierarchy] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch hierarchy on component load
//     const fetchHierarchy = async () => {
//       try {
//         const response = await axios.get(
//           `${baseURL}ReportProblem/GetProblemHierarchy?problemId=${problemId}`
//         );
//         const json = await response.json();
//         setHierarchy(json.Data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.Message || "An error occurred.");
//         setLoading(false);
//       }
//     };

//     fetchHierarchy();
//   }, [problemId]);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userData = await getUserData();
//         if (userData && userData.memberId) {
//           setMemberId(userData.memberId);
//           setMemberName(userData.fullName)
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
//     fetchUserData();
//   }, []);

//   const getUserData = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('userData');
//       return jsonValue != null ? JSON.parse(jsonValue) : null;
//     } catch (error) {
//       console.error('Failed to fetch user data:', error);
//     }
//   };
//   return (
//     <SafeAreaView style={styles.container}>
//         <Text style={styles.screenTitle}>Reported Problems{problemId}</Text>
//         <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Problem Details</Text>
//         <Text><Text style={styles.label}>Title:</Text> {hierarchy.Title}</Text>
//         <Text><Text style={styles.label}>Description:</Text> {hierarchy.Description}</Text>
//         <Text><Text style={styles.label}>Status:</Text> {hierarchy.Status}</Text>
//         <Text><Text style={styles.label}>Problem Type:</Text> {hierarchy.ProblemType}</Text>
//         <Text><Text style={styles.label}>Category:</Text> {hierarchy.Category}</Text>
//         <Text>
//           <Text style={styles.label}>Created At:</Text>{" "}
//           {new Date(hierarchy.CreatedAt).toLocaleString()}
//         </Text>
//         {hierarchy.VisualEvidence && (
//           <Image
//             source={{ uri: hierarchy.VisualEvidence }}
//             style={styles.image}
//           />
//         )}
//       </View>

//       {/* Meetings */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Meetings</Text>
//         {hierarchy.Meetings.length > 0 ? (
//           <FlatList
//             data={hierarchy.Meetings}
//             keyExtractor={(item) => item.MeetingId.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.card}>
//                 <Text><Text style={styles.label}>Title:</Text> {item.Title}</Text>
//                 <Text><Text style={styles.label}>Description:</Text> {item.Description}</Text>
//                 <Text><Text style={styles.label}>Address:</Text> {item.Address}</Text>
//                 <Text>
//                   <Text style={styles.label}>Scheduled Date:</Text>{" "}
//                   {new Date(item.ScheduledDate).toLocaleString()}
//                 </Text>
//                 <Text><Text style={styles.label}>Meeting Type:</Text> {item.MeetingType}</Text>
//               </View>
//             )}
//           />
//         ) : (
//           <Text>No meetings linked to this problem.</Text>
//         )}
//       </View>

//       {/* Projects */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Projects</Text>
//         {hierarchy.Projects.length > 0 ? (
//           <FlatList
//             data={hierarchy.Projects}
//             keyExtractor={(item) => item.ProjectId.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.card}>
//                 <Text><Text style={styles.label}>Title:</Text> {item.Title}</Text>
//                 <Text><Text style={styles.label}>Description:</Text> {item.Description}</Text>
//                 <Text><Text style={styles.label}>Status:</Text> {item.Status}</Text>
//                 <Text><Text style={styles.label}>Priority:</Text> {item.Priority}</Text>
//                 <Text>
//                   <Text style={styles.label}>Start Date:</Text>{" "}
//                   {new Date(item.StartDate).toLocaleDateString()}
//                 </Text>
//                 <Text>
//                   <Text style={styles.label}>End Date:</Text>{" "}
//                   {new Date(item.EndDate).toLocaleDateString()}
//                 </Text>
//                 <Text><Text style={styles.label}>Budget:</Text> ${item.Budget}</Text>

//                 {/* Logs for the project */}
//                 {item.Logs.length > 0 && (
//                   <View style={styles.logs}>
//                     <Text style={styles.logsTitle}>Logs</Text>
//                     {item.Logs.map((log) => (
//                       <View key={log.LogId} style={styles.logCard}>
//                         <Text>
//                           <Text style={styles.label}>Action Taken:</Text>{" "}
//                           {log.ActionTaken}
//                         </Text>
//                         <Text>
//                           <Text style={styles.label}>Action Date:</Text>{" "}
//                           {new Date(log.ActionDate).toLocaleString()}
//                         </Text>
//                         <Text><Text style={styles.label}>Status:</Text> {log.Status}</Text>
//                         <Text><Text style={styles.label}>Comments:</Text> {log.Comments}</Text>
//                         <Text>
//                           <Text style={styles.label}>Amount Spent:</Text> ${log.AmountSpent}
//                         </Text>
//                         <Text><Text style={styles.label}>Feedback:</Text> {log.Feedback}</Text>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             )}
//           />
//         ) : (
//           <Text>No projects linked to this problem.</Text>
//         )}
//       </View>
//       <WavyBackground />
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
//   screenTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1E293B',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   footerContainer: {
//     position: 'absolute',
//     bottom: 0, 
//     width: '100%',
//     alignItems: 'center',
//   },
// });


///////////////////////////////////// Old COde//////////////////////////////////////////////////


// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   useWindowDimensions,
//   ScrollView,
//   Alert
// } from 'react-native';
// import Collapsible from 'react-native-collapsible';
// import WavyBackground from '../../Background/WavyBackground';
// import baseURL, { baseImageURL } from '../Api';
// import WavyBackground2 from '../../Background/WavyBackground2';

// export default function ViewProblemHierarchy({ navigation, route }) {
//   const { problemId } = route.params;
//   const { width } = useWindowDimensions();
//   const [hierarchy, setHierarchy] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [loadingForSatisfied, setLoadingForSatisfied] = useState(false);
//   const [loadingForUnsatisfied, setLoadingForUnsatisfied] = useState(false);
//   const [error, setError] = useState(null);
//   const [expandedSections, setExpandedSections] = useState({
//     meetings: false,
//     projects: false,
//     logs: {},
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${baseURL}ReportProblem/GetProblemHierarchy?problemId=${problemId}`);
//         const json = await response.json();
//         setHierarchy(json.Data);
//       } catch (err) {
//         setError(err.response?.data?.Message || 'An error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [problemId]);

//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const toggleLog = (projectId) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       logs: { ...prev.logs, [projectId]: !prev.logs[projectId] },
//     }));
//   };

//   const ProblemSatisfied = async(problemId, status) => {
//     if(status === 'Satisfied') 
//       setLoadingForSatisfied(true)
//     else 
//     setLoadingForUnsatisfied(true)
//     await new Promise(resolve => setTimeout(resolve, 1000))  
//     try{
//         const response = await fetch(`${baseURL}ReportProblem/SetProblemSatisfiedOrUnsatisfied?problemId=${problemId}&status=${status}`,
//           {method : 'POST',  
//             headers: {
//             'Content-Type': 'application/json',
//           }})
//         if(response.ok){
//             console.log(`Status Set to ${status} for ${problemId}`)
//             Alert.alert('Status Changed Successfully', `You are ${status} by the Problem Solution`, [{ text: 'OK', onPress: () => navigation.goBack()}]);
//         }
//         else{
//           console.log('Failed to Change Status to Close')
//         }
//       }
//       catch{
//         console.log('Unable to change status of Reported Problem', error);
//       }
//       if(status === 'Satisfied')
//         setLoadingForSatisfied(false)
//       else
//         setLoadingForUnsatisfied(false)
//     }
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       <SafeAreaView style={styles.container}>
//         <WavyBackground2 customStyles={styles.wavyBackground} />
//         <View>
//           <Text style={styles.screenTitle}>Problem Hierarchy</Text>
//           </View>
//           <ScrollView>
//           {/* Problem Details */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Problem Details</Text>
//             <Text style={styles.detailText}>Title: {hierarchy.Title}</Text>
//             <Text style={styles.detailText}>Description: {hierarchy.Description}</Text>
//             <Text style={styles.detailTextForStatus}>Status: {hierarchy.Status}</Text>
//             <View style={styles.dateContainer}>
//               <View style={styles.line} />
//               <Text style={styles.dateText}>{new Date(hierarchy.CreatedAt).toDateString()}</Text>
//             </View>
//             {hierarchy.VisualEvidence && (
//               <Image
//                 source={{ uri: `${baseImageURL}${hierarchy.VisualEvidence}` }}
//                 style={styles.image}
//               />
//             )}
//             {hierarchy.Status === 'Closed' && (
//               <>
//             <Text style={{color: 'black', fontWeight: '500', textAlign: 'center', marginTop: 5}}>You're Problem has been Closed, {`\n`}are you satisfied by the result?</Text>
//             <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, }}>
//              <TouchableOpacity style={styles.submitButton} onPress={() => ProblemSatisfied(problemId, 'Satisfied')}>
//                     {loadingForSatisfied ? (
//                       <ActivityIndicator color={'black'} size={'small'}/>
//                     ):(
//                       <Text style={styles.buttonText}>Satisfied</Text>
//                     )}
//                   </TouchableOpacity>
//               <TouchableOpacity style={styles.submitButton2} onPress={() => ProblemSatisfied(problemId, 'Unsatisfied')}>
//                     {loadingForUnsatisfied ? (
//                       <ActivityIndicator color={'black'} size={'small'}/>
//                     ):(
//                       <Text style={styles.buttonText}>Unsatisfied</Text>
//                     )}
//               </TouchableOpacity>
//               </View>
//               </>
//               )}
//           </View>

//           {/* Meetings */}
//           {/* <TouchableOpacity onPress={() => toggleSection('meetings')} style={styles.toggleButtonContainer}>
//             <Text style={styles.toggleButtonText}>{expandedSections.meetings ? '▼ Meetings' : '‣‣ Meetings'}</Text>
//           </TouchableOpacity>
//           <Collapsible collapsed={!expandedSections.meetings}>
//             {hierarchy.Meetings.length > 0 ? (
//               <FlatList
//                 data={hierarchy.Meetings}
//                 keyExtractor={(item) => item.MeetingId.toString()}
//                 renderItem={({ item }) => (
//                   <View style={styles.card}>
//                     <Text style={styles.detailText}>Title: {item.Title}</Text>
//                     <Text style={styles.detailText}>Description: {item.Description}</Text>
//                     <Text style={styles.detailText}>Address: {item.Address}</Text>
//                     <Text style={styles.detailText}>Scheduled Date: {new Date(item.ScheduledDate).toLocaleString()}</Text>
//                     <Text style={styles.detailText}>Meeting Type: {item.MeetingType}</Text>
//                   </View>
//                 )}
//               />
//             ) : (
//               <Text style={styles.noDataText}>No meetings linked to this problem.</Text>
//             )}
//           </Collapsible>

//           {/* ///////////////// Projects 
//           <TouchableOpacity onPress={() => toggleSection('projects')} style={styles.toggleButtonContainer}>
//             <Text style={styles.toggleButtonText}>{expandedSections.projects ? '▼ Projects' : '‣‣ Projects'}</Text>
//           </TouchableOpacity>
//           <Collapsible collapsed={!expandedSections.projects}>
//             {hierarchy.Projects.length > 0 ? (
//               hierarchy.Projects.map((project) => (
//                 <View key={project.ProjectId} style={styles.card}>
//                   <Text style={styles.detailText}>Title: {project.Title}</Text>
//                   <Text style={styles.detailText}>Description: {project.Description}</Text>
//                   <Text style={styles.detailText}>Status: {project.Status}</Text>
//                   <Text style={styles.detailText}>Priority: {project.Priority}</Text>
//                   <Text style={styles.detailText}>Start Date: {new Date(project.StartDate).toLocaleDateString()}</Text>
//                   <Text style={styles.detailText}>End Date: {new Date(project.EndDate).toLocaleDateString()}</Text>
//                   <Text style={styles.detailText}>Budget: ${project.Budget}</Text>

//                   {/* //////////  Logs 
//                   <TouchableOpacity onPress={() => toggleLog(project.ProjectId)} style={styles.toggleButtonContainer}>
//                     <Text style={styles.toggleButtonText}>{expandedSections.logs[project.ProjectId] ? '▼ Logs' : '‣‣ Logs'}</Text>
//                   </TouchableOpacity>
//                   <Collapsible collapsed={!expandedSections.logs[project.ProjectId]}>
//                     {project.Logs.length > 0 ? (
//                       project.Logs.map((log) => (
//                         <View key={log.LogId} style={styles.logCard}>
//                           <Text style={styles.detailText}>Action Taken: {log.ActionTaken}</Text>
//                           <Text style={styles.detailText}>Action Date: {new Date(log.ActionDate).toLocaleString()}</Text>
//                           <Text style={styles.detailText}>Status: {log.Status}</Text>
//                           <Text style={styles.detailText}>Comments: {log.Comments}</Text>
//                           <Text style={styles.detailText}>Amount Spent: ${log.AmountSpent}</Text>
//                           <Text style={styles.detailText}>Feedback: {log.Feedback}</Text>
//                         </View>
//                       ))
//                     ) : (
//                       <Text style={styles.noDataText}>No logs available.</Text>
//                     )}
//                   </Collapsible>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.noDataText}>No projects linked to this problem.</Text>
//             )}
//           </Collapsible> */}
//         </ScrollView>
//       </SafeAreaView>
//       <View style={styles.footerContainer}>
//         <Image
//           source={require('../../assets/Footer.png')}
//           style={[styles.footer, { width: width }]}
//           resizeMode="stretch"
//         />
//       </View>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   wavyBackground: { position: 'absolute', width: '100%', height: 200 },
//   screenTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
//   section: { marginTop: 10,marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
//   sectionTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 10, color: '#000' },
//   detailText: { fontSize: 14, color: '#555', marginVertical: 2 },
//   detailTextForStatus: { fontSize: 14, color: '#555', marginVertical: 2, fontWeight: 'bold' },
//   label: { fontWeight: 'bold' },
//   card: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
//   toggleButtonContainer: { padding: 10, backgroundColor: '#F0C38E', borderRadius: 8, marginVertical: 5 },
//   toggleButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//   logCard: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 5, marginVertical: 5 },
//   noDataText: { fontStyle: 'italic', color: '#555' },
//   errorText: { color: 'red', fontSize: 16 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 },
//   footer: {
//     height: 80,
//     backgroundColor: '#FFFFFF',
//   },
//   dateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   line: {
//     height: 1,
//     backgroundColor: '#333',
//     flex: 1,
//     marginRight: 10,
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '600',
//   },
//   submitButton: { 
//     backgroundColor: '#f5d8a0', 
//     padding: 10,
//     width: '40%', 
//     borderRadius: 20,
//     margin: 0 
//     },
//   submitButton2: { 
//     backgroundColor: '#f1f1f1', 
//     padding: 10,
//     width: '35%', 
//     borderRadius: 20,
//     margin: 0 
//     },
//   buttonText: { 
//     color: '#000', 
//     fontWeight: 'bold', 
//     textAlign: 'center',
//     fontSize: 15
//     },
// });

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import baseURL, { baseImageURL } from '../Api';
import WavyBackground2 from '../../Background/WavyBackground2';
import DividerLine from '../../Background/LineDivider';

export default function ViewProblemHierarchyForPanel({ navigation, route }) {
  const { problemId } = route.params;
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingForSatisfied, setLoadingForSatisfied] = useState(false);
  const [loadingForUnsatisfied, setLoadingForUnsatisfied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}ReportProblem/GetProblemWithSolverComments?problemId=${problemId}`);
        const json = await response.json();
        setHierarchy(json.Data);
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [problemId]);

  const ProblemSatisfied = async (status) => {
    if (status === 'Satisfied') setLoadingForSatisfied(true);
    else setLoadingForUnsatisfied(true);

    try {
      const response = await fetch(
        `${baseURL}ReportProblem/SetProblemSatisfiedOrUnsatisfied?problemId=${problemId}&status=${status}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        Alert.alert('Status Changed Successfully', `You are ${status} with the Problem Solution`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', 'Failed to change status.');
      }
    } catch {
      Alert.alert('Error', 'Unable to change problem status.');
    }
    if (status === 'Satisfied') setLoadingForSatisfied(false);
    else setLoadingForUnsatisfied(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2/>
      <ScrollView>
        <Text style={styles.screenTitle}>Problem Hierarchy</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Details</Text>
          <Text style={styles.detailText}>Title: {hierarchy.Title || 'NO'}</Text>
          <Text style={styles.detailText}>Description: {hierarchy.Description}</Text>
          <Text style={styles.detailTextForStatus}>Status: {hierarchy.Status}</Text>
          <Text style={styles.detailText}>Created At: {new Date(hierarchy.CreatedAt).toDateString()}</Text>
          {hierarchy.VisualEvidence && (
            <Image source={{ uri: `${baseImageURL}${hierarchy.VisualEvidence}` }} style={styles.image} />
          )}
        </View>
        <View style={styles.section}> 
        <Text style={[styles.detailText, {fontStyle: 'italic'}]}>• Issue Forwarded to Chairman</Text>
        </View>
        {hierarchy.SolverId != 0 &&
         <View style={styles.section}> 
         <Text style={[styles.detailText, {fontStyle: 'italic'}]}>• Chairman has assigned this Issue to {hierarchy.SolverName || 'No Name'} ({hierarchy.SolverRole})</Text>
         </View>
        }
        {/*If Problem is Closed*/}
        {/* {hierarchy.Status === 'Closed' && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>Are you satisfied with the solution?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.satisfiedButton} onPress={() => ProblemSatisfied('Satisfied')}>
                {loadingForSatisfied ? <ActivityIndicator color={'black'} size={'small'} /> : <Text style={styles.buttonText}>Satisfied</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.unsatisfiedButton} onPress={() => ProblemSatisfied('Unsatisfied')}>
                {loadingForUnsatisfied ? <ActivityIndicator color={'black'} size={'small'} /> : <Text style={styles.buttonText}>Unsatisfied</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )} */}

        {/* <View style={styles.section}> */}
        <Text style={styles.sectionTitle}>Updates</Text>
          {hierarchy.SolverComments.length > 0 ? (
            <FlatList
              data={hierarchy.SolverComments}
              keyExtractor={(item) => item.CommentId.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentDate}>{new Date(item.CreatedAt).toDateString()}</Text>
                  <View style={styles.timelineLine} />
                  <View style={styles.commentCard}>
                    <Text style={styles.commentText}>{item.Comment}</Text>
                    <Text style={styles.commentStatus}>Status: {item.Status}</Text>
                    <DividerLine/>
                    <Text style={{color: 'black', fontSize: 12}}>Added By: {item.SolverName} ⁓{item.SolverRole}</Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noDataText}>No solver comments available.</Text>
          )}
           <Text style={styles.sectionTitle}>Feedback</Text>
                    {hierarchy.FeedBackComments != null ? (
                      <FlatList
                        data={hierarchy.FeedBackComments}
                        keyExtractor={(item) => item.FeedbackId.toString()}
                        renderItem={({ item }) => (
                          <View style={styles.commentContainer}>
                            <Text style={styles.commentDate}>{new Date(item.FeedbackDate).toDateString()}</Text>
                            <View style={styles.timelineLine} />
                            <View style={styles.commentCard}>
                              <Text style={styles.commentText}>{item.FeedbackComments}</Text>
                              <Text style={styles.commentStatus}>Status: {item.Status}</Text>
                              <DividerLine/>
                              <Text style={{color: 'black', fontSize: 12}}>Added By: {item.AddedBy} ⁓{item.Role}</Text>
                            </View>
                          </View>
                        )}
                      />
                    ) : (
                      <Text style={styles.noDataText}>No Feedback Found!</Text>
                    )}
        {/* </View> */}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
  section: { margin: 5, padding: 10, backgroundColor: '#fff', borderRadius: 8, shadowOpacity: 0.1, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000', marginLeft: 5, marginTop: 5 },
  detailText: { fontSize: 14, color: '#555', marginVertical: 2,  },
  detailTextForStatus: { fontSize: 14, color: '#555', fontWeight: 'bold' },
commentContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 10 },
  timelineLine: { width: 2, backgroundColor: '#000', height: '100%', marginHorizontal: 10 },
  commentDate: { fontSize: 14, fontWeight: 'bold', color: '#f59b42', textAlign: 'right', width: 100, backgroundColor: 'white', padding: 5, borderRadius: 5, borderWidth: 1, borderColor: '#f59b42' }, 
  commentCard: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 8, flex: 1 },
  commentText: { fontSize: 15, color: '#333', marginBottom: 5 },
  commentStatus: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  noDataText: { fontStyle: 'italic', color: '#555', textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 },
    feedbackContainer: { alignItems: 'center', marginVertical: 15 },
    feedbackText: { color: 'black', fontWeight: '500', textAlign: 'center', marginTop: 5 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    satisfiedButton: { backgroundColor: '#f5d8a0', padding: 10, borderRadius: 20, width: '40%' },
    unsatisfiedButton: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 20, width: '40%' },
    buttonText: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },  
});

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   screenTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
//   section: { margin: 10, padding: 10, backgroundColor: '#fff', borderRadius: 8, shadowOpacity: 0.1, elevation: 2 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' },
//   detailText: { fontSize: 14, color: '#555', marginVertical: 2 },
//   detailTextForStatus: { fontSize: 14, color: '#555', fontWeight: 'bold' },
//   commentCard: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 5, marginVertical: 5 },
//   commentDate: { fontSize: 12, fontWeight: 'bold', color: '#007AFF' },
//   noDataText: { fontStyle: 'italic', color: '#555', textAlign: 'center' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 },
//   feedbackContainer: { alignItems: 'center', marginVertical: 15 },
//   feedbackText: { color: 'black', fontWeight: '500', textAlign: 'center', marginTop: 5 },
//   buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
//   satisfiedButton: { backgroundColor: '#f5d8a0', padding: 10, borderRadius: 20, width: '40%' },
//   unsatisfiedButton: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 20, width: '40%' },
//   buttonText: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
// });
