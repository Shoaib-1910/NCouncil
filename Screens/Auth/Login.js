import React, { useCallback, useState } from 'react';
import {
  Text,
  Alert,
  View,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// ─── AsyncStorage Keys ───────────────────────────────────────────────────────
// Per-phone-number keys are dynamically built:
//   failedAttempts_<phoneNo>  → { count: number, lockedUntil: ISO string | null }
//   failedAttemptHistory      → array of { phoneNo, timestamp, reason }

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the lockout meta for a given phone number.
 * Shape: { count: number, lockedUntil: string | null }
 */
const getLockoutMeta = async (phoneNo) => {
  try {
    const raw = await AsyncStorage.getItem(`failedAttempts_${phoneNo}`);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
};

/**
 * Saves updated lockout meta for a given phone number.
 */
const saveLockoutMeta = async (phoneNo, meta) => {
  try {
    await AsyncStorage.setItem(`failedAttempts_${phoneNo}`, JSON.stringify(meta));
  } catch (error) {
    console.error('Failed to save lockout meta:', error);
  }
};

/**
 * Appends a failed attempt record to the global history list (kept for display).
 * Each record: { phoneNo, timestamp, reason }
 */
const appendFailedAttemptHistory = async (phoneNo, reason = 'Invalid credentials') => {
  try {
    const raw = await AsyncStorage.getItem('failedAttemptHistory');
    const history = raw ? JSON.parse(raw) : [];

    const newRecord = {
      phoneNo,
      timestamp: new Date().toISOString(),
      reason,
    };

    // Keep the latest 50 records to avoid unbounded growth
    const updated = [newRecord, ...history].slice(0, 50);
    await AsyncStorage.setItem('failedAttemptHistory', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to append failed attempt history:', error);
  }
};

/**
 * Resets the failed-attempt counter for a phone number after a successful login.
 */
const resetLockoutMeta = async (phoneNo) => {
  try {
    await AsyncStorage.removeItem(`failedAttempts_${phoneNo}`);
  } catch (error) {
    console.error('Failed to reset lockout meta:', error);
  }
};

/**
 * Returns a human-readable remaining lockout time string, e.g. "45 minutes 12 seconds".
 */
const formatRemainingTime = (lockedUntilISO) => {
  const remaining = new Date(lockedUntilISO).getTime() - Date.now();
  if (remaining <= 0) return '0 seconds';
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  if (mins > 0) return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  return `${secs} second${secs !== 1 ? 's' : ''}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Login() {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
          'Confirm Exit',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  // ── Save logged-in user data ──────────────────────────────────────────────
  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  // ── Add login history (successful logins) ────────────────────────────────
  const addLoginHistory = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      const deviceName = (await DeviceInfo.getModel()) || 'Unknown Device';

      const newRecord = {
        timestamp: new Date().toISOString(),
        ip,
        device: deviceName,
        phoneNo,
      };

      const existingHistory = await AsyncStorage.getItem('loginHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [newRecord, ...history].slice(0, 10);

      await AsyncStorage.setItem('loginHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to add login history:', error);
    }
  };

  // ── Core login handler ────────────────────────────────────────────────────
  const handlePress = async () => {
    // ── Basic field validation ──────────────────────────────────────────────
    if (!phoneNo.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter your credentials!');
      return;
    }

    if (phoneNo.length !== 11) {
      Alert.alert('Validation', 'Phone Number should be 11 digits.');
      return;
    }

    // ── Check lockout status for this phone number ──────────────────────────
    const meta = await getLockoutMeta(phoneNo);

    if (meta.lockedUntil) {
      const lockedUntilTime = new Date(meta.lockedUntil).getTime();

      if (Date.now() < lockedUntilTime) {
        // Still locked — inform user with remaining time
        const remaining = formatRemainingTime(meta.lockedUntil);
        Alert.alert(
          '🔒 Account Temporarily Locked',
          `Too many failed login attempts for this number.\n\nPlease try again in ${remaining}.`,
          [{ text: 'OK' }]
        );
        return;
      } else {
        // Lockout has expired — reset counter and allow login
        await resetLockoutMeta(phoneNo);
      }
    }

    // ── Proceed with API login ──────────────────────────────────────────────
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `${baseURL}Account/Login?phoneNo=${phoneNo}&password=${password}`
      );
      const json = await response.json();

      // ── SUCCESS ────────────────────────────────────────────────────────────
      if (response.ok && json.data) {
        console.log('Login API response data:', json.data);

        const userData = {
          memberId: json.data.id,
          phoneNo: json.data.PhoneNo,
          fullName: json.data.Full_Name,
          gender: json.data.Gender,
          dateOfBirth: json.data.DoB,
          province: json.data.Province,
          city: json.data.City,
          address: json.data.Address,
          password: json.data.Password,
          dateJoined: json.data.Date_joined,
          roleId: json.data.RoleId ?? json.data.roleId ?? null,
        };

        console.log('User data being stored:', userData);

        await storeUserData(userData);
        await AsyncStorage.setItem('userToken', 'LoggedIn');

        // Reset any previous failed-attempt counter on successful login
        await resetLockoutMeta(phoneNo);

        await addLoginHistory();
        navigation.navigate('HomeScreen', { memberID: json.data.PhoneNo });

      // ── WRONG PASSWORD (401) ──────────────────────────────────────────────
      } else if (response.status === 401) {
        await handleFailedAttempt(phoneNo, 'Incorrect password');

      // ── PHONE NOT REGISTERED ──────────────────────────────────────────────
      } else {
        await handleFailedAttempt(phoneNo, 'No member registered with this number');
      }

    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Failed to log in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ── Failed attempt logic ──────────────────────────────────────────────────
  /**
   * Increments the failed attempt counter for the given phone number,
   * locks the account if the threshold is reached, and persists a history record.
   */
  const handleFailedAttempt = async (phone, reason) => {
    // 1. Persist to the global history log (for later display)
    await appendFailedAttemptHistory(phone, reason);

    // 2. Load current meta and increment counter
    const currentMeta = await getLockoutMeta(phone);
    const newCount = (currentMeta.count || 0) + 1;

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      // Lock the account for LOCKOUT_DURATION_MS
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      await saveLockoutMeta(phone, { count: newCount, lockedUntil });

      Alert.alert(
        '🔒 Account Locked',
        `You have made ${MAX_FAILED_ATTEMPTS} failed login attempts.\n\nThis phone number is locked for 1 hour. Please try again later.`,
        [{ text: 'OK' }]
      );
    } else {
      // Still have attempts remaining — save updated counter
      const attemptsLeft = MAX_FAILED_ATTEMPTS - newCount;
      await saveLockoutMeta(phone, { count: newCount, lockedUntil: null });

      Alert.alert(
        'Login Failed',
        `${reason}.\n\nFailed attempts: ${newCount}/${MAX_FAILED_ATTEMPTS}\nYou have ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before this number is locked for 1 hour.`,
        [{ text: 'OK' }]
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <WavyBackground />

      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/UserProfile.png')}
            style={styles.image}
          />
        </View>
      </View>

      <Text style={styles.title1}>Hello there!</Text>
      <Text style={styles.title}>Sign In to Continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone No"
        keyboardType="phone-pad"
        value={phoneNo}
        onChangeText={setPhoneNo}
        placeholderTextColor="#000"
      />

      <View style={styles.container2}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#000"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.icon}
        >
          <IconButton
            icon={showPassword ? 'eye-off' : 'eye'}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.signInButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          Don't have an account?{' '}
          <Text style={styles.signUpLink}>Sign Up!</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: { marginBottom: 40 },
  image: { height: 150, width: 150 },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  title1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'KronaOne-Regular',
    color: '#000',
  },
  container2: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
  },
  inputPassword: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
    color: 'black',
    paddingRight: 50,
  },
  icon: {
    position: 'absolute',
    right: '12%',
    justifyContent: 'center',
    height: '90%',
  },
  signInButton: {
    width: '80%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  signUpText: { color: '#A0A0A0' },
  signUpLink: { color: '#F0C38E', fontWeight: 'bold' },
});