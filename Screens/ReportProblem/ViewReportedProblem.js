import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api';
import { baseImageURL } from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ViewReportedProblems({ navigation, route }) {
  const { width } = useWindowDimensions(); // screen width
  const { councilId, problemStatus } = route.params;
  const [problemData, setProblemData] = useState([]);
  const [memberId, setMemberId] = useState(0);

  const [memberName, setMemberName] = useState('')
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.memberId) {
          setMemberId(userData.memberId);
          setMemberName(userData.fullName)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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

  const getReportedProblem = async () => {
    try {
      const response = await fetch(`${baseURL}ReportProblem/GetReportedProblemByStatus?councilId=${councilId}&memberId=${memberId}&status=${problemStatus}`);
      if (response.ok) {
        const data = await response.json(); // Await the JSON parsing
        if (data && data.length > 0) {
          // Map and sort the data
          const sortedData = data
            .map((rp) => ({
              ProblemId: rp.ProblemId,
              Title: rp.Title,
              Description: rp.Description,
              Status: rp.Status,
              ProblemType: rp.ProblemType,
              Category: rp.Category,
              CreatedAt: rp.CreatedAt,
              VisualEvidence: rp.VisualEvidence,
              MemberId: rp.MemberId,
              CouncilId: rp.CouncilId,
            }))
            .sort((a, b) => {
              if (a.Status === 'Opened' && b.Status !== 'Opened') return -1; // Opened comes first
              if (a.Status !== 'Opened' && b.Status === 'Opened') return 1;
              if (a.Status === 'Pending' && b.Status !== 'Pending') return -1; // Pending comes next
              if (a.Status !== 'Pending' && b.Status === 'Pending') return 1;
              return new Date(b.CreatedAt) - new Date(a.CreatedAt); // Sort by CreatedAt within groups
            });
  
          setProblemData(sortedData);
          console.log('Sorted Data:', sortedData);
        } else {
          console.log('No reported problems found.');
        }
      } else {
        console.log(`Failed to load reported problems. Status: ${response.status}`);
      }
    } catch (error) {
      console.log('Unable to get Reported Problems', error);
    }
  };
  

  // const setProblemStatusToOpen = async(problemId) => {
  //   try{
  //     const response = await fetch(`${baseURL}ReportProblem/SetStatusToOpen?problemId=${problemId}`,
  //       {method : 'POST',  
  //         headers: {
  //         'Content-Type': 'application/json',
  //       }})
  //     if(response.ok){
  //         console.log(`Status Set to Opened for ${problemId}`)
  //         getReportedProblem();
  //     }
  //     else{
  //       console.log('Failed to Change Status to Open')
  //     }
  //   }
  //   catch{
  //     console.log('Unable to change status of Reported Problem', error);
  //   }
  // }

  // const setProblemStatusToClose = async(problemId) => {
  //   try{
  //     const response = await fetch(`${baseURL}ReportProblem/SetStatusToClose?problemId=${problemId}`,
  //       {method : 'POST',  
  //         headers: {
  //         'Content-Type': 'application/json',
  //       }})
  //     if(response.ok){
  //         console.log(`Status Set to Closed for ${problemId}`)
  //         getReportedProblem();
  //     }
  //     else{
  //       console.log('Failed to Change Status to Close')
  //     }
  //   }
  //   catch{
  //     console.log('Unable to change status of Reported Problem', error);
  //   }
  // }

  // useEffect(() => {
  //   getReportedProblem();
  // }, []);
  useFocusEffect(
    React.useCallback(() => {
      getReportedProblem();
    }, [councilId, memberId])
  )

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewProblemProgress',{problemId: item.ProblemId, problemStatus: item.Status, councilId: councilId, memberId: memberId})}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{item.Title}</Text>
        <Text style={styles.status(item.Status)}>{item.Status}</Text>
      </View>
      <Text style={styles.description}>{item.Description}</Text>
      {item.VisualEvidence ? (
        <Image
        source={{ uri: `${baseImageURL}${item.VisualEvidence}` }} 
        style={styles.image}
        resizeMode="cover"
      />
      ) : (
        <Text style={styles.noImageText}>No Visual Evidence</Text>
      )}
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Type: {item.ProblemType}</Text>
        <Text style={styles.metaText}>Category: {item.Category}</Text>
      </View>
      <Text style={[styles.metaText,{marginTop: 5}]}>Reported At: {new Date(item.CreatedAt).toDateString() || 'No Date'}</Text>
      {/* ///////////////////////////////   Click to View Progess buttons ///////////////////////////// */}
      
      {/* {item.Status === 'Opened' && (
      <TouchableOpacity
            style={[styles.button, styles.tickButton]} 
            onPress={() => navigation.navigate('ViewProblemProgress',{problemId: item.ProblemId, problemStatus: item.Status, councilId: councilId, memberId: memberId})}
          >
            <Text style={styles.buttonText}>Click to View Progress!</Text>
          </TouchableOpacity>)}
      {item.Status === 'Closed' && (
      <TouchableOpacity
            style={[styles.button, styles.tickButton]} 
            onPress={() => navigation.navigate('ViewProblemProgress',{problemId: item.ProblemId, problemStatus: item.Status, councilId: councilId, memberId: memberId})}
          >
            <Text style={styles.buttonText}>Click to View Progress!</Text>
          </TouchableOpacity>)} */}

          {/* ///////////////////////////////   Click to View Progess buttons ///////////////////////////// */}

      {/* <View style={styles.buttonContainer}>
        {item.Status === 'Pending' && (
          <TouchableOpacity
            style={[styles.button, styles.tickButton]}
            onPress={() => setProblemStatusToOpen(item.ProblemId)}
          >
            <Text style={styles.buttonText}>✔ Approve</Text>
          </TouchableOpacity>
        )}
        {item.Status === 'Opened' && (
          <View style = {{flex : 1, flexDirection : 'row', }}>
          <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('ScheduleMeeting',{problemId: item.ProblemId , councilId: councilId, memberId: memberId})}
        >
          <Text style={styles.buttonText}>Schedule Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.tickButton]}
          onPress={() => navigation.navigate('AddProject',{problemId: item.ProblemId, councilId: councilId, memberID : memberId})}
        >
          <Text style={styles.buttonText}>Start Project</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.button, styles.crossButton]}
            onPress={() => setProblemStatusToClose(item.ProblemId)}
          >
            <Text style={styles.closeButtonText}>❌ Close</Text>
          </TouchableOpacity>
        </View>
        )}
      </View> */}
    </TouchableOpacity>
  );
