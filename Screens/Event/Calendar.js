import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

export default function EventCalendar({ navigation, route }) {
  const { councilId, memberId, role } = route.params || {};
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  // Residents can only view events, not create or approve
  // Define what each role can do, in one place.
  const ROLE_PERMISSIONS = {
    Chairman: {
      canCreate: true,
      canApprove: true,      // "Requests" button
      canAddVolunteer: true,
      canMarkAttendance: true,
      canViewAttendance: true,
    },
    CommitteeMember: {
      canCreate: true,
      canApprove: false,
      canAddVolunteer: true,
      canMarkAttendance: true,
      canViewAttendance: false,
    },
    Treasurer: {
      canCreate: true,
      canApprove: false,
      canAddVolunteer: false,
      canMarkAttendance: false,
      canViewAttendance: false,   // example — adjust to whatever Treasurer actually needs
    },
      Secratary: {
      canCreate: true,
      canApprove: false,
      canAddVolunteer: true,
      canMarkAttendance: true,   // example
      canViewAttendance: true,
    },
    Resident: {
      canCreate: false,
      canApprove: false,
      canAddVolunteer: false,
      canMarkAttendance: true,   // example
      canViewAttendance: false,
    },
  };

  // Fallback: any unrecognized/missing role gets zero permissions (safe default).
  const permissions = ROLE_PERMISSIONS[role] || {
    canCreate: false,
    canApprove: false,
    canAddVolunteer: false,
    canMarkAttendance: false,
    canViewAttendance: false,
  };


  const loadEvents = useCallback(async (dateToLoad) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `${baseURL}Account/GetApprovedEvents?councilId=${councilId}&date=${dateToLoad}`
      );
      const data = await response.json();
      if (response.ok) {
        // Normalize API field names (Tittle/Desciption/Date/Cat) into consistent keys
        const normalized = (Array.isArray(data) ? data : []).map((event) => ({
          id: event.id,
          title: event.Tittle ?? event.title ?? '',
          description: event.Desciption ?? event.description ?? '',
          location: event.location ?? '',
          dateTime: event.Date ?? event.dateTime ?? '',
          category: event.Cat ?? event.category ?? 'General',
          status: event.status ?? 'PENDING',
          councilId: event.councilid ?? event.councilId,
        }));
        setEvents(normalized);
      } else {
        setEvents([]);
        setErrorMsg('Failed to load events.');
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
      setErrorMsg('Something went wrong while loading events.');
    } finally {
      setLoading(false);
    }
  }, [councilId]);

  // Refetch whenever the selected date (or council) changes
  useEffect(() => {
    if (councilId && selectedDate) {
      loadEvents(selectedDate);
    }
  }, [councilId, selectedDate, loadEvents]);

  useEffect(() => {
    if (route.params?.refreshEvents) {
      loadEvents(selectedDate);
    }
  }, [route.params?.refreshEvents]);

  // Events are already scoped to selectedDate by the API call
  const eventsForSelectedDate = events;

  const markedDates = events.reduce((marked, event) => {
    const eventDate = event.dateTime ? event.dateTime.split('T')[0] : null;
    if (!eventDate) {
      return marked;
    }

    marked[eventDate] = {
      marked: true,
      dotColor: '#eab676',
    };

    return marked;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#ffc56a',
    };
  }

  const renderEvent = ({ item }) => {
    const eventDate = item.dateTime ? new Date(item.dateTime) : null;
    const dateLabel = eventDate ? eventDate.toLocaleDateString() : 'No date';
    const timeLabel = eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time';

    return (
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventCategory}>{item.category || 'General'}</Text>
        <Text style={styles.eventText}>{item.description}</Text>
        <Text style={styles.eventText}>Location: {item.location || 'Not set'}</Text>
        <Text style={styles.eventText}>Date: {dateLabel}</Text>
        <Text style={styles.eventText}>Time: {timeLabel}</Text>
        <Text style={styles.eventText}>Status: {item.status || 'PENDING'}</Text>

        <View style={styles.attendanceButtonRow}>
          {permissions.canMarkAttendance && (
            <TouchableOpacity
              style={styles.markAttendanceButton}
              onPress={() => navigation.navigate('MarkAttendance', { eventId: item.id, councilId })}
            >
              <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
            </TouchableOpacity>
          )}
          {permissions.canViewAttendance && (
            <TouchableOpacity
              style={styles.viewAttendanceButton}
              onPress={() => navigation.navigate('ViewAttendance', { eventId: item.id, councilId })}
            >
              <Text style={styles.attendanceButtonText}>View Attendance</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Community Event Calendar</Text>
        <Text style={styles.headerSubtitle}>Tap a date to see events and create new ones.</Text>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#f4b35b',
            selectedDayTextColor: 'black',
            todayTextColor: '#eab676',
            arrowColor: '#eab676',
            monthTextColor: 'black',
          }}
        />
      </View>
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {eventsForSelectedDate.length > 0
            ? `${eventsForSelectedDate.length} event${eventsForSelectedDate.length > 1 ? 's' : ''} on ${selectedDate}`
            : `No events found for ${selectedDate}`}
        </Text>
        <View style={styles.buttonGroup}>
          {permissions.canCreate && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('AddEvent', { councilId, memberId })}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          )}
          {permissions.canApprove && (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => navigation.navigate('ApproveEvent', { councilId, memberId })}
            >
              <Text style={styles.createButtonText}>Requests</Text>
            </TouchableOpacity>
          )}
          {permissions.canAddVolunteer && (
            <TouchableOpacity
              style={styles.addVolunterButton}
              onPress={() => navigation.navigate('AddVolunter', { councilId, memberId })}
            >
              <Text style={styles.createButtonText}>Add Volunter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
          data={eventsForSelectedDate}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={styles.eventList}
          ListEmptyComponent={<Text style={styles.emptyText}>No events are scheduled for this date.</Text>}
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
  calendarContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  createButton: {
    backgroundColor: '#eab676',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 6,
  },
  addVolunterButton: {
    backgroundColor: '#2D9596',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'black',
    fontWeight: 'bold',
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
  attendanceButtonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  markAttendanceButton: {
    backgroundColor: '#eab676',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
  },
  viewAttendanceButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  attendanceButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});