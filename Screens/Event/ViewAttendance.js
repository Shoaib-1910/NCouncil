import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

export default function ViewAttendance({ navigation, route }) {
  const { eventId } = route.params || {};

  const { councilId, memberId } = route.params || {};
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

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

  const loadAttendance = useCallback(async () => {
    if (!eventId || !councilId) {
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `${baseURL}Account/GetEventAttendance?eventId=${eventId}&councilId=${councilId}`
      );
      const data = await response.json();
      if (response.ok) {
        setAttendanceList(Array.isArray(data) ? data : []);
      } else {
        setAttendanceList([]);
        setErrorMsg('Failed to load attendance.');
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setAttendanceList([]);
      setErrorMsg('Something went wrong while loading attendance.');
    } finally {
      setLoading(false);
    }
  }, [eventId, councilId]);

  useEffect(() => {
    if (eventId && councilId) {
      loadAttendance();
    }
  }, [eventId, councilId, loadAttendance]);

  const renderAttendance = ({ item }) => {
    const checkin = item.checkinTime ? new Date(item.checkinTime) : null;
    const dateLabel = checkin ? checkin.toLocaleDateString() : 'No date';
    const timeLabel = checkin ? checkin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time';

    return (
      <View style={styles.attendanceCard}>
        <Text style={styles.attendeeName}>{item.Name}</Text>
        <Text style={styles.attendeeRole}>{item.roleName || 'N/A'}</Text>
        <Text style={styles.attendanceText}>Check-in: {dateLabel} at {timeLabel}</Text>
        {!!item.feedBack && (
          <Text style={styles.attendanceText}>Feedback: {item.feedBack}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Event Attendance</Text>
        <Text style={styles.headerSubtitle}>
          {attendanceList.length > 0
            ? `${attendanceList.length} attendee${attendanceList.length > 1 ? 's' : ''} checked in`
            : 'See who has checked in for this event.'}
        </Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadAttendance}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#eab676" />
        </View>
      ) : errorMsg ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>{errorMsg}</Text>
        </View>
      ) : (
        <FlatList
          data={attendanceList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAttendance}
          contentContainerStyle={styles.attendanceListContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found for this event.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 10,
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
  },
  refreshButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
    backgroundColor: '#eab676',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceListContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 40,
  },
  attendanceCard: {
    backgroundColor: '#fff8ef',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f0d7b0',
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'black',
  },
  attendeeRole: {
    fontSize: 14,
    color: '#736357',
    marginBottom: 10,
  },
  attendanceText: {
    color: '#333',
    marginBottom: 4,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});