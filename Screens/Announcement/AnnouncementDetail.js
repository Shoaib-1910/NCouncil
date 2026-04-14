import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../Api';

export default function AnnouncementDetail({ route }) {
  const { width } = useWindowDimensions();
  const { announcement } = route.params || {};
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [fullName, setFullName] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchComments();
  }, [announcement?.AnnouncementId]);

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchUserData = async () => {
    const userData = await getUserData();
    if (userData?.fullName) {
      setFullName(userData.fullName);
    }
  };

  const fetchComments = async () => {
    if (!announcement?.AnnouncementId) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}Announcement/GetCommentsByAnnouncement?announcementId=${announcement.AnnouncementId}`
      );
      const data = await response.json();

      if (response.ok) {
        setComments(Array.isArray(data) ? data : []);
      } else {
        setComments([]);
        console.log('Failed to fetch comments:', data);
      }
    } catch (error) {
      setComments([]);
      console.error('Error fetching comments:', error);
    }
    setCommentsLoading(false);
  };

  const handleAddComment = async () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      Alert.alert('Please write a comment first.');
      return;
    }

    if (!announcement?.AnnouncementId) {
      Alert.alert('Announcement not found.');
      return;
    }

    const postBody = {
      announcementid: announcement.AnnouncementId,
      comments: trimmedComment,
      name: fullName || 'Unknown User',
    };

    setPostingComment(true);
    try {
      const response = await fetch(`${baseURL}Announcement/PostAnnouncementComments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
      });

      if (response.ok) {
        setCommentText('');
        fetchComments();
      } else {
        Alert.alert('Failed to post comment.');
      }
    } catch (error) {
      Alert.alert('An error occurred while posting the comment.');
    }
    setPostingComment(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Announcement Details</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Title</Text>
          <Text style={styles.titleText}>{announcement?.Title || 'No title available'}</Text>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {announcement?.Category || 'Category will appear here later'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>
            {announcement?.Description || 'No description available'}
          </Text>

          <Text style={styles.metaText}>
            Added by: {announcement?.MemberName || 'Unknown'} ({announcement?.RoleName || 'Member'})
          </Text>
          <Text style={styles.metaText}>
            Date: {announcement?.Date ? new Date(announcement.Date).toDateString() : 'Not available'}
          </Text>
        </View>

        <View style={styles.commentsCard}>
          <Text style={styles.commentsHeading}>Comments</Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#7A7A7A"
            multiline={true}
            value={commentText}
            onChangeText={setCommentText}
          />

          <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
            {postingComment ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.commentButtonText}>Post Comment</Text>
            )}
          </TouchableOpacity>

          <View style={styles.commentsList}>
            {commentsLoading ? (
              <ActivityIndicator size="small" color="#000" style={styles.commentsLoader} />
            ) : comments.length === 0 ? (
              <Text style={styles.noCommentsText}>No comments yet.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentUser}>{comment.name || 'Unknown User'}</Text>
                  <Text style={styles.commentBody}>{comment.comments}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 120,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 20,
    color: '#000',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionLabel: {
    color: '#7A4B00',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  titleText: {
    color: '#222',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE7C8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryBadgeText: {
    color: '#7A4B00',
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionText: {
    color: '#444',
    fontSize: 15,
    lineHeight: 24,
  },
  metaText: {
    color: '#666',
    fontSize: 13,
    marginTop: 10,
  },
  commentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsHeading: {
    color: '#222',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  commentInput: {
    minHeight: 110,
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  commentButton: {
    backgroundColor: '#F0C38E',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  commentButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  commentsList: {
    marginTop: 20,
    minHeight: 120,
  },
  commentsLoader: {
    marginTop: 20,
  },
  noCommentsText: {
    color: '#666',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  commentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  commentUser: {
    color: '#222',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  commentBody: {
    color: '#555',
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});
