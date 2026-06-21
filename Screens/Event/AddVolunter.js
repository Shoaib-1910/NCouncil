import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Alert,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../Api';
import { ActivityIndicator } from 'react-native';
const screenWidth = Dimensions.get('window').width;

const GENDER_OPTIONS = ['Male', 'Female'];

const emptyVolunteer = () => ({
  fullName: '',
  phoneNo: '',
  email: '',
  gender: '',
  city: '',
  province: '',
  dateOfBirth: '',
  address: '',
  password: '',
  confirmPassword: '',
});

export default function AddVolunteer({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { councilId, memberId } = route.params || {};
  const [loading, setLoading] = useState(false);


  const [volunteers, setVolunteers] = useState([emptyVolunteer()]);
  const [errors, setErrors] = useState([{}]);

  // ─── Field update ────────────────────────────────────────────────────────────
  const updateField = (index, field, value) => {
    const updated = [...volunteers];
    updated[index] = { ...updated[index], [field]: value };
    setVolunteers(updated);

    // Clear error for that field on change
    const updatedErrors = [...errors];
    if (updatedErrors[index]) {
      updatedErrors[index] = { ...updatedErrors[index], [field]: '' };
      setErrors(updatedErrors);
    }
  };


useEffect(() => {
  getUserData();
}, []);

const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');

    if (userData) {
      const parsed = JSON.parse(userData);

      console.log('User Data:', parsed);

      setCouncilId(
        parsed.councilId ||
        parsed.CouncilId ||
        parsed.councilID
      );
    }
  } catch (error) {
    console.log(error);
  }
};
  // ─── Add another volunteer card ──────────────────────────────────────────────
  const addVolunteerCard = () => {
    setVolunteers([...volunteers, emptyVolunteer()]);
    setErrors([...errors, {}]);
  };

  // ─── Remove a volunteer card ─────────────────────────────────────────────────
  const removeVolunteerCard = (index) => {
    if (volunteers.length === 1) {
      Alert.alert('Cannot Remove', 'At least one volunteer entry is required.');
      return;
    }
    const updated = volunteers.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setVolunteers(updated);
    setErrors(updatedErrors);
  };

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    let isValid = true;
    const newErrors = volunteers.map((v) => {
      const e = {};
      if (!v.fullName.trim()) e.fullName = 'Full name is required.';
      if (!v.phoneNo.trim()) e.phoneNo = 'Phone number is required.';
      else if (!/^\d{7,15}$/.test(v.phoneNo.trim())) e.phoneNo = 'Enter a valid phone number.';
      if (!v.email.trim()) e.email = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(v.email.trim())) e.email = 'Enter a valid email.';
      if (!v.gender) e.gender = 'Please select a gender.';
      if (!v.city.trim()) e.city = 'City is required.';
      if (!v.province.trim()) e.province = 'Province is required.';
      if (!v.dateOfBirth.trim()) e.dateOfBirth = 'Date of birth is required.';
      else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v.dateOfBirth.trim()))
        e.dateOfBirth = 'Use format DD/MM/YYYY.';
      if (!v.address.trim()) e.address = 'Address is required.';
      if (!v.password) e.password = 'Password is required.';
      else if (v.password.length < 6) e.password = 'Minimum 6 characters.';
      if (!v.confirmPassword) e.confirmPassword = 'Please confirm password.';
      else if (v.password !== v.confirmPassword) e.confirmPassword = 'Passwords do not match.';
      if (Object.keys(e).length > 0) isValid = false;
      return e;
    });
    setErrors(newErrors);
    return isValid;
  };

