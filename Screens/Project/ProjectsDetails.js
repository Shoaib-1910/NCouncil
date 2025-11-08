import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

export default function ProjectDetails({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const { memberID, councilID } = route.params;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch projects with like count
  const fetchProjects = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const response = await fetch(`${baseURL}Project/ShowProjectsWithLikes?councilId=${councilID}`);
      if (response.ok) {
        const data = await response.json();
        const sortedProjects = data.sort((a, b) => {
          const priorityOrder = { High: 1, Medium: 2, Low: 3 };
          return priorityOrder[a.Project.Priority] - priorityOrder[b.Project.Priority];
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

  // Function to like a project
  const handleLikeProject = async (projectId) => {
    try {
      const response = await fetch(`${baseURL}Project/LikeProject?projectId=${projectId}&memberId=${memberID}`, {
        method: 'POST',
      });
      const json = await response.json()
      if (response.ok) {
        Alert.alert('Project Endorsed successfully');
        fetchProjects(); // Refresh data to update like count
      } else if(response.status == 409){
        console.warn(`Already Endorsed this Project!`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderItem = ({ item }) => {
    const project = item.Project;
    const likesCount = item.LikesCount;

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High':
          return '#cc0000';
        case 'Medium':
          return '#ff8c00';
        case 'Low':
          return '#2e8b57';
        default:
          return '#000';
      }
    };

    return (
      <View style={styles.projectCard}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.description}>Description: {project.description}</Text>
        <Text style={{ color: '#6b7280', fontWeight: '700' }}>Status: {project.status}</Text>
        <Text style={[styles.priority, { color: getPriorityColor(project.Priority) }]}>
          Priority: {project.Priority}
        </Text>
        <Text style={{ color: '#6b7280' }}>Budget: Rs {project.budget}/-</Text>

        {/* Like Button & Count */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikeProject(project.id)}
        >
          <Text style={styles.likeText}>Endorse 👍 {likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('ShowProjectLogs', {
            projectId: project.id,
            councilId: councilID,
            memberId: memberID
          })}
        >
          <Text style={styles.buttonText}>Click to View Updates!</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>View Project Details</Text>
      </View>
      <View style={styles.contentContainer}>
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshing={loading}
          onRefresh={fetchProjects}
        />
      </View>
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
 // ... // Keep all your existing styles unchanged
  likeButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  likeText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
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
    height: '190%',
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
