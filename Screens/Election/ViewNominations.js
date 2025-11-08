import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import baseURL from '../Api'
import WavyBackground2 from '../../Background/WavyBackground2';

export default function ViewNominations ({route, navigation}) {
  const { width } = useWindowDimensions(); // screen width
  const {councilId} = route.params;
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const getNomination = async () => {
    try {
      console.log('Fetching Nominations...');
      const response = await fetch(`${baseURL}election/ShowCandidates?councilId=${councilId}`);
  
      console.log('Raw Response:', response);
  
      if (response.ok) {
        console.log('Response Status OK');
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Parsed Data:', data);
  
          if (data && data.length > 0) {
            // Transform API response into FlatList-friendly structure
            const flatListData = data.map((candidate) => ({
              CandidateId: candidate.CandidateId,
              CandidateName: candidate.CandidateName,
              PanelName: candidate.PanelName,
              PanelMembers: candidate.PanelMembers.map((member) => ({
                MemberId: member.MemberId,
                MemberName: member.MemberName,
                MemberRole: member.MemberRole
              })),
            }));
            console.log('Transformed Data for FlatList:', flatListData);
  
            setSelectedCandidates(flatListData); // Save data for FlatList
          } else {
            console.log('No Nominations Found');
            setSelectedCandidates([]); // No data case
          }
        } else {
          console.log('Expected JSON response, but received:', contentType);
        }
      } else {
        console.log('Failed to fetch nomination data. Status:', response.status);
      }
    } catch (error) {
      console.log('Unable to Fetch Data:', JSON.stringify(error));
    }
  };

  useEffect(() => {
    getNomination();
  }, [councilId])

  const renderCandidate = ({ item }) => (
    <View style={{
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 5,
          borderBottomWidth: 1,
          borderBottomColor: 'gray',
          
        }}>
       <Text style={styles.candidateName}>Candidate: {item.CandidateName}</Text>
       <Text style={styles.panelName}>Panel Name: {item.PanelName}</Text>
       <View style={{ flexDirection: 'row', marginBottom : 10 }}>
       <Text style={styles.membersHeading}>Panel Members:   </Text>
       <View>
       {item.PanelMembers.map((member) => (
         <Text key={member.MemberId} style={styles.memberName}> {member.MemberName} ⁓{member.MemberRole},
         </Text>
       ))}
       </View>
       </View>
     </View>
   );
  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />
     <View style={styles.cont}>
           <Text style={styles.titleText}>View Nominations</Text>
           <Text style={{color : 'gray', marginBottom: 50}}>⨀ Panel Members are Nominated for their Positions</Text>
           <FlatList
                style={{marginTop:5, marginBottom : 70}}
                data={selectedCandidates}
                renderItem={renderCandidate}
                keyExtractor={(item) => item.CandidateId.toString()}
                ListEmptyComponent={<Text style={{color: 'black'}}>No Nomination Made!</Text>}
                />
           </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set the background color to white
  },
  titleText: {
    color: 'black',
    top : 50,
    marginBottom: 50,
    fontSize: 30,
    textAlign: 'center',
  },
  cont: {
    flex : 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom : 50
  },
  candidateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color : 'black'
  },
  panelName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  membersHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color : 'black'
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
  },
});