const convertDate = (dateString) => {
  try {
    const [day, month, year] = dateString.split('/');

    return `${year}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0'
    )}`;
  } catch {
    return '';
  }
};
  // ─── Submit ───────────────────────────────────────────────────────────────────
 const handleAdd = async () => {
   if (!validate()) {
     Alert.alert(
       'Validation Error',
       'Please fix the highlighted fields before submitting.'
     );
     return;
   }

   try {
     setLoading(true);

     const employees = volunteers.map((volunteer) => ({
       PhoneNo: volunteer.phoneNo,
       Full_Name: volunteer.fullName,
       Gender: volunteer.gender === 'Male' ? 'M' : 'F',
       DoB: convertDate(volunteer.dateOfBirth),
       Province: volunteer.province,
       City: volunteer.city,
       Address: volunteer.address,
       Password: volunteer.password,
       Date_joined: new Date().toISOString().split('T')[0],
       Email: volunteer.email,
     }));

     const payload = {
       CouncilId: councilId,
       Employees: employees,
     };

     console.log(
       'Add Volunteer Payload:',
       JSON.stringify(payload, null, 2)
     );

     const response = await fetch(
       `${baseURL}Account/AddEmployees`,
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
       }
     );

     const data = await response.json().catch(() => null);

     console.log('Add Volunteer Response:', data);

     if (response.ok) {
       Alert.alert(
         'Success',
         `${volunteers.length} volunteer(s) added successfully.`,
         [
           {
             text: 'OK',
             onPress: () => navigation.goBack(),
           },
         ]
       );
     } else {
       Alert.alert(
         'Error',
         data?.message || 'Failed to add volunteers.'
       );
     }
   } catch (error) {
     console.log(error);

     Alert.alert(
       'Error',
       'Something went wrong while adding volunteers.'
     );
   } finally {
     setLoading(false);
   }
 };

  const handleCancel = () => {
    navigation.goBack();
  };

  // ─── Single volunteer card ────────────────────────────────────────────────────
  const renderVolunteerCard = (volunteer, index) => {
    const e = errors[index] || {};
    return (
      <View key={index} style={styles.card}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Volunteer #{index + 1}</Text>
          <TouchableOpacity onPress={() => removeVolunteerCard(index)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>✕ Remove</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <InputField
          label="Full Name"
          placeholder="Enter full name"
          value={volunteer.fullName}
          onChangeText={(v) => updateField(index, 'fullName', v)}
          error={e.fullName}
        />

        {/* Phone No */}
        <InputField
          label="Phone Number"
          placeholder="e.g. 03001234567"
          value={volunteer.phoneNo}
          onChangeText={(v) => updateField(index, 'phoneNo', v)}
          keyboardType="phone-pad"
          error={e.phoneNo}
        />

        {/* Email */}
        <InputField
          label="Email"
          placeholder="email@example.com"
          value={volunteer.email}
          onChangeText={(v) => updateField(index, 'email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={e.email}
        />

        {/* Gender */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  volunteer.gender === option && styles.genderOptionSelected,
                ]}
                onPress={() => updateField(index, 'gender', option)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    volunteer.gender === option && styles.radioCircleFilled,
                  ]}
                />
                <Text
                  style={[
                    styles.genderLabel,
                    volunteer.gender === option && styles.genderLabelSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {e.gender ? <Text style={styles.errorText}>{e.gender}</Text> : null}
        </View>

        {/* City */}
        <InputField
          label="City"
          placeholder="Enter city"
          value={volunteer.city}
          onChangeText={(v) => updateField(index, 'city', v)}
          error={e.city}
        />

        {/* Province */}
        <InputField
          label="Province"
          placeholder="Enter province"
          value={volunteer.province}
          onChangeText={(v) => updateField(index, 'province', v)}
          error={e.province}
        />

        {/* Date of Birth */}
        <InputField
          label="Date of Birth"
          placeholder="DD/MM/YYYY"
          value={volunteer.dateOfBirth}
          onChangeText={(v) => updateField(index, 'dateOfBirth', v)}
          keyboardType="numbers-and-punctuation"
          error={e.dateOfBirth}
        />

        {/* Address */}
        <InputField
          label="Address"
          placeholder="Enter full address"
          value={volunteer.address}
          onChangeText={(v) => updateField(index, 'address', v)}
          multiline
          numberOfLines={2}
          error={e.address}
        />

        {/* Password */}
        <InputField
          label="Password"
          placeholder="Min. 6 characters"
          value={volunteer.password}
          onChangeText={(v) => updateField(index, 'password', v)}
          secureTextEntry
          error={e.password}
        />

        {/* Confirm Password */}
        <InputField
          label="Confirm Password"
          placeholder="Re-enter password"
          value={volunteer.confirmPassword}
          onChangeText={(v) => updateField(index, 'confirmPassword', v)}
          secureTextEntry
          error={e.confirmPassword}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.addButtonText}>
            Add {volunteers.length > 1 ? `(${volunteers.length})` : ''}
          </Text>
        )}
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Render all volunteer cards */}
        {volunteers.map((vol, index) => renderVolunteerCard(vol, index))}

        {/* Add Another Volunteer Button */}
        <TouchableOpacity style={styles.addMoreBtn} onPress={addVolunteerCard}>
          <Text style={styles.addMoreBtnText}>＋ Add Another Volunteer</Text>
        </TouchableOpacity>

        {/* Summary strip */}
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            {volunteers.length} volunteer{volunteers.length > 1 ? 's' : ''} ready to submit
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>
              Add {volunteers.length > 1 ? `(${volunteers.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>


    </SafeAreaView>
  );
}

// ─── Reusable InputField component ───────────────────────────────────────────
function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'words',
  multiline = false,
  numberOfLines = 1,
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ── Header ──
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },

  // ── Scroll area ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },

  // ── Volunteer card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0d4b0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0C38E',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e07b54',
  },
  removeBtnText: {
    color: '#c0392b',
    fontWeight: '700',
    fontSize: 13,
  },

  // ── Form fields ──
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    marginTop: 3,
    marginLeft: 2,
  },

  // ── Gender selector ──
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    flex: 1,
    justifyContent: 'center',
  },
  genderOptionSelected: {
    borderColor: '#eab676',
    backgroundColor: '#fef3e2',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#aaa',
    marginRight: 8,
  },
  radioCircleFilled: {
    borderColor: '#eab676',
    backgroundColor: '#eab676',
  },
  genderLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  genderLabelSelected: {
    color: '#000',
  },

  // ── Add More button ──
  addMoreBtn: {
    width: screenWidth * 0.7,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eab676',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMoreBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c17f3e',
  },

  // ── Summary strip ──
  summaryStrip: {
    backgroundColor: '#fef3e2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0c87a',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a5200',
  },

  // ── Action buttons ──
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eab676',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#c17f3e',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#eab676',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#eab676',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});