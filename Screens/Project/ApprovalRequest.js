import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import WavyBackground2 from '../../Background/WavyBackground2';
import baseURL from '../Api';

export default function ApprovalRequest({ route, navigation }) {
  const { width } = useWindowDimensions();
  const councilId = route.params?.councilId || route.params?.councilID;
  const memberId = route.params?.memberID || route.params?.memberId;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!councilId) {
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}Announcement/GetRequestsByCouncil?councilId=${councilId}`
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } else if (response.status === 204) {
        setRequests([]);
      } else {
        console.log('Failed to fetch expense requests:', response.status);
      }
    } catch (error) {
      console.log('Error fetching expense requests:', error);
      Alert.alert('Error', 'Unable to load expense requests right now.');
    } finally {
      setLoading(false);
    }
  }, [councilId]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const updateLocalStatus = (requestId, status) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.Id === requestId ? { ...request, Status: status } : request
      )
    );
  };

  const submitApproval = async (requestId, status) => {
    if (!memberId) {
      Alert.alert('Error', 'User not found for approval action.');
      return;
    }

    setActionLoadingId(requestId);
    try {
      const response = await fetch(
        `${baseURL}Announcement/PostRequestApproval?requestId=${requestId}&userId=${memberId}&status=${status}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        updateLocalStatus(requestId, status);
      } else {
        console.log('Failed to update request status:', response.status);
        Alert.alert('Error', 'Unable to update request status.');
      }
    } catch (error) {
      console.log('Error updating request status:', error);
      Alert.alert('Error', 'Unable to update request status right now.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title || 'Untitled Request'}</Text>
      <Text style={styles.detailText}>Description: {item.Description || '-'}</Text>
      <Text style={styles.detailText}>Amount: Rs {item.Amount ?? 0}</Text>
      <Text style={styles.detailText}>Total Approvers: {item.TotalApprovers ?? 0}</Text>
      <Text style={styles.statusText}>Status: {item.Status || 'pending'}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => submitApproval(item.Id, 'approved')}
          disabled={actionLoadingId === item.Id}
        >
          <Text style={styles.actionButtonText}>
            {actionLoadingId === item.Id ? 'Please wait...' : 'Accept'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => submitApproval(item.Id, 'rejected')}
          disabled={actionLoadingId === item.Id}
        >
          <Text style={styles.actionButtonText}>
            {actionLoadingId === item.Id ? 'Please wait...' : 'Reject'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Expense Requests</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, index) =>
            item?.Id ? item.Id.toString() : `request-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No expense requests found.</Text>
          }
          onRefresh={fetchRequests}
          refreshing={loading}
        />
      )}

      <FAB
        style={styles.fab}
        color="#F0C38E"
        icon="plus"
        onPress={() =>
          navigation.navigate('AddExpenseRequest', {
            councilId,
            memberID: memberId,
          })
        }
      />

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
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 30,
    color: '#000',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  detailText: {
    color: '#444',
    marginBottom: 4,
  },
  statusText: {
    color: '#111',
    fontWeight: '700',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#7cc576',
    marginRight: 6,
  },
  rejectButton: {
    backgroundColor: '#e57373',
    marginLeft: 6,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '700',
  },
  emptyText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    left: 20,
    bottom: 90,
    backgroundColor: '#555',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
