import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import WavyBackground2 from '../../Background/WavyBackground2';
import baseURL from '../Api';

export default function AddExpenseRequest({ route, navigation }) {
  const { width } = useWindowDimensions();
  const councilId = route.params?.councilId || route.params?.councilID;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [totalApprovers, setTotalApprovers] = useState(null);
  const [loading, setLoading] = useState(false);

  const approversList = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
  ];

  const submitExpenseRequest = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);

    if (!councilId) {
      Alert.alert('Error', 'Council not found.');
      return;
    }

    if (!trimmedTitle || !trimmedDescription || !amount || !totalApprovers) {
      Alert.alert('Please fill all fields.');
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Please enter a valid amount.');
      return;
    }

    const payload = {
      Title: trimmedTitle,
      Description: trimmedDescription,
      Amount: parsedAmount,
      Status: 'pending',
      TotalApprovers: totalApprovers,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}Announcement/PostRequest?councilId=${councilId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Expense request submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        console.log('Failed to submit expense request:', response.status);
        Alert.alert('Error', 'Failed to submit expense request.');
      }
    } catch (error) {
      console.log('Error submitting expense request:', error);
      Alert.alert('Error', 'Unable to submit expense request right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />

      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>Add Expense Request</Text>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={require('../../assets/announcement2.png')}
              style={styles.image}
            />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#000"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description"
          placeholderTextColor="#000"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Dropdown
          data={approversList}
          style={styles.dropdown}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder="Total Approvers"
          value={totalApprovers}
          onChange={(item) => setTotalApprovers(item.value)}
          renderItem={(item) => (
            <Text style={{ color: 'black', paddingVertical: 8 }}>{item.label}</Text>
          )}
          selectedTextStyle={{ color: 'black' }}
          placeholderStyle={{ color: 'black' }}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitExpenseRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/Footer.png')}
        style={[styles.footer, { width }]}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  titleText: {
    color: 'black',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  input: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  descriptionInput: {
    width: '85%',
    height: 120,
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    textAlignVertical: 'top',
  },
  dropdown: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  submitButton: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
