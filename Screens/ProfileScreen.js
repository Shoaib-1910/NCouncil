import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';
import WavyBackground from '../Background/WavyBackground';
import baseURL from './Api';

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const [userData, setUserData]                   = useState(null);
  const [loginHistory, setLoginHistory]           = useState([]);
  const [failedAttempts, setFailedAttempts]       = useState([]);

  // Change Password modal state
  const [cpVisible, setCpVisible]                 = useState(false);
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [showCurrent, setShowCurrent]             = useState(false);
  const [showNew, setShowNew]                     = useState(false);
  const [cpLoading, setCpLoading]                 = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchLoginHistory();
    fetchFailedAttempts();
  }, []);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      if (jsonValue != null) setUserData(JSON.parse(jsonValue));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('loginHistory');
      if (history) setLoginHistory(JSON.parse(history));
    } catch (error) {
      console.error('Failed to fetch login history:', error);
    }
  };

  const fetchFailedAttempts = async () => {
    try {
      const raw = await AsyncStorage.getItem('failedAttemptHistory');
      if (raw) setFailedAttempts(JSON.parse(raw));
    } catch (error) {
      console.error('Failed to fetch failed attempts:', error);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
const [confirmPassword, setConfirmPassword] = useState('');
const [showConfirm, setShowConfirm] = useState(false);

const openChangePassword = () => {
  setCurrentPassword('');
  setNewPassword('');
  setConfirmPassword('');
  setShowCurrent(false);
  setShowNew(false);
  setShowConfirm(false);
  setCpVisible(true);
};

const handleChangePassword = async () => {
  if (
    !currentPassword.trim() ||
    !newPassword.trim() ||
    !confirmPassword.trim()
  ) {
    Alert.alert('Validation', 'Please fill all fields.');
    return;
  }

  if (newPassword.length < 6) {
    Alert.alert(
      'Validation',
      'New password must be at least 6 characters.'
    );
    return;
  }

  if (currentPassword === newPassword) {
    Alert.alert(
      'Validation',
      'New password must be different from current password.'
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert(
      'Validation',
      'New Password and Confirm Password do not match.'
    );
    return;
  }

  try {
    setCpLoading(true);

    const payload = {
      MemberId: userData?.memberId || userData?.MemberId,
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    };

    console.log('Change Password Payload:', payload);

    const response = await fetch(
      `${baseURL}Account/ChangePassword`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => null);

    console.log('Change Password Response:', data);

    if (response.ok) {
      Alert.alert(
        'Success',
        data?.message || 'Password changed successfully. Please login again.',
        [
          {
            text: 'OK',
            onPress: async () => {
              try {
                // Clear all stored user data
                await AsyncStorage.removeItem('userData');

                // Optional: clear other app data
                await AsyncStorage.removeItem('loginHistory');
                await AsyncStorage.removeItem('failedAttemptHistory');

                setCpVisible(false);

                // Reset navigation stack and send to Login
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (err) {
                console.log('Logout error:', err);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Error',
        data?.message || 'Failed to change password.'
      );
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    Alert.alert(
      'Error',
      'Something went wrong. Please try again later.'
    );
  } finally {
    setCpLoading(false);
  }
};

  // ── Render helpers ─────────────────────────────────────────────────────────

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.header}>User Profile</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Info Card ─────────────────────────────────────────── */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{userData?.fullName || 'User Name'}</Text>

            <InfoRow label="Phone" value={userData?.phoneNo} />
            <InfoRow
              label="Gender"
              value={
                userData?.gender === 'M'
                  ? 'Male'
                  : userData?.gender === 'F'
                  ? 'Female'
                  : '-'
              }
            />
            <InfoRow
              label="Date of Birth"
              value={
                userData?.dateOfBirth
                  ? new Date(userData.dateOfBirth).toDateString()
                  : '-'
              }
            />
            <InfoRow label="Province" value={userData?.province} />
            <InfoRow label="City"     value={userData?.city} />
            <InfoRow label="Address"  value={userData?.address} />
            <InfoRow
              label="Date Joined"
              value={
                userData?.dateJoined
                  ? new Date(userData.dateJoined).toDateString()
                  : '-'
              }
            />

            {/* Change Password Button */}
            <TouchableOpacity style={styles.changePassBtn} onPress={openChangePassword}>
              <Text style={styles.changePassBtnText}>🔑  Change Password</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* ── Failed Login Attempts ─────────────────────────────────────── */}
        <Card style={styles.card}>
          <Card.Content>
            <SectionHeader title="⚠️  Failed Login Attempts" />

            {failedAttempts.length === 0 ? (
              <Text style={styles.emptyText}>No failed login attempts.</Text>
            ) : (
              failedAttempts.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>✕</Text>
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                    <Text style={styles.historyPhone}>📱 {item.phoneNo}</Text>
                    <Text style={styles.historyReason}>Reason: {item.reason}</Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* ── Login History ─────────────────────────────────────────────── */}
        <Card style={styles.card}>
          <Card.Content>
            <SectionHeader title="✅  Login History" />

            {loginHistory.length === 0 ? (
              <Text style={styles.emptyText}>No login history available.</Text>
            ) : (
              loginHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={[styles.historyBadge, styles.historyBadgeSuccess]}>
                    <Text style={styles.historyBadgeText}>✓</Text>
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                    <Text style={styles.historyPhone}>📱 {item.phoneNo}</Text>
                    <Text style={styles.historyMeta}>
                      🌐 {item.ip}
                    </Text>
                    <Text style={styles.historyMeta}>
                      📟 {item.device}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer image */}
      <Image
        source={require('../assets/Footer.png')}
        style={[styles.footer, { width }]}
        resizeMode="stretch"
      />

      {/* FAB for Edit */}
      <FAB
        style={styles.fab}
        color="#000"
        icon="pencil"
        onPress={() => Alert.alert('Edit Profile', 'This feature can be implemented later.')}
      />

      {/* ── Change Password Modal ──────────────────────────────────────────── */}
      <Modal
        visible={cpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Password</Text>

            {/* Current Password */}
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                placeholderTextColor="#999"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                style={styles.modalEye}
                onPress={() => setShowCurrent(v => !v)}
              >
                <IconButton
                  icon={showCurrent ? 'eye-off' : 'eye'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="New Password"
                placeholderTextColor="#999"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.modalEye}
                onPress={() => setShowNew(v => !v)}
              >
                <IconButton
                  icon={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={styles.modalEye}
                onPress={() => setShowConfirm(v => !v)}
              >
                <IconButton
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setCpVisible(false)}
                disabled={cpLoading}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnChange]}
                onPress={handleChangePassword}
                disabled={cpLoading}
              >
                {cpLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.modalBtnChangeText}>Change</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 200,
    paddingTop: 10,
    gap: 16,
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 16,
    color: 'black',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },

  // ── Info rows ─────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    flexShrink: 0,
    maxWidth: '40%',
  },
  value: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ── History items ─────────────────────────────────────────────────────────
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  historyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  historyBadgeSuccess: {
    backgroundColor: '#52c41a',
  },
  historyBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyDetails: {
    flex: 1,
    flexShrink: 1,
  },
  historyDate: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  historyPhone: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  historyReason: {
    fontSize: 12,
    color: '#ff4d4f',
  },
  historyMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 1,
  },

  // ── Change Password button ─────────────────────────────────────────────────
  changePassBtn: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
  },
  changePassBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },

  // ── Footer & FAB ──────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#f5d8a0',
  },

  // ── Change Password Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 13,
    paddingLeft: 16,
    paddingRight: 50,
    fontSize: 15,
    color: '#000',
  },
  modalEye: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalBtnCancelText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  modalBtnChange: {
    backgroundColor: '#f5d8a0',
  },
  modalBtnChangeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
});