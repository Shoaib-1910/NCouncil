import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../Background/WavyBackground';
const screenWidth = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from './Api'
import { useFocusEffect } from '@react-navigation/native';

// Friendly labels for the alert/template backend columns. Any key not listed
// here will fall back to an auto-formatted version of the key itself.
const ALERT_FIELD_LABELS = {
  Tittle: 'Title',
  Description: 'Description',
  targetarea: 'Targeted Area',
  severitylevel: 'Severity Level',
  safetyinstruction: 'Safety Instructions',
  emergencycontact: 'Emergency Contact',
  lastseenarea: 'Last Seen Area',
  personname: 'Person Name',
  age_gender: 'Age / Gender',
  contactperson: 'Contact Person',
  threatype: 'Threat Type',
  residentinstruction: 'Resident Instructions',
};

// Keys we never want to show in the "everything dynamically" detail list,
// since they're identifiers / metadata rather than alert content.
const ALERT_FIELD_SKIP_KEYS = ['id', 'councilid', 'CouncilId', 'councilId'];

const formatFieldLabel = (key) => {
  if (ALERT_FIELD_LABELS[key]) return ALERT_FIELD_LABELS[key];
  // Fallback: turn camelCase / snake_case into Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function TreasurerScreen ({ route, navigation }) {
  const { width } = useWindowDimensions(); // screen width
  const {Council, councilName, councilDescription, role} = route.params;

  const [memberId, setMemberId] = useState(null);
  const [phoneNo, setPhoneNo] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [gender, setGender] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [address, setAddress] = useState(null);
  const [password, setPassword] = useState(null);
  const [dateJoined, setDateJoined] = useState(null);
  const [AnnouncementsData, setAnnouncementsData] = useState([]);
  const [announcementFound, setAnnouncementFound] = useState(false);
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationFound, setNotificationFound] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const [menuVisible2, setMenuVisible2] = useState(false);

  const openMenu2 = () => setMenuVisible2(true);
  const closeMenu2 = () => setMenuVisible2(false);


  const [menuVisible3, setMenuVisible3] = useState(false);

  const openMenu3 = () => setMenuVisible3(true);
  const closeMenu3 = () => setMenuVisible3(false);


  const [menuVisibleForReportProblem, setMenuVisibleForReportProblem] = useState(false);

  const openMenu5 = () => setMenuVisibleForReportProblem(true);
  const closeMenu5 = () => setMenuVisibleForReportProblem(false);

  // ── Alerts State (view-only for Treasurer — no create, no view status) ──
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetailVisible, setAlertDetailVisible] = useState(false);

  const [activeNotifTab, setActiveNotifTab] = useState('notifications');

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setMemberId(userData.memberId);
        setPhoneNo(userData.phoneNo);
        setFullName(userData.fullName);
        setGender(userData.gender);
        setDateOfBirth(userData.dateOfBirth);
        setProvince(userData.province);
        setCity(userData.city);
        setAddress(userData.address);
        setPassword(userData.password);
        setDateJoined(userData.dateJoined);
      }
    };

    fetchUserData();
  }, []);

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const getAnnouncementReadStorageKey = () => {
    const memberKey = memberId || 'guest';
    return `readAnnouncements_${Council}_${memberKey}`;
  };

  const loadReadAnnouncementIds = async () => {
    try {
      const storedIds = await AsyncStorage.getItem(getAnnouncementReadStorageKey());
      return storedIds ? JSON.parse(storedIds) : [];
    } catch (error) {
      console.log('Error loading read announcements: ' + error);
      return [];
    }
  };

  const markAnnouncementsAsRead = async (announcementIds) => {
    try {
      await AsyncStorage.setItem(
        getAnnouncementReadStorageKey(),
        JSON.stringify(announcementIds)
      );
      setUnreadAnnouncementCount(0);
    } catch (error) {
      console.log('Error saving read announcements: ' + error);
    }
  };

  const getAnnouncementsForResidents = async() =>{
    try{
      const response = await fetch(`${baseURL}Announcement/getAnnouncementsForCouncil?memberId=${memberId}&councilId=${Council}`)
      const data = await response.json()
      if(response.ok){
        console.log('Announcements Loaded')
        console.log(response.status)
        if (data && data.length > 0) {
          const annData = data.map((ann) => ({
            AnnouncementId: ann.AnnouncementId,
            Title: ann.Title,
            Description: ann.Description,
            Date : ann.Date,
            MemberName : ann.AddedBy,
            RoleId : ann.RoleName
          }));
          const storedReadIds = await loadReadAnnouncementIds();
          const unreadAnnouncements = annData.filter(
            (announcement) => !storedReadIds.includes(announcement.AnnouncementId)
          );
          setAnnouncementFound(data.length > 0);
          setUnreadAnnouncementCount(unreadAnnouncements.length);
          setAnnouncementsData(annData)
          console.log(AnnouncementsData)
      }else{
        console.log("No Announcements Found")
        setUnreadAnnouncementCount(0);
      }
    }else{
      console.log('No Announcementsss Found')
      setUnreadAnnouncementCount(0);
    }
  }
    catch(error){
      console.log('Error Fetching Announcements'+ error)
    }
  }

  useEffect(() => {
    getAnnouncementsForResidents()
  }, [memberId, Council]);

  useFocusEffect(
    useCallback(() => {
      if (memberId && Council) {
        getAnnouncementsForResidents();
      }
    }, [memberId, Council])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.date}>{new Date(item.Date).toDateString()}</Text>

    </View>
  );

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${baseURL}notification/GetNotifications?councilId=${Council}&memberId=${memberId}`
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Notifications Loaded Successfully!")
        setNotificationFound(data.length > 0);
        setNotifications(data);
      } else {
        console.error("Error fetching notifications:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ── Alerts: fetch + mark delivered/read (Treasurer is view-only, but still tracks delivered/read) ──
  const markAlertDelivered = async (alertId) => {
    if (!memberId || !alertId) return;
    try {
      const payload = { userid: memberId, alertid: alertId, councilid: Council };
      await fetch(`${baseURL}Account/MarkDelivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log('MarkDelivered Error:', error);
    }
  };

  const markAlertRead = async (alert) => {
    if (!memberId || !alert?.id) return;
    try {
      const payload = { userid: memberId, alertid: alert.id, councilid: Council };
      await fetch(`${baseURL}Account/MarkRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log('MarkRead Error:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const url = `${baseURL}Account/GetAlertsByCouncilId?councilId=${Council}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        const alertList = Array.isArray(data) ? data : [];
        setAlerts(alertList);
        alertList.forEach((alert) => markAlertDelivered(alert.id));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    if (memberId && Council) {
      fetchAlerts();
    }
  }, [memberId, Council]);

  useEffect(() => {
    if (menuVisible3 && activeNotifTab === 'alerts' && memberId && Council) {
      fetchAlerts();
    }
  }, [menuVisible3, activeNotifTab]);

  const openAlertDetail = async (alert) => {
    setSelectedAlert(alert);
    setAlertDetailVisible(true);
    markAlertRead(alert);
  };

  const closeAlertDetail = () => {
    setAlertDetailVisible(false);
    setSelectedAlert(null);
  };

  const handleReportProblemScreen = () => {
    navigation.navigate('ReportProblem', {councilId : Council, memberId : memberId})
    closeMenu5()
  }

  const handleProblemViewScreen = () => {
    navigation.navigate('ViewReportedProblems', { councilId: Council })
    closeMenu5()
  }

  const handleAnnouncementPress = async () => {
    const allAnnouncementIds = AnnouncementsData.map((announcement) => announcement.AnnouncementId);
    await markAnnouncementsAsRead(allAnnouncementIds);
    navigation.navigate('Announcement', {
      councilId: Council,
      fromScreen: route.name,
      fromParams: route.params,
    });
  }

  const RenderNotification =  React.memo(({ item }) =>{
    return(
    <TouchableOpacity style={styles.notificationCard}>
      <View style={styles.notifTypeRow}>
        <View style={styles.notifTypeBadge}>
          <Text style={styles.notifTypeBadgeText}>📣 Notification</Text>
        </View>
      </View>
      <Text style={styles.title1}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.CreatedAt).toDateString()}</Text>
    </TouchableOpacity>
    )
  });

  // Treasurer: view-only alert card — no View Status, no Create Alert
  const RenderAlertItem = React.memo(({ item }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertLeftAccent} />
      <TouchableOpacity style={styles.alertContent} onPress={() => openAlertDetail(item)} activeOpacity={0.8}>
        <View style={styles.alertTypeRow}>
          <View style={styles.alertTypeBadge}>
            <Text style={styles.alertTypeBadgeText}>🔔 Alert</Text>
          </View>
        </View>
        <Text style={styles.alertTitle}>{item.Tittle}</Text>
        {!!item.targetarea && (
          <View style={styles.alertMeta}>
            <Text style={styles.alertMetaText}>📍 {item.targetarea}</Text>
          </View>
        )}
        <Text style={styles.alertTapHint}>Tap to view full details →</Text>
      </TouchableOpacity>
    </View>
  ));

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <Text>Loading notifications...</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
    <WavyBackground />

    {/* Header */}
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.nameText}>{fullName}<Text style={{color: 'black', fontSize: 15}}> ⁓{role}</Text></Text>

      {/* Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleAnnouncementPress} style={styles.iconWrapper}>
        <Image
          source={
         require('../assets/notification.png')
        }
        style={styles.icon}
        />
      {unreadAnnouncementCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}
          </Text>
        </View>
      )}
        </TouchableOpacity>

        {/* Menu Modal For Announcement*/}
      <Modal
        visible={menuVisible2}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu2}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Announcements</Text>
              <TouchableOpacity onPress={closeMenu2} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            <FlatList
              data={AnnouncementsData}
              keyExtractor={(item) => item.AnnouncementId.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => {
                <Text style={{color: 'black'}}>No Announcement Found, Try Adding One from the Plus Icon.</Text>
              }}
            />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

        <TouchableOpacity onPress={openMenu}>
        <Image source={require('../assets/info.png')} style={styles.icon} />
      </TouchableOpacity>

      {/* Menu Modal For Information*/}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Information</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={[styles.modalContent, { alignItems: 'center', maxHeight: undefined }]}>
            <Text style={{color:'black', fontWeight:'600'}}>Council Name</Text>
          <Text style={{color:'black'}}>{councilName}</Text>
            <Text style={{color:'black', fontWeight:'600', marginTop: 20}}>Description</Text>
            <Text style={{color:'black', textAlign : 'left'}}>{councilDescription}</Text>
            <Text style={{color:'black', fontWeight:'600', marginTop: 20}}>About the App:</Text>
            <Text style={{color:'black', textAlign : 'left'}}>
              The app facilitates community involvement by allowing residents to report issues, form committees, and participate in democratic processes, promoting collaborative problem-solving and local governance.
            </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

        <TouchableOpacity onPress={openMenu3} style={styles.iconWrapper}>
          <Image source={require('../assets/message.png')} style={styles.icon} />
          {(notificationFound || alerts.length > 0) && (
        <View style={styles.badge} />
      )}
        </TouchableOpacity>

        {/* Inbox modal: Notifications + Alerts tabs (view-only alerts) */}
        <Modal
        visible={menuVisible3}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu3}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMenu3}>
          <View style={styles.menuContainer}>
            {/* Modal Header with Close Button */}
            <View style={styles.headerContainer2}>
              <Text style={styles.headerText}>Inbox</Text>
              <TouchableOpacity onPress={closeMenu3} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabButton, activeNotifTab === 'notifications' && styles.tabButtonActive]}
                onPress={() => setActiveNotifTab('notifications')}
              >
                <Text style={[styles.tabButtonText, activeNotifTab === 'notifications' && styles.tabButtonTextActive]}>
                  📣 Notifications
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeNotifTab === 'alerts' && styles.tabButtonActive]}
                onPress={() => setActiveNotifTab('alerts')}
              >
                <Text style={[styles.tabButtonText, activeNotifTab === 'alerts' && styles.tabButtonTextActive]}>
                  🔔 Alerts{alerts.length > 0 && <Text style={styles.tabAlertCount}> ({alerts.length})</Text>}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
            {activeNotifTab === 'notifications' ? (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RenderNotification item={item} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
              />
            ) : (
              <FlatList
                data={alerts}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                renderItem={({ item }) => <RenderAlertItem item={item} />}
                ListEmptyComponent={
                  <View style={styles.emptyAlertContainer}>
                    <Text style={styles.emptyAlertIcon}>🔔</Text>
                    <Text style={styles.emptyText}>No alerts at this time.</Text>
                  </View>
                }
              />
            )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      </View>
    </View>

    {/* ── Alert Detail Overlay (view-only) ── */}
    <Modal visible={alertDetailVisible} transparent animationType="slide" onRequestClose={closeAlertDetail}>
      <View style={styles.alertDetailOverlay}>
        <View style={styles.alertDetailContainer}>
          <View style={styles.alertDetailTopBar} />

          <View style={styles.alertDetailHeader}>
            <View style={styles.alertDetailBadge}>
              <Text style={styles.alertDetailBadgeText}>🔔 ALERT</Text>
            </View>
            <TouchableOpacity onPress={closeAlertDetail} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.alertDetailBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.alertDetailTitle}>{selectedAlert?.Tittle}</Text>
            <View style={styles.alertDetailDivider} />

            {selectedAlert &&
              Object.keys(selectedAlert)
                .filter((key) => key !== 'Tittle' && !ALERT_FIELD_SKIP_KEYS.includes(key))
                .filter((key) => {
                  const val = selectedAlert[key];
                  return val !== null && val !== undefined && String(val).trim() !== '';
                })
                .map((key) => (
                  <View key={key} style={styles.alertDetailFieldBlock}>
                    <Text style={styles.alertDetailSectionLabel}>{formatFieldLabel(key)}</Text>
                    <Text style={styles.alertDetailDescription}>{String(selectedAlert[key])}</Text>
                  </View>
                ))}
          </ScrollView>

          <TouchableOpacity style={styles.alertDetailCloseBtn} onPress={closeAlertDetail}>
            <Text style={styles.alertDetailCloseBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* ── Report Problem Modal (moved out of the button TouchableOpacity — was incorrectly nested before) ── */}
    <Modal
      visible={menuVisibleForReportProblem}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMenu5}
    >
      <View style={styles.modalOverlay} >
        <View style={styles.menuContainer}>
          {/* Modal Header with Close Button */}
          <View style={styles.headerContainer2}>
            <Text style={styles.headerText}>Report Problem</Text>
            <TouchableOpacity onPress={closeMenu5} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <View style={[styles.modalContent, { alignItems: 'center', maxHeight: undefined }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleReportProblemScreen}
            >
              <Image
                source={require('../assets/report.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Report Problem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleProblemViewScreen}
            >
              <Image
                source={require('../assets/viewReport.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>View Reported</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Buttons - scrollable so nothing gets hidden below the screen */}
    <ScrollView style={styles.buttonsScroll} contentContainerStyle={styles.buttonsContainer} scrollEnabled={true} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.button} onPress={() =>  navigation.navigate('ReportProblem', {councilId : Council, memberId : memberId})}>
        <Image source={require('../assets/ReportProblem.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Report Issue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}  onPress={() => {navigation.navigate('ManageContributions', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/contribution.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Contributions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('Meeting', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/meetings.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Meetings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('Project', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/projects.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Projects</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}  onPress={() => {navigation.navigate('ComplaintDiaryForPanel', {councilId : Council, memberId : memberId})}}>
        <Image source={require('../assets/ViewIssues.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>View Problems</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('Poll', {
            councilId: Council,
            memberId: memberId,
            fromScreen: route.name,
            fromParams: route.params,
            role: role,
          })
        }
      >
        <Image source={require('../assets/announcement2.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Community Poll</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EventCalendar', { councilId: Council, memberId: memberId, role: 'Treasurer' })}
      >
        <Image source={require('../assets/group.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Event</Text>
      </TouchableOpacity>

       <TouchableOpacity
                      style={[styles.button, styles.templateButton]}
                      onPress={() => navigation.navigate('Templates', { councilId: Council, memberId: memberId })}
                    >
                      <Image source={require('../assets/announcement2.png')} style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Templates</Text>
                    </TouchableOpacity>

      {/* bottom padding so last button clears the footer image */}
      <View style={{ height: 80 }} />
    </ScrollView>
    <Image
          source={require('../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
},
headerContainer: {
  alignItems: 'center',
  marginTop: 50,
},
welcomeText: {
  fontFamily: 'KronaOne-Regular',
  fontSize: 24,
  fontWeight: 'bold',
  color: 'black',
},
nameText: {
  fontSize: 20,
  top : 5,
  fontWeight: '600',
  color: 'black',
},
iconContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 30,
  width: screenWidth * 0.8,
},
icon: {
  width: 50,
  height: 50,
  borderRadius: 75,
  backgroundColor: '#fff',
},
// ── Scrollable buttons (was: buttonsContainer applied to BOTH the outer View and the ScrollView,
// with flex:1/justifyContent:'center'/top+bottom offsets — that double-application plus centering
// inside a flex:1 box is what clipped the last buttons) ──
buttonsScroll: {
  flex: 1,
  marginTop: 10,
},
buttonsContainer: {
  alignItems: 'center',
  paddingTop: 10,
  paddingBottom: 20,
},
button: {
  width: screenWidth * 0.7,
  backgroundColor: '#eab676',
  borderRadius: 15,
  paddingVertical: 15,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 13,
},
buttonIcon: {
  width: 50,
  height: 50,
  marginRight: 20,
},
buttonText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: 'black',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
menuContainer: {
  width: '85%',
  maxHeight: '90%', // Restricts height to 80% of the screen
  backgroundColor: '#fff',
  borderRadius: 10,
  overflow: 'hidden',
  position: 'absolute', // Use if the container is floating
  // top: 40, // Adjust to prevent going off-screen
  // bottom: 20,
},

  headerContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0C38E',
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  // ── Fixed: removed alignItems:'center' (no maxHeight before) which collapsed FlatList rows.
  // Now matches ChairmanScreen so list rows stretch full width. Modals that need centering
  // (Information, Report Problem) get a local override on their own View instead.
  modalContent: {
    padding: 12,
    maxHeight: 420,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  metaData: {
    fontSize: 12,
    color: '#888',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  notificationCard: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notifTypeRow: {
    marginBottom: 6,
  },
  notifTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notifTypeBadgeText: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  title1: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: 'black',
  },
  message: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#aaa",
    marginTop: 20,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    backgroundColor: 'red',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // ── Tabs (Notifications / Alerts) ──
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#eab676',
    backgroundColor: '#fff',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#c47f2e',
  },
  tabAlertCount: {
    color: '#e05c2e',
    fontWeight: 'bold',
  },

  // ── Alert card (view-only: no View Status button) ──
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f5d6a8',
    shadowColor: '#c47f2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  alertLeftAccent: {
    width: 5,
    backgroundColor: '#e05c2e',
  },
  alertContent: {
    flex: 1,
    padding: 12,
  },
  alertTypeRow: {
    marginBottom: 5,
  },
  alertTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2cc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  alertTypeBadgeText: {
    fontSize: 11,
    color: '#c2410c',
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  alertMeta: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 4,
  },
  alertMetaText: {
    fontSize: 11,
    color: '#888',
  },
  alertTapHint: {
    fontSize: 11,
    color: '#c47f2e',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyAlertContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyAlertIcon: {
    fontSize: 36,
    marginBottom: 8,
  },

  // ── Alert detail overlay (view-only: no status/create actions) ──
  alertDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  alertDetailContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  alertDetailTopBar: {
    height: 5,
    backgroundColor: '#e05c2e',
    width: '100%',
  },
  alertDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f5d6a8',
  },
  alertDetailBadge: {
    backgroundColor: '#fee2cc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  alertDetailBadgeText: {
    fontSize: 13,
    color: '#c2410c',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertDetailBody: {
    padding: 22,
    paddingBottom: 10,
  },
  alertDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  alertDetailDivider: {
    height: 1,
    backgroundColor: '#f0d5b8',
    marginBottom: 16,
  },
  alertDetailFieldBlock: {
    marginBottom: 4,
  },
  alertDetailSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c47f2e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  alertDetailDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  alertDetailCloseBtn: {
    margin: 16,
    backgroundColor: '#e05c2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  alertDetailCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

footer: {
  position: 'absolute',
  bottom: 0,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: useWindowDimensions,
  zIndex: -1,
},
});