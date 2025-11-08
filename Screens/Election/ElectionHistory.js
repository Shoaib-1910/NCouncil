import React, { useEffect, useState } from 'react';
import { Image, Text, SafeAreaView, StyleSheet, useWindowDimensions, View, Alert } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

export default function ElectionHistory ({ route }) {
  const { width } = useWindowDimensions(); // screen width
  const [activeElectionData, setActiveElectionData] = useState([])
  const [votes, setVotes] = useState([])
  const [isClosed, setIsClosed] = useState(false)
  const [electionId, setElectionId] = useState(0);
  const {councilID} = route.params
  const [loading, setLoading] = useState(false)
  const [electionData, setElectionData] = useState([])
  const [panelData, setPanelData] = useState([])
  const [membersData, setMembersData] = useState([])

  //Retreiving elections data with nominations to start the elections
const getElectionAlongNominations = async () => {
  try {
    const response = await fetch(`${baseURL}election/GetElectionWithNomination?councilId=${councilID}`, {
      method: 'GET',
    });

    if (response.ok) {
      console.log('Loading Elections Data');
      const data = await response.json(); 
      //setElectionFound(true)
      if (data && data.length > 0) {
        const uniqueElections = data.filter((value, index, self) =>
          index === self.findIndex((e) => e.ElectionId === value.ElectionId)
        );

        const electionData = uniqueElections.map((ele) => ({
          ElectionId: ele.ElectionId,
          ElectionName: ele.ElectionName,
          ElectionStatus: ele.Status,
        }));
        
        setElectionData(electionData);

        // const panelData = data.map((panel) => ({
        //   PanelId: panel.PanelId,
        //   PanelName: panel.PanelName,
        // }));
        // setPanelData(panelData);

        // const memberData = data.map((mem) => ({
        //   MemberId: mem.MemberId,
        //   MemberName: mem.MemberName,
        // }));
        // setMembersData(memberData);

        const panelData = data.map((panel) => ({
          PanelId: panel.PanelId,
          PanelName: panel.PanelName,
          MemberId: panel.MemberId,
          MemberName: panel.MemberName,
        }));
        setPanelData(panelData);

        console.log('Elections Data Loaded!');
      } else {

        Alert.alert('No data found');
      }
    } else {
     Alert.alert('Failed to retrieve data');
      console.error('Response not OK:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    Alert.alert('Error fetching data');
  }
 
};

 
const fetchElectionData = async () => {
  try {
    console.log('Fetching Active data...');
    const response = await fetch(`${baseURL}election/GetElectionWithVotes?electionId=${electionId}`);
    const data = await response.json();

    if (response.ok) {
   
      setActiveElectionData({
        electionId: data.ElectionId,
        electionName: data.ElectionName,
        status: data.Status,
      });

      
      if (data.Candidates && data.Candidates.length > 0) {
        const candidatesData = data.Candidates.map((candidate) => ({
          candidateId: candidate.CandidateId,
          candidateName: candidate.CandidateName,
          voteCount: candidate.VoteCount,
        }));
        setVotes(candidatesData);
        console.log('Candidates data set successfully');
      } else {
        console.log('No candidates data found');
      }
      setIsClosed(data.Status === "Closed");
      
      console.log('Election data fetched successfully!');
    } else {
      console.log("Error: Failed to load election data");
    }
  } catch (error) {
    console.error("Error fetching election data:", error);
  }
};

useEffect(() => {
  getElectionAlongNominations();
  fetchElectionData();
},[electionId, councilID])

useEffect(() => {
  if (activeElectionData.length > 0) {
    const activeElection = activeElectionData.find((ele) => ele.Status === "Closed");
    if (activeElection) {
      setElectionId(activeElection.ElectionId);
      setIsClosed(true);
      fetchElectionData()
      console.log('Election is Closed')
    } 
    const InitiatedElection = activeElectionData.find((ele) => ele.Status !== 'Closed')
    if(InitiatedElection){
      console.log('Election is not Closed')
      setElectionId(InitiatedElection.ElectionId)
      setIsClosed(false)
    }
  }
}, [activeElectionData])

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      {isClosed? (
        <View style={styles.cont}>
         <Text style={styles.titleText}>Close the Election</Text>
         <View style={styles.card}>
      <Text style={styles.title}>{activeElectionData.electionName}</Text>
      <Text style={styles.statusText}>Status: {activeElectionData.status}</Text>
        </View>
      <FlatList
        data={votes}
        keyExtractor={(item) => item.candidateId.toString()}
        renderItem={({ item }) => (
          <View style={styles.voteContainer}>
            <Text style={styles.candidateText}>Candidate: {item.candidateName}</Text>
            <Text style={styles.voteText}>Votes: {item.voteCount}</Text>
          </View>
        )}
      />
    </View>):( 
      <View style={styles.cont}>
      <Text style={styles.titleText}>Election ongoing or No Election Started</Text>
      </View>
      )} 
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
  cont: {
    flex : 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom : 50
  },activeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop : 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  voteContainer: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginVertical: 8,
  },
  candidateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',

  },
  titleText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center'
  },
  voteText: {
    fontSize: 16,
    color: '#333',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
  },
});
