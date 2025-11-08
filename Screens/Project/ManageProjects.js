import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

export default function ManageProjects({ route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
  const { memberID, councilID } = route.params;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const response = await fetch(`${baseURL}Project/ShowProjects?councilId=${councilID}`);
      if (response.ok) {
        const data = await response.json();
        // Sort the projects by priority: High > Medium > Low
        const sortedProjects = data.sort((a, b) => {
          const priorityOrder = { High: 1, Medium: 2, Low: 3 };
          return priorityOrder[a.Priority] - priorityOrder[b.Priority];
        });
        setProjects(sortedProjects);
      } else if (response.status === 204) {
        console.log('No Projects Found');
        setProjects([]);
      } else {
        console.error(`Error fetching projects: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectPriority = async (projectId, newPriority) => {
    try {
        console.log(projectId, newPriority)
      const response = await fetch(`${baseURL}Project/UpdateProjectPriority?projectId=${projectId}&newPriority=${newPriority}`, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // }
      });
      if (response.ok) {
        console.log('Priority updated successfully');
        // Refresh the project list
        fetchProjects();
      } else {
        console.error(`Error updating priority: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const DropdownExample = ({ priority, onChange }) => {
    const priorities = ['High', 'Medium', 'Low'];

    return (
      <View style={styles.dropdownContainer}> 
        <ModalDropdown
          options={priorities}
          defaultValue={priority}
          textStyle={styles.dropdownText}
          dropdownTextStyle={styles.dropdownItemText}
          dropdownStyle={styles.dropdownStyle}
          onSelect={(index, value) => onChange(value)}
        />
        <Text style={styles.dropdownLabel}>Adjust Priority</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    // Determine priority color
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High':
          return '#cc0000'; // Red for high priority
        case 'Medium':
          return '#ff8c00'; // Orange for medium priority
        case 'Low':
          return '#2e8b57'; // Green for low priority
        default:
          return '#000'; // Default color
      }
    };

    const priorityColor = getPriorityColor(item.Priority);

    return (
      <>
      <View style={styles.projectCard}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>Description: {item.description}</Text>
        <Text style={{color: '#6b7280', fontWeight: 700}}>Status: {item.status}</Text>
        <Text style={[styles.priority, { color: priorityColor }]}>
          Priority: {item.Priority}
        </Text>
        <Text style={{color: '#6b7280'}}>Budget: Rs {item.budget}/-</Text>
        {/* <Text style={{color: '#6b7280'}}>Start Date: {new Date(item.start_date).toDateString()}</Text>
        <Text style={{color: '#6b7280'}}>End Date: {new Date(item.end_date).toDateString()}</Text> */}
        {item.status === 'Completed' && <Text style={{color: '#6b7280'}}>Completed On: {new Date(item.end_date).toDateString()}</Text>}      
        {item.status !== 'Completed' && 
        <>
        {/* Modal dropdown to change priority */}
        <DropdownExample
        priority={item.Priority}
        onChange={(newPriority) => updateProjectPriority(item.id, newPriority)}
      />
      <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('ScheduleMeeting',{projectId: item.id , councilId: councilID, memberId: memberID, Title: item.title, Description: item.description})}
        > 
          <Text style={styles.buttonText}>Schedule Meeting!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('ProjectLogs',{projectId: item.id , councilId: councilID, memberId: memberID})}
        >
          <Text style={styles.buttonText}>Enter Project Updates!</Text>
        </TouchableOpacity>
        </View>
        </>
        }  
      </View>
    </>
    );
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Ongoing Projects</Text>
      </View>
      <View style={styles.contentContainer}>
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshing={loading}
          onRefresh={fetchProjects}
          ListEmptyComponent={<Text style={{color: 'black', fontSize: 17}}>No Projects Found</Text>}
          initialScrollIndex={0} // Ensure it's set to a valid index
        />
      </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priority: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    right: '3%', // Position the icon to the right inside the input
    justifyContent: 'center',
    height: '130%',
  },
  dropdownTextfoButton:{
    position: 'absolute',
    right: '12%', // Position the icon to the right inside the input
    justifyContent: 'center',
    height: '90%',
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
    color: 'black'
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    padding: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 100,
    textAlign: 'center',
  },
  dropdownStyle: {
    width: 100,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    fontSize: 14,
    padding: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    width: '50%',
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  tickButton: {
    backgroundColor: '#f5d8a0',
  },
  crossButton: {
    backgroundColor: '#a2a3a2',
  },
  buttonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
