import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

export default function MarkAttendance({ navigation, route }) {
  const { eventId } = route.params || {};

   const { councilId, memberId } = route.params || {};
  const [name, setName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [feedBack, setFeedBack] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pull councilId from AsyncStorage (same userData object used elsewhere in the app)
  useEffect(() => {
    const loadCouncilId = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (userData?.councilId) {
          setCouncilId(userData.councilId);
        } else if (userData?.Council) {
          // fallback in case the stored key is named "Council" (as used in ChairmanScreen route params)
          setCouncilId(userData.Council);
        }
      } catch (error) {
        console.error('Failed to load councilId from storage:', error);
      }
    };
    loadCouncilId();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return;
    }
    if (!roleName.trim()) {
      Alert.alert('Validation', 'Please enter your role.');
      return;
    }
    if (!eventId) {
      Alert.alert('Error', 'Missing event information. Please go back and try again.');
      return;
    }
    if (!councilId) {
      Alert.alert('Error', 'Missing council information. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        Eventid: eventId,
        councilid: councilId,
        roleName: roleName.trim(),
        checkinTime: new Date().toISOString(),
        feedBack: feedBack.trim(),
        Name: name.trim(),
      };

      const response = await fetch(`${baseURL}Account/AddEventAttendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Attendance marked successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        let message = 'Failed to mark attendance.';
        try {
          const err = await response.json();
          message = err?.message || message;
        } catch (e) {
          // response body wasn't JSON, keep default message
        }
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>Fill in your details to confirm your attendance.</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ali Khan"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Employee, Resident, Volunteer"
            placeholderTextColor="#bbb"
            value={roleName}
            onChangeText={setRoleName}
          />

          <Text style={styles.label}>Feedback </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your thoughts about the event..."
            placeholderTextColor="#bbb"
            value={feedBack}
            onChangeText={setFeedBack}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="black" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  headerSubtitle: {
    color: '#333',
    marginTop: 6,
    fontSize: 14,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0c9a8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fffaf5',
  },
  textArea: {
    height: 110,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#eab676',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});