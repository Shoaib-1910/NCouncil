import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProjectLogs({navigation, route}) {
  const { width } = useWindowDimensions();
  const { projectId } = route.params;
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState(new Date());
  const [status, setStatus] = useState(null);
  const [comments, setComments] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loggedBy, setLoggedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const statusList = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
  ];

  const [memberId, setMemberId] = useState(null);
    
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
 fetchUserData()
  }, []);

    const getUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
  
  const saveProjectLog = async () => {
    // if (!projectId || !actionTaken || !status || !loggedBy) {
    //   alert('Please fill in all required fields.');
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch(`${baseURL}Project/AddProjectLogsById?projectId=${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          action_taken: actionTaken,
          action_date: actionDate.toISOString().split('T')[0],
          status: status,
          comments: comments,
          amount_spent: parseFloat(amountSpent) || 0,
          feedback: feedback,
          logged_by: memberId? memberId: 0,
        }),
      });

      if (response.ok) {
        alert('Project log saved successfully!');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('Failed to save the project log.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the project log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <ScrollView>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Update Project Logs</Text>

          <TextInput
            style={styles.input}
            placeholder="Action Taken"
            keyboardType="default"
            onChangeText={setActionTaken}
            placeholderTextColor="#000"
          />
          <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setOpen(true)}>
            <Text style={styles.dateButtonText}>{actionDate.toDateString()}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={open}
            date={actionDate}
            mode="date"
            onConfirm={(date) => {
              setOpen(false);
              setActionDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />

          <Dropdown
            data={statusList}
            style={styles.dropDown}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Status"
            value={status}
             renderItem={(item) => (
                <Text style={{ color: 'black', fontSize: 14 }}>{item.label}</Text>
                )}
            onChange={(item) => setStatus(item.value)}
            placeholderStyle={{ color: 'black' }}
            selectedTextStyle={{ color: 'black' }}
          />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Comments (optional)"
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            onChangeText={setComments}
            placeholderTextColor="#000"
          />

          <TextInput
            style={styles.input}
            placeholder="Amount Spent (optional)"
            keyboardType="numeric"
            onChangeText={setAmountSpent}
            placeholderTextColor="#000"
          />

          <TextInput
            style={styles.input}
            placeholder="Feedback (optional)"
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            onChangeText={setFeedback}
            placeholderTextColor="#000"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveProjectLog} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Log</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width,}]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    margin: 20,
    alignItems: 'center',
    marginTop: 120,
  },
  header:{
    color : 'black', 
    marginBottom: 10, 
    fontSize: 30,
    bottom: 40,
    fontWeight: '400',
  },
  input: {
    width: '95%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color : 'black',
    },

  dateButton: {
    width: '45%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 25,
  },
  dateButtonText: {
    color: '#000',
  },
  dropDown: {
    width: '45%',
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  saveButton: {
    width: '60%',
    padding: 15,
    borderRadius: 8,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
  },
});
