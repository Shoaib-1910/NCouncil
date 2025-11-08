import React, { useCallback, useEffect, useState } from 'react';
import { Text, Alert, SafeAreaView, View, StyleSheet, Image, useWindowDimensions, KeyboardAvoidingView, ScrollView, FlatList } from 'react-native';
import WavyBackground from '../../Background/WavyBackground';
import  baseURL  from '../Api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ElectionCard from '../../Cards/ElectionCard';

export default function NominateCandidate({ route, navigation }){

  const { width } = useWindowDimensions();
  const [electionData, setElectionData] = useState([]);
  const {councilID} = route.params;
  const [isInitiated, setIsInitiated] = useState(false)
  const getElections = async () => {
    try {
      const response = await fetch(`${baseURL}election/getElection?councilId=${councilID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
        },
      });
      if (response.ok) {
        const json = await response.json();
        console.log(json)
        setElectionData(json);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while loading Data');
    }
  };

  useEffect(() => {
    if (electionData.length > 0) {
      const iniElection = electionData.find((ele) => ele.status === "Initiated");
      if (iniElection) {
        setIsInitiated(true)
        console.log('Election Found')
      } else {
        console.log('No Election found or an Active Election.')
        setIsInitiated(false);
      }
    }
  }, [electionData]);

  useEffect(() => {
    getElections();
  }, [councilID])

  const renderElectionCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <ElectionCard election={item} navigation={navigation} council={councilID} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground />
      {/* <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Neighborhood</Text>
        <Text style={styles.headerText}>Council</Text>
      </View> */}
      <Text style={styles.header}>Nominate Candidates for Ongoing Election</Text>
      <View style={styles.contentContainer}>
        {isInitiated? (   
          <FlatList
          data={electionData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderElectionCard}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', color: 'black', fontSize: 20 }}>
               No Elections Initiated or An Election is in progress.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      ):(
          <Text style={{ textAlign: 'center', color: 'black', fontSize: 20 }}>
               No Elections Initiated or An Election is in progress.
              </Text>
              
        )}
      </View>
        <Image
          source={require('../../assets/Footer.png')}
          style={[styles.footer, { width: width }]} // image width to screen width
          resizeMode="stretch" // Maintain aspect ratio
        />
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  contentContainer: {
    //marginTop : 200,
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 150,
  },
  header: {
    fontSize: 30,
    color: '#493D18',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '500',
    marginTop: 100,
    marginVertical: 30,
    textAlign: 'center'
  },
  headerText: {
    fontFamily: 'KronaOne-Regular',
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 10,
  },
  background: {
    flex: 1,
    resizeMode: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
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