import React, { useEffect, useState } from 'react';
import { 
  Text, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View, 
  Alert, ActivityIndicator, FlatList, Modal, ScrollView, Image 
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { Dropdown } from 'react-native-element-dropdown';

export default function ManageMembers({ route, navigation }) {
  const { width } = useWindowDimensions(); // Screen width
  const { councilId } = route.params;
  const [loading, setLoading] = useState(false);
  const [membersNameData, setMembersNameData] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null); // Hold selected MemberId
  const [roleId, setRoleId] = useState(0);

  const roles = [
    { label: 'Select Role', value: '0' },
    { label: 'Admin', value: '1' },
    { label: 'Member', value: '2' },
    { label: 'Councilor', value: '3' },

  ];

  useEffect(() => {
    getMembersName();
  }, [councilId]);

  const getMembersName = async () => {
    try {
      const response = await fetch(`${baseURL}Council/GetCouncilMembersForManaging?councilId=${councilId}`);
      if (response.ok) {
        const responseText = await response.text();
        if (responseText) {
          const data = JSON.parse(responseText);
          if (data && data.length > 0) {
            const MembersData = data.map((member) => ({
              MemberId: member.MembersId, 
              MemberName: member.MembersName,   
              Role: member.Role,
            }));
            setMembersNameData(MembersData);
          } else {
            setMembersNameData([]);
            Alert.alert('No Members Found');
          }
        } else {
          Alert.alert('No Members Found');
        }
      } else {
        Alert.alert('Failed to fetch members: ' + response.status);
      }
    } catch (error) {
      console.error('Failed to Load Data: ' + error);
    }
  };

  const updateRole = async () => {
    if (roleId == 0) {
      Alert.alert('Please Select a Role for the Resident.');
      return;
    }
    try {
      const response = await fetch(
        `${baseURL}council/updateRole?memberId=${selectedMemberId}&councilId=${councilId}&roleId=${roleId}`,
        { method: 'PUT' }
      );
      if (response.ok) {
        Alert.alert('Role Updated Successfully!');
        closeMenu();
        getMembersName();
      } else {
        console.log('Failed to Update Member Role.');
      }
    } catch {
      console.log('Unable to Update Member Role');
    }
  };

  const handleRemoval = (name, memberId) => {
    Alert.alert(
      'Are you sure?',
      `Do you want to Remove ${name} from Council?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: async () => {
            try {
              await fetch(
                `${baseURL}council/RemoveResidentFromCouncil?memberId=${memberId}&councilId=${councilId}`,
                { method: 'DELETE' }
              );
              Alert.alert('Member Removed Successfully!');
              getMembersName();
            } catch (error) {
              Alert.alert('Error', `Failed to remove ${name}.`);
            }
          },
        },
      ]
    );
  };

  const openMenu = (memberId) => {
    setSelectedMemberId(memberId);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedMemberId(null);
  };

  const renderItems = ({ item }) => {
    return (
      <View style={styles.listItem}>
        <Text style={styles.memberText}>
          Member Name: {item.MemberName} | Role: {item.Role}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => openMenu(item.MemberId)}
            style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Update Role</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemoval(item.MemberName, item.MemberId)}
            style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.titleText}>Manage Members</Text>
      <FlatList
        data={membersNameData}
        renderItem={renderItems}
        keyExtractor={(item) => item.MemberId.toString()}
        ListEmptyComponent={<Text style={styles.emptyListText}>No Members Found In the Council!</Text>}
        contentContainerStyle={styles.listContent}
      />
          <Modal
      visible={menuVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeMenu}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Update Role</Text>

          {/* Dropdown for Role Selection */}
          <Dropdown
            data={roles}
            style={styles.dropDown}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Role"
            placeholderTextColor="#000"
            value={roleId}
            onChange={(item) => setRoleId(item.value)}
            renderItem={(item) => (
              <Text style={styles.dropdownItem}>{item.label}</Text>
            )}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={updateRole}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    <TouchableOpacity style={styles.signInButton} onPress={() => {navigation.goBack()}} disabled={loading}>
      <Text style={styles.signInButtonText}>Go Back</Text>
    </TouchableOpacity>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    marginTop: 50,
    color: 'black',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listContent: {
    marginTop: 20,
    paddingBottom: 100,
  },
  listItem: {
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  memberText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#F0C38E',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  
  dropDown: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#222',
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#F0C38E',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  signInButton: {
    width: '85%',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#f5d8a0',
    alignItems: 'center',
    marginBottom: 100,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 80,
    zIndex: -1,
  },
  emptyListText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
