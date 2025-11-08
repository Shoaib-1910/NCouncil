// import React, { useEffect, useState } from 'react';
// import { Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
// import WavyBackground from '../../Background/WavyBackground';
// import Collapsible from 'react-native-collapsible';
// import baseURL from '../Api'

// export default function ShowProjectLogs ({navigation, route}) {
//   const { width } = useWindowDimensions(); // screen width
//   const {projectId} = route.params;
//   const [project, setProject] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [collapsed, setCollapsed] = useState(true);

//   // API Call
//   const fetchProjectWithLogs = async () => {
//     try {
//       const response = await fetch(`${baseURL}Project/GetProjectWithLogs?projectId=${projectId}`);
//       const data = await response.json();

//       if (response.ok) {
//         setProject(data.Project);
//         setLogs(data.Logs);
//       } else {
//         console.error("Error fetching project:", data);
//       }
//     } catch (error) {
//       console.error("API call failed:", error);
//     }
//   };

//   useEffect(() => {
//     fetchProjectWithLogs();
//   }, []);

//   if (!project) {
//     return <Text style={styles.loadingText}>Loading project...</Text>;
//   }

//   return (
//   <>
//     <SafeAreaView style={styles.container}>
//       <WavyBackground />
//         {/* Project Information */}
//         <View style={styles.projectCard}>
//         <Text style={styles.projectTitle}>{project.title}</Text>
//         <Text>Status: {project.status}</Text>
//         <Text>Priority: {project.priority}</Text>
//         <Text>Budget: ${project.budget.toFixed(2)}</Text>
//         <Text>Description: {project.description}</Text>
//       </View>

//       {/* Logs Section */}
//       <View style={styles.logsContainer}>
//         <Text
//           style={styles.logsHeader}
//           onPress={() => setCollapsed(!collapsed)}
//         >
//           Project Logs ({collapsed ? '‣‣' : '▼'})
//         </Text>

//         <Collapsible collapsed={collapsed}>
//           {logs.length > 0 ? (
//             logs.map((log) => (
//               <View key={log.id} style={styles.logCard}>
//                 <Text style={styles.logAction}>{log.action_taken}</Text>
//                 <Text>Date: {log.action_date}</Text>
//                 <Text>Status: {log.status}</Text>
//                 <Text>Comments: {log.comments || "N/A"}</Text>
//                 <Text>Amount Spent: ${log.amount_spent.toFixed(2)}</Text>
//                 <Text>Feedback: {log.feedback || "N/A"}</Text>
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noLogs}>No logs available for this project.</Text>
//           )}
//         </Collapsible>
//       </View>
//       <View style={styles.footerContainer}>
//         <Image
//           source={require('../../assets/Footer.png')}
//           style={[styles.footer, { width: width }]} // image width to screen width
//           resizeMode="stretch" // Maintain aspect ratio
//         />
//       </View>
//     </SafeAreaView>
//     </>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Set the background color to white
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 20,
//     fontSize: 16,
//     color: "#888",
//   },
//   projectCard: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   projectTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   logsContainer: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   logsHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#007BFF",
//     marginBottom: 8,
//   },
//   logCard: {
//     backgroundColor: "#f1f1f1",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   logAction: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   noLogs: {
//     fontSize: 14,
//     color: "#666",
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
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import Collapsible from 'react-native-collapsible';
import baseURL from '../Api';

export default function ShowProjectLogs({ navigation, route }) {
  const { width } = useWindowDimensions(); // screen width
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch project data with logs
  const fetchProjectWithLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}Project/GetProjectWithLogs?projectId=${projectId}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.Project);
        setLogs(data.Logs);
      } else {
        console.error('Error fetching project:', data);
      }
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectWithLogs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>Failed to load project. Please try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>View Project Logs</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Project Information */}
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDetail}>Status: {project.status}</Text>
          <Text style={styles.projectDetail}>Priority: {project.Priority}</Text>
          <Text style={styles.projectDetail}>Budget: Rs {project.budget.toFixed(2)}</Text>
          <Text style={styles.projectDetail}>Description: {project.description}</Text>
        </View>

        {/* Logs Section */}
        <View style={styles.logsContainer}>
          <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
            <Text style={styles.logsHeader}>
              Project Logs ({collapsed ? '▼ ' : '‣‣'})
            </Text>
          </TouchableOpacity>

          <Collapsible collapsed={collapsed}>
            {logs.length > 0 ? (
              logs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <Text style={styles.logAction}>{log.action_taken}</Text>
                  <Text style={styles.logDetail}>Date: {log.action_date}</Text>
                  <Text style={styles.logDetail}>Status: {log.status}</Text>
                  <Text style={styles.logDetail}>
                    Comments: {log.comments || 'N/A'}
                  </Text>
                  <Text style={styles.logDetail}>
                    Amount Spent: Rs {log.amount_spent.toFixed(2)}
                  </Text>
                  <Text style={styles.logDetail}>
                    Feedback: {log.feedback || 'N/A'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noLogs}>No logs available for this project.</Text>
            )}
          </Collapsible>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // Footer width adjusts to screen width
          resizeMode="stretch" // Maintain aspect ratio
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
    alignItems: 'center',
    marginTop: 40,
    marginLeft: 5,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 30,
    color: '#000',
    marginBottom: 15,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007BFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
  },
  projectCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  projectDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  logsContainer: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5a142',
    //marginBottom: 10,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logAction: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  logDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  noLogs: {
    fontSize: 14,
    color: '#fffj',
    textAlign: 'center',
  },
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
