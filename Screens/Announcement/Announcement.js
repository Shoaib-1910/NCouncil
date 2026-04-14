import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../Api';
import { useFocusEffect } from '@react-navigation/native';

const ANNOUNCEMENT_CATEGORIES = [
  'All',
  'General',
  'Public Notice',
  'Election',
  'Meeting',
  'Development',
  'Emergency',
  'Community Event',
];

const getAnnouncementCategory = (announcement) => {
  const existingCategory =
    announcement.Cat ||
    announcement.cat ||
    announcement.Category ||
    announcement.category;
  if (existingCategory) {
    return existingCategory;
  }

  const searchableText = `${announcement.Title || ''} ${announcement.Description || ''}`.toLowerCase();

  if (searchableText.includes('election') || searchableText.includes('vote') || searchableText.includes('nominee')) {
    return 'Election';
  }
  if (searchableText.includes('meeting') || searchableText.includes('session') || searchableText.includes('agenda')) {
    return 'Meeting';
  }
  if (searchableText.includes('road') || searchableText.includes('street') || searchableText.includes('project') || searchableText.includes('development')) {
    return 'Development';
  }
  if (searchableText.includes('urgent') || searchableText.includes('emergency') || searchableText.includes('warning')) {
    return 'Emergency';
  }
  if (searchableText.includes('event') || searchableText.includes('camp') || searchableText.includes('drive')) {
    return 'Community Event';
  }
  if (searchableText.includes('notice') || searchableText.includes('deadline') || searchableText.includes('announcement')) {
    return 'Public Notice';
  }

  return 'General';
};

export default function Announcement({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { councilId, fromScreen, fromParams } = route.params;
  const [memberId, setMemberId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData && userData.memberId) {
        setMemberId(userData.memberId);
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
    return `readAnnouncements_${councilId}_${memberKey}`;
  };

  const markAnnouncementsAsRead = async (announcementIds) => {
    try {
      await AsyncStorage.setItem(
        getAnnouncementReadStorageKey(),
        JSON.stringify(announcementIds)
      );
    } catch (error) {
      console.error('Failed to save read announcement ids:', error);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch(
        `${baseURL}Announcement/getAnnouncementsForCouncil?councilId=${councilId}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          const annData = data.map((ann) => ({
            AnnouncementId: ann.AnnouncementId,
            Title: ann.Title,
            Description: ann.Description,
            Date: ann.Date,
            MemberName: ann.AddedBy,
            RoleName: ann.RoleName,
            Category: ann.Cat || ann.cat || getAnnouncementCategory(ann),
          }));

          setAnnouncements(annData);
          await markAnnouncementsAsRead(
            annData.map((announcement) => announcement.AnnouncementId)
          );
        } else {
          setAnnouncements([]);
          console.log('No announcements Found');
        }
      } else {
        setAnnouncements([]);
        console.log('No Announcements found.');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [memberId, councilId])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }

        if (fromScreen) {
          navigation.navigate(fromScreen, fromParams || {});
          return true;
        }

        navigation.navigate('HomeScreen');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation, fromScreen, fromParams])
  );

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return [...announcements]
      .filter((announcement) => {
        const matchesCategory =
          selectedCategory === 'All' || announcement.Category === selectedCategory;

        const matchesSearch =
          !normalizedSearch ||
          announcement.Title?.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      })
      .sort((firstItem, secondItem) => {
        if (!normalizedSearch) {
          return new Date(secondItem.Date) - new Date(firstItem.Date);
        }

        const firstTitle = firstItem.Title?.toLowerCase() || '';
        const secondTitle = secondItem.Title?.toLowerCase() || '';
        const firstStartsWith = firstTitle.startsWith(normalizedSearch) ? 1 : 0;
        const secondStartsWith = secondTitle.startsWith(normalizedSearch) ? 1 : 0;

        if (firstStartsWith !== secondStartsWith) {
          return secondStartsWith - firstStartsWith;
        }

        return firstTitle.localeCompare(secondTitle);
      });
  }, [announcements, searchText, selectedCategory]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('AnnouncementDetail', { announcement: item })}
    >
    <View style={styles.card}>
      <Text style={styles.title}>{item.Title}</Text>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{item.Category}</Text>
      </View>
      <Text style={styles.description}>{item.Description}</Text>
      <Text style={styles.metaData}>
        {item.MemberName} ({item.RoleName}) | Date: {new Date(item.Date).toDateString()}
      </Text>
    </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Announcements</Text>
      </View>

      <View style={styles.filtersWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title"
          placeholderTextColor="#7A7A7A"
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {ANNOUNCEMENT_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={filteredAnnouncements}
          keyExtractor={(item) => item.AnnouncementId.toString()}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchAnnouncements}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Announcements Found!</Text>
          }
        />
      </View>

      <FAB
        style={styles.fab}
        color="#F0C38E"
        icon={'plus'}
        onPress={() => navigation.navigate('AddAnnouncement', { memberID: memberId, councilId: councilId })}
      />

      <Image
        source={require('../../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
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
    marginTop: 50,
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 20,
    color: '#000',
    marginBottom: 20,
  },
  filtersWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryScrollContent: {
    paddingTop: 12,
    paddingBottom: 5,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#F0C38E',
    borderColor: '#F0C38E',
  },
  categoryChipText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#000',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE7C8',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: '#7A4B00',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  metaData: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 17,
    marginTop: 30,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#555',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
