import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

const EVENT_STORAGE_KEY = 'NCouncilEvents';
const APPROVED_EVENTS_KEY = 'NCouncilApprovedEvents';

export default function ApproveEvent({ navigation, route }) {
  const { councilId, memberId } = route.params || {};
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState(null);

const loadPendingEvents = async () => {
  try {
    setLoading(true);

    const url = `${baseURL}Account/GetPendingEvents?councilId=${councilId}`;
    console.log('GetPendingEvents URL:', url);

    const response = await fetch(url);

    console.log('GetPendingEvents Status:', response.status);

    const data = await response.json();

    console.log('Pending Events:', data);

    if (response.ok) {
      setPendingEvents(data || []);
    } else {
      setPendingEvents([]);
      Alert.alert('Error', `Failed to load pending events (status ${response.status}).`);
    }
  } catch (error) {
    console.log('GetPendingEvents Error:', error);
    Alert.alert('Error', `Failed to load pending events: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const updateEventStatus = async (eventId, status) => {
    try {
      setUpdatingEventId(eventId);

      const payload = {
        EventId: eventId,
        Status: status,
      };

      console.log('UpdateEventStatus Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${baseURL}Account/UpdateEventStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log('UpdateEventStatus Response:', data);

      if (response.ok) {
        // Remove the event from the pending list now that it's been actioned
        setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));
        Alert.alert('Success', data?.message || `Event ${status.toLowerCase()} successfully.`);
      } else {
        Alert.alert('Error', data?.message || `Failed to ${status.toLowerCase()} event.`);
      }
    } catch (error) {
      console.log('UpdateEventStatus Error:', error);
      Alert.alert('Error', 'Something went wrong while updating the event.');
    } finally {
      setUpdatingEventId(null);
    }
  };

  useEffect(() => {
    if (!councilId) {
      setLoading(false);
      Alert.alert('Error', 'Missing council information. Please go back and try again.');
      return;
    }
    loadPendingEvents();
  }, [councilId]);

const handleApprove = (eventId) => {
  Alert.alert(
    'Approve Event',
    'Are you sure you want to approve this event?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Approve',
        onPress: () =>
          updateEventStatus(
            eventId,
            'Approved'
          ),
      },
    ]
  );
};

// const handleReject = (eventId) => {
//   Alert.alert(
//     'Reject Event',
//     'Are you sure you want to reject this event?',
//     [
//       {
//         text: 'Cancel',
//         style: 'cancel',
//       },
//       {
//         text: 'Reject',
//         onPress: () =>
//           updateEventStatus(
//             eventId,
//             'Rejected'
//           ),
//       },
//     ]
//   );
// };

  const renderEventItem = ({ item }) => {
    const eventDate = item.Date
      ? new Date(item.Date)
      : null;
    const dateLabel = eventDate ? eventDate.toLocaleDateString() : 'No date';
    const timeLabel = eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time';
    const isUpdating = updatingEventId === item.id;

    return (
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>
          {item.Tittle}
        </Text>
        <Text style={styles.eventCategory}>
          {item.Cat || 'General'}
        </Text>
        <Text style={styles.eventText}>
          {item.Desciption}
        </Text>
        <Text style={styles.eventText}>
          Location: {item.location || '-'}
        </Text>
        <Text style={styles.eventText}>Date: {dateLabel}</Text>
        <Text style={styles.eventText}>Time: {timeLabel}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton, isUpdating && { opacity: 0.6 }]}
            onPress={() => handleApprove(item.id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Approve</Text>
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.button, styles.rejectButton, isUpdating && { opacity: 0.6 }]}
            onPress={() => handleReject(item.id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Reject</Text>
            )}
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Event Approval</Text>
        <Text style={styles.headerSubtitle}>Review and approve pending event proposals</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#eab676" />
        </View>
      ) : (
        <FlatList
          data={pendingEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEventItem}
          contentContainerStyle={styles.eventList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending events to approve</Text>
            </View>
          }
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
    paddingTop: 30,
    paddingBottom: 20,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: '#fff8ef',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f0d7b0',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'black',
  },
  eventCategory: {
    fontSize: 14,
    color: '#736357',
    marginBottom: 10,
  },
  eventText: {
    color: '#333',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});