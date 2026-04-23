import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FAB } from 'react-native-paper';
import { generatePDF } from 'react-native-html-to-pdf';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';

const normalizePoll = (poll) => {
  const normalizedOptions = Array.isArray(poll?.options)
    ? poll.options.map((option, index) => {
        if (typeof option === 'string') {
          return {
            optionId: index,
            optionText: option,
            totalVotes: 0,
          };
        }

        return {
          optionId: option?.optionId ?? index,
          optionText: option?.optionText ?? `Option ${index + 1}`,
          totalVotes: Number(option?.totalVotes) || 0,
        };
      })
    : [];

  return {
    pollId: poll?.pollId ?? poll?.questionId ?? null,
    questionId: poll?.questionId ?? poll?.pollId ?? null,
    question: poll?.question ?? '',
    Active: Number(poll?.Active ?? poll?.active ?? poll?.isActive ?? 0),
    options: normalizedOptions,
  };
};

export default function Poll({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { councilId, memberId, fromScreen, fromParams, role } = route.params || {};
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submittingVoteFor, setSubmittingVoteFor] = useState(null);
  const [closingPollId, setClosingPollId] = useState(null);
  const isAdmin = role === 'Admin' || fromScreen === 'AdminScreen';

  const fetchPolls = useCallback(async () => {
    if (!councilId) {
      setPolls([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${baseURL}Announcement/GetPolls?councilId=${councilId}`
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setPolls(data.map(normalizePoll));
      } else {
        console.log('Failed to fetch polls:', response.status, data);
        setPolls([]);
      }
    } catch (error) {
      console.log('Error fetching polls:', error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, [councilId]);

  useFocusEffect(
    useCallback(() => {
      fetchPolls();
    }, [fetchPolls])
  );

  const handleSelectOption = (questionId, optionId) => {
    setSelectedOptions((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));
  };

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

  const handleVote = async (poll) => {
    const questionId = poll?.questionId;
    const optionId = selectedOptions[questionId];

    if (!questionId) {
      Alert.alert('Poll not found.');
      return;
    }

    if (!poll?.Active) {
      Alert.alert('This poll is closed.');
      return;
    }

    if (optionId === undefined || optionId === null) {
      Alert.alert('Please select an option first.');
      return;
    }

    setSubmittingVoteFor(questionId);

    try {
      const response = await fetch(
        `${baseURL}Announcement/PollVote?questionId=${questionId}&optionId=${optionId}`,
        {
          method: 'POST',
        }
      );

      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.ok) {
        Alert.alert('Vote submitted successfully.');
        setSelectedOptions((previous) => ({
          ...previous,
          [questionId]: null,
        }));
        await fetchPolls();
        return;
      }

      console.log('Failed to submit vote:', response.status, responseData);
      Alert.alert('Failed to submit vote.');
    } catch (error) {
      console.log('Error submitting vote:', error);
      Alert.alert('Unable to submit vote right now.');
    } finally {
      setSubmittingVoteFor(null);
    }
  };

  const handleClosePoll = async (poll) => {
    const pollId = poll?.pollId;

    if (!pollId) {
      Alert.alert('Poll not found.');
      return;
    }

    if (!poll?.Active) {
      Alert.alert('This poll is already closed.');
      return;
    }

    setClosingPollId(pollId);

    try {
      const response = await fetch(
        `${baseURL}Announcement/DeactivatePoll?pollId=${pollId}`,
        {
          method: 'POST',
        }
      );

      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.ok) {
        Alert.alert('Poll closed successfully.');
        await fetchPolls();
        return;
      }

      console.log('Failed to close poll:', response.status, responseData);
      Alert.alert('Failed to close poll.');
    } catch (error) {
      console.log('Error closing poll:', error);
      Alert.alert('Unable to close poll right now.');
    } finally {
      setClosingPollId(null);
    }
  };

  const handleExportPdf = async (poll) => {
    if (!poll) {
      Alert.alert('No poll available to export.');
      return;
    }

    const totalVotesCount = poll.options.reduce(
      (sum, option) => sum + (Number(option.totalVotes) || 0),
      0
    );

    const reportRows = poll.options
      .map((option, index) => {
        const voteCount = Number(option.totalVotes) || 0;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${option.optionText}</td>
            <td>${voteCount}</td>
          </tr>
        `;
      })
      .join('');

    const safeFileName = `poll_result_${poll.pollId || poll.questionId || councilId}_${Date.now()}`;
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #222;
            }
            h1 {
              margin-bottom: 8px;
            }
            .meta {
              margin-bottom: 18px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #d9d9d9;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f3e3c6;
            }
          </style>
        </head>
        <body>
          <h1>Community Poll Result</h1>
          <div class="meta"><strong>Question:</strong> ${poll.question}</div>
          <div class="meta"><strong>Status:</strong> ${poll.Active === 1 ? 'Active' : 'Closed'}</div>
          <div class="meta"><strong>Total Votes:</strong> ${totalVotesCount}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Option</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const file = await generatePDF({
        html,
        fileName: safeFileName,
        directory: 'Documents',
      });

      Alert.alert(
        'PDF Downloaded',
        `Poll result PDF saved successfully on your phone.\n\nPath: ${file.filePath}`
      );
    } catch (error) {
      console.log('Error exporting poll report:', error);
      Alert.alert('Unable to generate PDF right now.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Community Poll</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#7A4B00" />
          </View>
        ) : polls.length > 0 ? (
          polls.map((poll, pollIndex) => {
            const totalVotes = poll.options.reduce(
              (sum, option) => sum + (Number(option.totalVotes) || 0),
              0
            );
            const isActive = poll.Active === 1;

            return (
              <View
                key={`${poll.pollId || poll.questionId || pollIndex}`}
                style={styles.card}
              >
                <Text style={styles.questionLabel}>Question</Text>
                <Text style={styles.questionText}>{poll.question}</Text>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      isActive ? styles.statusOpen : styles.statusClosed,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {isActive ? 'Active' : 'Closed'}
                    </Text>
                  </View>
                  <Text style={styles.totalVotesText}>Total Votes: {totalVotes}</Text>
                </View>

                <Text style={styles.optionsLabel}>Options</Text>
                {poll.options.map((option, optionIndex) => (
                  <TouchableOpacity
                    key={`${option.optionId}-${optionIndex}`}
                    style={[
                      styles.optionRow,
                      selectedOptions[poll.questionId] === option.optionId &&
                        styles.optionRowSelected,
                    ]}
                    activeOpacity={0.85}
                    disabled={!isActive}
                    onPress={() => handleSelectOption(poll.questionId, option.optionId)}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selectedOptions[poll.questionId] === option.optionId &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selectedOptions[poll.questionId] === option.optionId ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                    <View style={styles.optionTextWrapper}>
                      <Text style={styles.optionText}>{option.optionText}</Text>
                      <Text style={styles.voteCountText}>
                        Votes: {Number(option.totalVotes) || 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {isActive ? (
                  <TouchableOpacity
                    style={[
                      styles.voteButton,
                      submittingVoteFor === poll.questionId && styles.voteButtonDisabled,
                    ]}
                    onPress={() => handleVote(poll)}
                    disabled={submittingVoteFor === poll.questionId}
                  >
                    {submittingVoteFor === poll.questionId ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.voteButtonText}>Vote</Text>
                    )}
                  </TouchableOpacity>
                ) : null}

                {!isActive ? (
                  <Text style={styles.infoText}>This poll is closed.</Text>
                ) : null}

                {isAdmin ? (
                  <View style={styles.adminButtonsContainer}>
                    {isActive ? (
                      <TouchableOpacity
                        style={[
                          styles.adminButton,
                          styles.closeButton,
                          closingPollId === poll.pollId && styles.adminButtonDisabled,
                        ]}
                        onPress={() => handleClosePoll(poll)}
                        disabled={closingPollId === poll.pollId}
                      >
                        {closingPollId === poll.pollId ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.adminButtonText}>Close Poll</Text>
                        )}
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.adminButton, styles.exportButton]}
                      onPress={() => handleExportPdf(poll)}
                    >
                      <Text style={styles.adminButtonText}>Export Result as PDF</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No poll created yet</Text>
          </View>
        )}
      </ScrollView>

      {isAdmin ? (
        <FAB
          style={styles.fab}
          color="#F0C38E"
          icon="plus"
          onPress={() => navigation.navigate('AddPoll', { councilId, memberId })}
        />
      ) : null}

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
    marginTop: 50,
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 20,
    color: '#000',
    marginBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
  },
  questionLabel: {
    color: '#7A4B00',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionText: {
    color: '#111',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  optionsLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusOpen: {
    backgroundColor: '#D9F4D7',
  },
  statusClosed: {
    backgroundColor: '#F7D6D6',
  },
  statusText: {
    color: '#111',
    fontWeight: '700',
  },
  totalVotesText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionRowSelected: {
    borderColor: '#F0C38E',
    backgroundColor: '#FFF7EC',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#B7B7B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#C78A2D',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C78A2D',
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  voteCountText: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  infoText: {
    color: '#444',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  voteButton: {
    backgroundColor: '#F0C38E',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  voteButtonDisabled: {
    opacity: 0.7,
  },
  voteButtonText: {
    color: '#000',
    fontWeight: '700',
  },
  adminButtonsContainer: {
    marginTop: 18,
  },
  adminButton: {
    backgroundColor: '#555',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
  },
  adminButtonDisabled: {
    opacity: 0.7,
  },
  closeButton: {
    backgroundColor: '#555',
  },
  exportButton: {
    backgroundColor: '#7A4B00',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 400,
  },
  emptyText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
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
