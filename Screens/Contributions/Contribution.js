import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image, useWindowDimensions, TextInput } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { Picker } from '@react-native-picker/picker';

const ManageContributionsScreen = ({ route }) => {
  const [residents, setResidents] = useState([]);
  const [monthYear, setMonthYear] = useState(''); // Selected month_year filter
  const [availableMonths, setAvailableMonths] = useState([]); // Available months/years for dropdown
  const { councilId } = route.params;
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0 });
  const [isNotified, setIsNotified] = useState(false);
  const [isNewMonth, setIsNewMonth] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(0);
  const width = useWindowDimensions();

  // Fetch available months/years for the filter
  const fetchAvailableMonths = async () => {
    try {
      const response = await fetch(`${baseURL}MonthlyContributions/GetAvailableMonths?councilId=${councilId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableMonths(data); // e.g., ["01-2025", "02-2025"]
        setMonthYear(data[0]); // Default to the first available month
      } else {
        console.log('Failed to fetch available months');
      }
    } catch (error) {
      console.error('Error fetching months:', error);
    }
  };

  const fetchResidentsData = async () => {
    try {
      const response = await fetch(`${baseURL}MonthlyContributions/GetContributions?councilId=${councilId}&monthYear=${monthYear}`);
      if (response.ok) {
        const data = await response.json();
        setResidents(data.residents);
        setSummary({ totalPaid: data.totalPaid, totalPending: data.totalPending });
        setIsNotified(true); // Check if any residents are notified
      } else {
        console.log('Failed to fetch resident data');
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const notifyResidents = async () => {
    if (!contributionAmount || isNaN(contributionAmount) || contributionAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount.');
      return;
    }

    try {
      const response = await fetch(`${baseURL}MonthlyContributions/NotifyResidents?councilId=${councilId}&amount=${contributionAmount}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        Alert.alert('Success', 'Residents notified successfully!');
        setIsNotified(true);
        fetchResidentsData();
        fetchAvailableMonths();
      } else {
        console.log('Failed to notify residents');
      }
    } catch (error) {
      console.error('Error notifying residents:', error);
    }
  };

  // const notifyResidents = async () => {
  //   try {
  //     const response = await fetch(`${baseURL}MonthlyContributions/NotifyResidents?councilId=${councilId}&monthYear=${monthYear}`, {
  //       method: 'POST',
  //     });
  //     if (response.ok) {
  //       Alert.alert('Success', 'Residents notified successfully!');
  //       setIsNotified(true);
  //       fetchResidentsData();
  //       fetchAvailableMonths();
  //     } else {
  //       console.log('Failed to notify residents');
  //     }
  //   } catch (error) {
  //     console.error('Error notifying residents:', error);
  //   }
  // };

  const reNotifyUnpaidResidents = async () => {
    try {
      const response = await fetch(`${baseURL}MonthlyContributions/ReNotifyUnpaidResidents?councilId=${councilId}&monthYear=${monthYear}`, {
        method: 'POST',
      });
      if (response.ok) {
        Alert.alert('Success', 'Unpaid residents re-notified successfully!');
        fetchResidentsData();
      } else {
        console.log('Failed to re-notify unpaid residents');
      }
    } catch (error) {
      console.error('Error re-notifying residents:', error);
    }
  };

  const checkNewMonth = async () => {
    try {
      const response = await fetch(`${baseURL}MonthlyContributions/CheckNewMonthNotification?councilId=${councilId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Is new Month Started? '+data.isNewMonth)
        setIsNewMonth(data.isNewMonth);
        setIsNotified(false)
      } else {
        console.log('Failed to check new month status');
      }
    } catch (error) {
      console.error('Error checking new month:', error);
    }
  };
  
  useEffect(() => {
    
  }, [councilId]);
  

  const markAsPaid = async (residentId) => {
    try {
      const response = await fetch(`${baseURL}MonthlyContributions/MarkAsPaid?residentId=${residentId}&councilId=${councilId}&monthYear=${monthYear}`, {
        method: 'POST',
      });
      if (response.ok) {
        Alert.alert('Success', 'Payment marked as paid!');
        fetchResidentsData();
      } else {
        console.log('Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
    }
  };

  useEffect(() => {
    checkNewMonth();
    fetchAvailableMonths();
  }, [councilId]);

  const addPendingPaid = (pending, paid) => {
    return parseInt(pending) + parseInt(paid);
  };

  useEffect(() => {
    if (monthYear) fetchResidentsData();
  }, [monthYear, councilId, isNotified]);

  return (
    <View style={styles.container}>
      <WavyBackground />
      <Text style={styles.title}>Manage Monthly Contributions</Text>

      {/* Month-Year Filter Dropdown */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Month-Year:</Text>
        <Picker
          selectedValue={monthYear}
          style={styles.picker}
          onValueChange={(value) => setMonthYear(value)}
        >
          {availableMonths.map((month) => (
            <Picker.Item key={month} label={month} value={month}   />
          ))}
        </Picker>
      </View>

      {/* Re-notify Unpaid Residents Button */}
      {isNotified && summary.totalPending > 0 && (
        <TouchableOpacity style={styles.notifyButton} onPress={reNotifyUnpaidResidents}>
          <Text style={styles.notifyButtonText}>Re-notify Unpaid Residents</Text>
        </TouchableOpacity>
      )}

      {/* Notify Residents Button */}
      {isNotified ? (
        <>
          <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>House</Text>
          <Text style={styles.headerText}>Status</Text>
          <Text style={styles.headerText}>Payment Date</Text>
          </View>
          <FlatList
          data={residents}
          keyExtractor={(item) => item.ResidentId.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.cellText}>{item.ResidentName}</Text>
              <Text style={styles.cellText}>{item.HouseNumber}</Text>
              <Text style={styles.cellText}>{item.Status === 'Unpaid' ? (
                <TouchableOpacity onPress={() => markAsPaid(item.ResidentId)}>
                  <Text style={[styles.cellText, {fontSize: 14, margin: 10, color: '#c45f1b'}]}>Mark as {`\n`}Paid</Text>
                </TouchableOpacity>
              ):(
                <Text style={styles.cellText}>{item.Status}</Text>
              )}</Text>
              {item.PaymentDate ? (
                <Text style={styles.cellText}>{item.PaymentDate ? new Date(item.PaymentDate).toDateString() : 'N/A'}</Text>
              ):(
                <Text style={styles.cellText}>N/A</Text>
              )}
            </View>
          )}
          />
          </>
      ):(
       <View style={styles.inputContainer}>
          <Text style={{color: 'black'}}>Contribution Amount:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={contributionAmount}
            onChangeText={setContributionAmount}
            placeholderTextColor={'black'}
          />
          <TouchableOpacity style={styles.notifyButton} onPress={notifyResidents}>
            <Text style={styles.notifyButtonText}>Notify Residents</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.summary}>
        <Text style={{ color: 'black' }}>Total Contribution: {addPendingPaid(summary.totalPending, summary.totalPaid)}</Text>
        <Text style={{ color: 'black' }}>Total Paid: {summary.totalPaid}</Text>
        <Text style={{ color: 'black' }}>Total Pending: {summary.totalPending}</Text>
      </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: 'black', textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  input: { borderWidth: 0, padding: 8, borderRadius: 10, marginTop: 8, color: 'black', backgroundColor: '#fff', marginBottom: 5 },
  notifyButton: { backgroundColor: '#F0C38E', padding: 10, borderRadius: 5, marginTop: 10 },
  notifyButtonText: { textAlign: 'center', fontWeight: 'bold' },
  filterContainer: { marginBottom: 16 },
  filterLabel: { fontSize: 16, marginBottom: 8, color: 'black' },
  picker: { height: 50, width: '100%' },
  notifyButton: { backgroundColor: '#F0C38E', padding: 10, borderRadius: 5, marginBottom: 16 },
  notifyButtonText: { color: 'black', fontWeight: 'bold', textAlign: 'center' },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#ddd' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  headerText: { fontWeight: 'bold', color: 'black', flex: 1, textAlign: 'center' },
  cellText: { color: 'black', flex: 1, textAlign: 'center' },
  markPaidButton: { color: '#c45f1b', marginTop: 8 },
  summary: { marginTop: 16, padding: 16, borderTopWidth: 1, borderTopColor: '#000' },
  footerContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center' },
  footer: { height: 80 },
});

export default ManageContributionsScreen;
