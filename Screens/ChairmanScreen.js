import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import WavyBackground from '../Background/WavyBackground';
const screenWidth = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from './Api';
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

export default function ChairmanScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { Council, councilName, councilDescription, role } = route.params;

  // ── ALL HOOKS DECLARED AT THE TOP ──────────────────────────────────────────
  
  // User Data State
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
  
  // Announcements State
  const [AnnouncementsData, setAnnouncementsData] = useState([]);
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
  const [announcementFound, setAnnouncementFound] = useState(false);

  // Modal visibility states
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisible2, setMenuVisible2] = useState(false);
  const [menuVisible3, setMenuVisible3] = useState(false);
  const [menuVisibleForReportProblem, setMenuVisibleForReportProblem] = useState(false);

  // Alerts State
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetailVisible, setAlertDetailVisible] = useState(false);

  // View Status (delivered/read tracking) State
  const [statusOverlayVisible, setStatusOverlayVisible] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Tab in inbox modal
  const [activeNotifTab, setActiveNotifTab] = useState('notifications');

  // Create Alert State
  const [createAlertVisible, setCreateAlertVisible] = useState(false);
  const [alertFormTitle, setAlertFormTitle] = useState('');
  const [alertFormDescription, setAlertFormDescription] = useState('');
  const [alertFormTargetArea, setAlertFormTargetArea] = useState('');
  const [alertSubmitting, setAlertSubmitting] = useState(false);

  // Notifications State (MOVED UP FROM BELOW)
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationFound, setNotificationFound] = useState(false);

  // ── HELPER FUNCTIONS ────────────────────────────────────────────────────────

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const openMenu2 = () => setMenuVisible2(true);
  const closeMenu2 = () => setMenuVisible2(false);
  const openMenu3 = () => setMenuVisible3(true);
  const closeMenu3 = () => setMenuVisible3(false);
  const openMenu5 = () => setMenuVisibleForReportProblem(true);
  const closeMenu5 = () => setMenuVisibleForReportProblem(false);

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
      return [];
    }
  };

  const markAnnouncementsAsRead = async (announcementIds) => {
    try {
      await AsyncStorage.setItem(getAnnouncementReadStorageKey(), JSON.stringify(announcementIds));
      setUnreadAnnouncementCount(0);
    } catch (error) {
      console.log('Error saving read announcements: ' + error);
    }
  };

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

  const fetchAlertStats = async (alert) => {
    if (!alert?.id) return;
    setStatsLoading(true);
    setAlertStats(null);
    try {
      const url = `${baseURL}Account/GetAlertStats?alertId=${alert.id}&councilId=${Council}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) setAlertStats(data);
    } catch (error) {
      console.log('GetAlertStats Error:', error);
    } finally {
      setStatsLoading(false);
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${baseURL}notification/GetNotifications?councilId=${Council}&memberId=${memberId}`
      );
      const data = await response.json();
      if (response.ok) {
        setNotificationFound(data.length > 0);
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncementsForResidents = async () => {
    try {
      const response = await fetch(
        `${baseURL}Announcement/getAnnouncementsForCouncil?memberId=${memberId}&councilId=${Council}`
      );
      const data = await response.json();
      if (response.ok && data && data.length > 0) {
        const annData = data.map((ann) => ({
          AnnouncementId: ann.AnnouncementId,
          Title: ann.Title,
          Description: ann.Description,
          Date: ann.Date,
          MemberName: ann.AddedBy,
          RoleId: ann.RoleName,
        }));
        const storedReadIds = await loadReadAnnouncementIds();
        const unread = annData.filter((a) => !storedReadIds.includes(a.AnnouncementId));
        setAnnouncementFound(true);
        setUnreadAnnouncementCount(unread.length);
        setAnnouncementsData(annData);
      } else {
        setUnreadAnnouncementCount(0);
      }
    } catch (error) {
      console.log('Error Fetching Announcements' + error);
    }
  };

  // ── EFFECTS / LIFECYCLE ─────────────────────────────────────────────────────

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

  useEffect(() => { getAnnouncementsForResidents(); }, [memberId, Council]);

  useFocusEffect(
    useCallback(() => {
      if (memberId && Council) getAnnouncementsForResidents();
    }, [memberId, Council])
  );

  useEffect(() => {
    if (memberId && Council) {
      fetchNotifications();
      fetchAlerts();
    }
  }, [memberId, Council]);

  useEffect(() => {
    if (menuVisible3 && activeNotifTab === 'alerts' && memberId && Council) {
      fetchAlerts();
    }
  }, [menuVisible3, activeNotifTab]);

  // ── HANDLERS ────────────────────────────────────────────────────────────────

  const openAlertDetail = async (alert) => {
    setSelectedAlert(alert);
    setAlertDetailVisible(true);
    markAlertRead(alert);
  };
  
  const closeAlertDetail = () => {
    setAlertDetailVisible(false);
    setSelectedAlert(null);
  };

  const openStatusOverlay = (alert) => {
    setStatusAlert(alert);
    setStatusOverlayVisible(true);
    fetchAlertStats(alert);
  };
  
  const closeStatusOverlay = () => {
    setStatusOverlayVisible(false);
    setStatusAlert(null);
    setAlertStats(null);
  };

  const openCreateAlert = () => {
    setAlertFormTitle('');
    setAlertFormDescription('');
    setAlertFormTargetArea('');
    setCreateAlertVisible(true);
  };
  
  const closeCreateAlert = () => setCreateAlertVisible(false);

  const handleCreateAlert = async () => {
    if (!alertFormTitle.trim()) {
      Alert.alert('Validation', 'Please enter an alert title.');
      return;
    }
    if (!alertFormDescription.trim()) {
      Alert.alert('Validation', 'Please enter an alert description.');
      return;
    }
    if (!alertFormTargetArea.trim()) {
      Alert.alert('Validation', 'Please enter a targeted area.');
      return;
    }
    setAlertSubmitting(true);
    try {
      const payload = {
        Tittle: alertFormTitle.trim(),
        Description: alertFormDescription.trim(),
        targetarea: alertFormTargetArea.trim(),
        councilid: Council,
      };

      const response = await fetch(`${baseURL}Account/CreateAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        Alert.alert('Success', 'Alert created successfully.');
        closeCreateAlert();
        fetchAlerts();
      } else {
        const err = await response.json().catch(() => null);
        Alert.alert('Error', err?.message || 'Failed to create alert.');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleReportProblemScreen = () => {
    navigation.navigate('ReportProblem', { councilId: Council, memberId: memberId });
    closeMenu5();
  };

  const handleProblemViewScreen = () => {
    navigation.navigate('ViewReportedProblems', { councilId: Council });
    closeMenu5();
  };

  const handleAnnouncementPress = async () => {
    const allIds = AnnouncementsData.map((a) => a.AnnouncementId);
    await markAnnouncementsAsRead(allIds);
    navigation.navigate('Announcement', {
      councilId: Council,
      fromScreen: route.name,
      fromParams: route.params,
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.date}>{new Date(item.Date).toDateString()}</Text>
    </View>
  );

  // ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

  const RenderNotification = React.memo(({ item }) => (
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
  ));

  const RenderAlert = React.memo(({ item }) => (
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
        <TouchableOpacity
          style={styles.viewStatusBtn}
          onPress={() => openStatusOverlay(item)}
        >
          <Text style={styles.viewStatusBtnText}>📊 View Status</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  ));

  // ── RENDER ──────────────────────────────────────────────────────────────────
  
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />

      {/* ── Header ── */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.nameText}>
          {fullName}
          <Text style={{ color: 'black', fontSize: 15 }}> ⁓{role}</Text>
        </Text>

        <View style={styles.iconContainer}>
          {/* Announcement bell */}
          <TouchableOpacity onPress={handleAnnouncementPress} style={styles.iconWrapper}>
            <Image source={require('../assets/notification.png')} style={styles.icon} />
            {unreadAnnouncementCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Announcements modal (menuVisible2 – kept for future use) */}
          <Modal visible={menuVisible2} transparent animationType="fade" onRequestClose={closeMenu2}>
            <TouchableOpacity style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                <View style={styles.headerContainer2}>
                  <Text style={styles.headerText}>Announcements</Text>
                  <TouchableOpacity onPress={closeMenu2} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <FlatList
                    data={AnnouncementsData}
                    keyExtractor={(item) => item.AnnouncementId.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                      <Text style={{ color: 'black' }}>No announcements found.</Text>
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Info icon */}
          <TouchableOpacity onPress={openMenu}>
            <Image source={require('../assets/info.png')} style={styles.icon} />
          </TouchableOpacity>

          {/* Info modal */}
          <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
            <TouchableOpacity style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                <View style={styles.headerContainer2}>
                  <Text style={styles.headerText}>Information</Text>
                  <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <Text style={{ color: 'black', fontWeight: '600' }}>Council Name</Text>
                  <Text style={{ color: 'black' }}>{councilName}</Text>
                  <Text style={{ color: 'black', fontWeight: '600', marginTop: 20 }}>Description</Text>
                  <Text style={{ color: 'black', textAlign: 'left' }}>{councilDescription}</Text>
                  <Text style={{ color: 'black', fontWeight: '600', marginTop: 20 }}>About the App:</Text>
                  <Text style={{ color: 'black', textAlign: 'left' }}>
                    The app facilitates community involvement by allowing residents to report issues,
                    form committees, and participate in democratic processes, promoting collaborative
                    problem-solving and local governance.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Inbox (notifications + alerts) icon */}
          <TouchableOpacity onPress={openMenu3} style={styles.iconWrapper}>
            <Image source={require('../assets/message.png')} style={styles.icon} />
            {(notificationFound || alerts.length > 0) && <View style={styles.badge} />}
          </TouchableOpacity>

          {/* Inbox modal */}
          <Modal visible={menuVisible3} transparent animationType="fade" onRequestClose={closeMenu3}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMenu3}>
              <View style={styles.menuContainer}>
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

                <View style={styles.modalContent}>
                  {activeNotifTab === 'notifications' ? (
                    <FlatList
                      data={notifications}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => <RenderNotification item={item} />}
                      ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
                    />
                  ) : (
                    <>
                      <View style={styles.alertsSubHeader}>
                        <Text style={styles.alertsSubHeaderText}>Active Alerts</Text>
                        <TouchableOpacity style={styles.createAlertBtn} onPress={openCreateAlert}>
                          <Text style={styles.createAlertBtnText}>＋ New Alert</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={alerts}
                        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                        renderItem={({ item }) => <RenderAlert item={item} />}
                        ListEmptyComponent={
                          <View style={styles.emptyAlertContainer}>
                            <Text style={styles.emptyAlertIcon}>🔔</Text>
                            <Text style={styles.emptyText}>No alerts at this time.</Text>
                            <TouchableOpacity style={styles.emptyCreateBtn} onPress={openCreateAlert}>
                              <Text style={styles.emptyCreateBtnText}>Create First Alert</Text>
                            </TouchableOpacity>
                          </View>
                        }
                      />
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>

      {/* ── Alert Detail Overlay ── */}
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
              {/* Title */}
              <Text style={styles.alertDetailTitle}>{selectedAlert?.Tittle}</Text>
              <View style={styles.alertDetailDivider} />

              {/* Dynamically render every non-null/non-empty field, Templates-style */}
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

      {/* ── View Status (Delivered / Read tracking) Overlay ── */}
      <Modal visible={statusOverlayVisible} transparent animationType="slide" onRequestClose={closeStatusOverlay}>
        <View style={styles.alertDetailOverlay}>
          <View style={styles.alertDetailContainer}>
            <View style={[styles.alertDetailTopBar, { backgroundColor: '#3b82f6' }]} />

            <View style={[styles.alertDetailHeader, { backgroundColor: '#eff6ff', borderBottomColor: '#bfdbfe' }]}>
              <View style={[styles.alertDetailBadge, { backgroundColor: '#dbeafe' }]}>
                <Text style={[styles.alertDetailBadgeText, { color: '#1d4ed8' }]}>📊 ALERT STATUS</Text>
              </View>
              <TouchableOpacity onPress={closeStatusOverlay} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.alertDetailBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.alertDetailTitle}>{statusAlert?.Tittle}</Text>
              <View style={styles.alertDetailDivider} />

              {statsLoading ? (
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
              ) : (
                <>
                  <Text style={styles.alertDetailSectionLabel}>Delivery Status</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusCard, { borderColor: '#3b82f6' }]}>
                      <Text style={styles.statusIcon}>📨</Text>
                      <Text style={[styles.statusCount, { color: '#3b82f6' }]}>
                        {alertStats?.DeliveredCount ?? 0}
                      </Text>
                      <Text style={styles.statusLabel}>Delivered</Text>
                    </View>
                    <View style={[styles.statusCard, { borderColor: '#10b981' }]}>
                      <Text style={styles.statusIcon}>✅</Text>
                      <Text style={[styles.statusCount, { color: '#10b981' }]}>
                        {alertStats?.ReadCount ?? 0}
                      </Text>
                      <Text style={styles.statusLabel}>Read</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={[styles.alertDetailCloseBtn, { backgroundColor: '#3b82f6' }]} onPress={closeStatusOverlay}>
              <Text style={styles.alertDetailCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Create Alert Modal ── */}
      <Modal visible={createAlertVisible} transparent animationType="slide" onRequestClose={closeCreateAlert}>
        <KeyboardAvoidingView
          style={styles.alertDetailOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.alertDetailContainer}>
            <View style={[styles.alertDetailTopBar, { backgroundColor: '#c47f2e' }]} />

            <View style={styles.alertDetailHeader}>
              <View style={[styles.alertDetailBadge, { backgroundColor: '#fee2cc' }]}>
                <Text style={styles.alertDetailBadgeText}>🔔 CREATE ALERT</Text>
              </View>
              <TouchableOpacity onPress={closeCreateAlert} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.createAlertBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.createAlertLabel}>Title <Text style={{ color: '#e05c2e' }}>*</Text></Text>
              <TextInput
                style={styles.createAlertInput}
                placeholder="e.g. Road closed on Main St"
                placeholderTextColor="#bbb"
                value={alertFormTitle}
                onChangeText={setAlertFormTitle}
                maxLength={100}
              />

              <Text style={styles.createAlertLabel}>Description <Text style={{ color: '#e05c2e' }}>*</Text></Text>
              <TextInput
                style={[styles.createAlertInput, styles.createAlertTextArea]}
                placeholder="Provide full details about the alert..."
                placeholderTextColor="#bbb"
                value={alertFormDescription}
                onChangeText={setAlertFormDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.createAlertCharCount}>{alertFormDescription.length}/500</Text>

              <Text style={styles.createAlertLabel}>Targeted Area <Text style={{ color: '#e05c2e' }}>*</Text></Text>
              <View style={styles.createAlertInputRow}>
                <Text style={styles.createAlertInputIcon}>📍</Text>
                <TextInput
                  style={[styles.createAlertInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="e.g. Block 5, Near Park"
                  placeholderTextColor="#bbb"
                  value={alertFormTargetArea}
                  onChangeText={setAlertFormTargetArea}
                  maxLength={150}
                />
              </View>
            </ScrollView>

            <View style={styles.createAlertActions}>
              <TouchableOpacity style={styles.createAlertCancelBtn} onPress={closeCreateAlert} disabled={alertSubmitting}>
                <Text style={styles.createAlertCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createAlertSubmitBtn, alertSubmitting && { opacity: 0.6 }]}
                onPress={handleCreateAlert}
                disabled={alertSubmitting}
              >
                {alertSubmitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.createAlertSubmitBtnText}>Send Alert</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Main Buttons (scrollable) ── */}
      <ScrollView
        contentContainerStyle={styles.buttonsContainer}
        showsVerticalScrollIndicator={false}
        style={styles.buttonsScroll}
      >
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReportProblem', { councilId: Council, memberId: memberId })}>
          <Image source={require('../assets/ReportProblem.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Meeting', { councilId: Council, memberId: memberId })}>
          <Image source={require('../assets/meetings.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Meetings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Project', { councilId: Council, memberId: memberId })}>
          <Image source={require('../assets/projects.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ComplaintDiaryForChairman', { councilId: Council, memberId: memberId })}
        >
          <Image source={require('../assets/ViewIssues.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>View Problems</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Poll', { councilId: Council, memberId: memberId, fromScreen: route.name, fromParams: route.params, role: role })}
        >
          <Image source={require('../assets/announcement2.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Community Poll</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EventCalendar', { councilId: Council, memberId: memberId, role: 'Chairman' })}
        >
          <Image source={require('../assets/group.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Event</Text>
        </TouchableOpacity>

        {/* ── Templates button ── */}
        <TouchableOpacity
          style={[styles.button, styles.templateButton]}
          onPress={() => navigation.navigate('Templates', { councilId: Council, memberId: memberId })}
        >
          <Image source={require('../assets/announcement2.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Templates</Text>
        </TouchableOpacity>

        {/* bottom padding so last button clears footer */}
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

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerContainer: { alignItems: 'center', marginTop: 50 },
  welcomeText: { fontFamily: 'KronaOne-Regular', fontSize: 24, fontWeight: 'bold', color: 'black' },
  nameText: { fontSize: 20, top: 5, fontWeight: '600', color: 'black' },

  iconContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, width: screenWidth * 0.8 },
  icon: { width: 50, height: 50, borderRadius: 75, backgroundColor: '#fff' },
  iconWrapper: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -8,
    minWidth: 22, height: 22, paddingHorizontal: 5,
    backgroundColor: 'red', borderRadius: 11,
    borderWidth: 1, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // ── Scrollable buttons ──
  buttonsScroll: { flex: 1, marginTop: 10 },
  buttonsContainer: { alignItems: 'center', paddingTop: 10, paddingBottom: 20 },

  button: {
    width: screenWidth * 0.7,
    backgroundColor: '#eab676',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  templateButton: { backgroundColor: '#d4956a' },
  buttonIcon: { width: 50, height: 50, marginRight: 20 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: 'black' },

  footer: { position: 'absolute', bottom: 0, zIndex: -1 },

  // ── Modals shared ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  menuContainer: {
    width: '85%', maxHeight: '90%',
    backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', position: 'absolute',
  },
  headerContainer2: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F0C38E', padding: 15,
  },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  closeButton: { padding: 5 },
  closeButtonText: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  modalContent: { padding: 12, maxHeight: 420 },

  // ── Announcement card ──
  card: {
    backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  description: { fontSize: 14, color: '#555', marginBottom: 10 },
  date: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },

  // ── Tabs ──
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fafafa' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 3, borderBottomColor: '#eab676', backgroundColor: '#fff' },
  tabButtonText: { fontSize: 13, color: '#999', fontWeight: '600' },
  tabButtonTextActive: { color: '#c47f2e' },
  tabAlertCount: { color: '#e05c2e', fontWeight: 'bold' },

  // ── Notification card ──
  notificationCard: {
    backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#7aadff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  notifTypeRow: { marginBottom: 6 },
  notifTypeBadge: { alignSelf: 'flex-start', backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  notifTypeBadgeText: { fontSize: 11, color: '#1d4ed8', fontWeight: '700' },
  title1: { fontSize: 15, fontWeight: 'bold', marginBottom: 3, color: 'black' },
  message: { fontSize: 13, color: '#555' },
  timestamp: { fontSize: 11, color: '#aaa', marginTop: 6, textAlign: 'right' },

  // ── Alert card ──
  alertCard: {
    flexDirection: 'row', backgroundColor: '#fff8f0', borderRadius: 10, marginBottom: 10,
    overflow: 'hidden', borderWidth: 1, borderColor: '#f5d6a8',
    shadowColor: '#c47f2e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  alertLeftAccent: { width: 5, backgroundColor: '#e05c2e' },
  alertContent: { flex: 1, padding: 12 },
  alertTypeRow: { marginBottom: 5 },
  alertTypeBadge: { alignSelf: 'flex-start', backgroundColor: '#fee2cc', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  alertTypeBadgeText: { fontSize: 11, color: '#c2410c', fontWeight: '700' },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  alertMessage: { fontSize: 13, color: '#666', marginBottom: 6 },
  alertMeta: { flexDirection: 'column', gap: 2, marginBottom: 4 },
  alertMetaText: { fontSize: 11, color: '#888' },
  alertTapHint: { fontSize: 11, color: '#c47f2e', fontWeight: '600', marginTop: 4 },
  viewStatusBtn: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: '#dbeafe', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  viewStatusBtnText: { fontSize: 12, color: '#1d4ed8', fontWeight: '700' },

  // ── Alerts sub-header ──
  alertsSubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 2 },
  alertsSubHeaderText: { fontSize: 13, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 },
  createAlertBtn: { backgroundColor: '#e05c2e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  createAlertBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyAlertContainer: { alignItems: 'center', paddingVertical: 24 },
  emptyAlertIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { textAlign: 'center', fontSize: 15, color: '#aaa', marginTop: 8 },
  emptyCreateBtn: { marginTop: 14, backgroundColor: '#e05c2e', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  emptyCreateBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // ── Alert detail overlay ──
  alertDetailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  alertDetailContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '90%' },
  alertDetailTopBar: { height: 5, backgroundColor: '#e05c2e', width: '100%' },
  alertDetailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff8f0',
    borderBottomWidth: 1, borderBottomColor: '#f5d6a8',
  },
  alertDetailBadge: { backgroundColor: '#fee2cc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  alertDetailBadgeText: { fontSize: 13, color: '#c2410c', fontWeight: '800', letterSpacing: 0.5 },
  alertDetailBody: { padding: 22, paddingBottom: 10 },
  alertDetailTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 14 },
  alertDetailDivider: { height: 1, backgroundColor: '#f0d5b8', marginBottom: 16 },
  alertDetailFieldBlock: { marginBottom: 4 },
  alertDetailSectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#c47f2e',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 14,
  },
  alertDetailDescription: { fontSize: 15, color: '#444', lineHeight: 22 },
  alertDetailInfoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  alertDetailInfoIcon: { fontSize: 15, marginRight: 8, marginTop: 1 },
  alertDetailInfoText: { fontSize: 14, color: '#555', flex: 1 },
  alertDetailCloseBtn: { margin: 16, backgroundColor: '#e05c2e', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  alertDetailCloseBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // ── Delivery status cards ──
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  statusCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, borderWidth: 2, backgroundColor: '#fafafa',
  },
  statusIcon: { fontSize: 22, marginBottom: 4 },
  statusCount: { fontSize: 22, fontWeight: '800' },
  statusLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  // ── Create alert form ──
  createAlertBody: { padding: 22, paddingBottom: 10 },
  createAlertLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  createAlertInput: {
    borderWidth: 1.5, borderColor: '#e0c9a8', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#222', backgroundColor: '#fffaf5', marginBottom: 4,
  },
  createAlertTextArea: { height: 110, paddingTop: 10 },
  createAlertCharCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginBottom: 4 },
  createAlertInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0c9a8', borderRadius: 10,
    backgroundColor: '#fffaf5', paddingHorizontal: 10, marginBottom: 4,
  },
  createAlertInputIcon: { fontSize: 16, marginRight: 6 },
  createAlertActions: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#f0dfc8' },
  createAlertCancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  createAlertCancelBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
  createAlertSubmitBtn: { flex: 2, backgroundColor: '#e05c2e', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  createAlertSubmitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
