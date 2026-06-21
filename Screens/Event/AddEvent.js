import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

const EVENT_STORAGE_KEY = 'NCouncilEvents';
const CATEGORY_OPTIONS = [
  'Cleanliness Drive',
  'Meeting',
  'Emergency',
  'Social',
  'Other',
];

export default function AddEvent({ navigation, route }) {
  const { councilId, memberId } = route.params || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [dateTime, setDateTime] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

const saveEvent = async () => {
  if (!title.trim() || !description.trim() || !location.trim()) {
    Alert.alert(
      'Required fields',
      'Please fill in title, description and location.'
    );
    return;
  }

  try {
    setLoading(true);

    const payload = {
      Tittle: title.trim(),
      location: location.trim(),
      Desciption: description.trim(),
      Date: dateTime.toISOString(),
      Cat: category,
      councilid: councilId,
    };

    console.log(
      'Create Event Payload:',
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(
      `${baseURL}Account/CreateEvent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => null);

    console.log('Create Event Response:', data);

    if (response.ok) {
      Alert.alert(
        'Success',
        data?.message || 'Event created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('EventCalendar', {
                refreshEvents: Date.now(),
                councilId,
                memberId,
              });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Error',
        data?.message || 'Failed to create event.'
      );
    }
  } catch (error) {
    console.error('Create Event Error:', error);

    Alert.alert(
      'Error',
      'Something went wrong while creating the event.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.headerTitle}>Add Event</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Event description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Event location"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.label}>Proposed Date & Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerOpen(true)}>
            <Text style={styles.dateButtonText}>Choose date and time</Text>
            <Text style={styles.dateValue}>{dateTime.toLocaleString()}</Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={datePickerOpen}
            date={dateTime}
            mode="datetime"
            onConfirm={(selected) => {
              setDatePickerOpen(false);
              setDateTime(selected);
            }}
            onCancel={() => setDatePickerOpen(false)}
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={(value) => setCategory(value)}>
              {CATEGORY_OPTIONS.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && { opacity: 0.6 }]}
              onPress={saveEvent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
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
  wrapper: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff8ef',
    borderColor: '#f0d7b0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: '#000',
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff8ef',
    borderColor: '#f0d7b0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
  },
  dateValue: {
    color: '#666',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#fff8ef',
    borderColor: '#f0d7b0',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#d1d1d1',
  },
  saveButton: {
    backgroundColor: '#eab676',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});