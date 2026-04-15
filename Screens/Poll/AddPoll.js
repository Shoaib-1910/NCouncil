import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import WavyBackground2 from '../../Background/WavyBackground2';
import baseURL from '../Api';

export default function AddPoll({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { councilId } = route.params || {};
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (value, index) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOptionField = () => {
    setOptions((previousOptions) => [...previousOptions, '']);
  };

  const createPoll = async () => {
    const trimmedQuestion = question.trim();
    const cleanedOptions = options
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    if (!councilId) {
      Alert.alert('Council not found.');
      return;
    }

    if (!trimmedQuestion) {
      Alert.alert('Please enter the poll question.');
      return;
    }

    if (cleanedOptions.length < 2) {
      Alert.alert('Please add at least two options.');
      return;
    }

    const pollPayload = {
      councilId,
      question: trimmedQuestion,
      isActive: 1,
      options: cleanedOptions,
    };

    setLoading(true);

    try {
      const response = await fetch(`${baseURL}Announcement/PostPoll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollPayload),
      });

      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.ok) {
        Alert.alert('Poll created successfully!', '', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
        return;
      }

      console.log('Failed to create poll:', response.status, responseData);
      Alert.alert('Failed to create poll.');
    } catch (error) {
      console.log('Error creating poll:', error);
      Alert.alert('Unable to create poll right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titleText}>Add Community Poll</Text>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image source={require('../../assets/announcement2.png')} style={styles.image} />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter poll question"
            placeholderTextColor="#666"
            value={question}
            onChangeText={setQuestion}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Options</Text>
          {options.map((option, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Option ${index + 1}`}
              placeholderTextColor="#666"
              value={option}
              onChangeText={(value) => handleOptionChange(value, index)}
            />
          ))}

          <TouchableOpacity style={styles.addOptionButton} onPress={addOptionField}>
            <Text style={styles.addOptionText}>Add More Option</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={createPoll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    marginBottom: 25,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 90,
    height: 90,
  },
  fieldContainer: {
    width: '85%',
    marginBottom: 18,
  },
  label: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  addOptionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  addOptionText: {
    color: '#000',
    fontWeight: '600',
  },
  createButton: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F0C38E',
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