// For Open button text
//Start Now, take action, get Started, Fix It, Solve It
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      <Text style={styles.screenTitle}>Reported Problems</Text>
      <View style={styles.contentContainer}>
      <FlatList
        data={problemData}
        keyExtractor={(item) => item.ProblemId.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{color: 'black', fontSize: 16, textAlign: 'center'}}>No Problems Reported Yet!</Text>}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
      </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]}
          resizeMode="stretch"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  status: (status) => ({
    fontSize: 14,
    fontWeight: '600',
    color: status === 'Pending' ? '#F59E0B' : status === 'Opened' ? '#10B981' : status === 'Closed' ? '#EF4444': status === 'Completed' ? '#000' : '#000' ,
    backgroundColor: status === 'Pending' ? '#FEF3C7' : status === 'Opened' ? '#D1FAE5' : status === 'Closed' ? '#FEE2E2': status === 'Completed' ? '#ccd0db' : '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  }),
  description: {
    fontSize: 15,
    color: '#6B7280',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginTop: 8,
  },
  noImageText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickButton: {
    backgroundColor: '#f5d8a0',
  },
  crossButton: {
    backgroundColor: '#FEE2E2',
  },
  buttonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  closeButtonText: {
    fontSize: 15,
    color: '#cf2500',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  footer: {
    height: 80,
  },
});
