import React, { useEffect, useState } from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, Dimensions, Alert, View } from 'react-native';

export default function ElectionCard({ council, election, navigation }) {
  //const [ council ] = route.params;

  return (
    <Card style={styles.card} onPress={() =>navigation.replace('CreateNominees', {electionName: election.Name, electionId: election.id, councilId: council })}>
      <Card.Content>
        <Title style={styles.title}>{election.Name}</Title>
        <Paragraph style={styles.text}>Status: {election.status}</Paragraph>
        <Paragraph style={styles.subtitle}>Start Date</Paragraph>
        <Paragraph style={styles.text}>{new Date(election.StartDate).toLocaleString()}</Paragraph>
        <View style={styles.view}>
          <Paragraph style={styles.subtitle}>End Date</Paragraph>
          <Paragraph style={styles.text}>{new Date(election.EndDate).toLocaleString()}</Paragraph>
          <Paragraph style={styles.manageText}>Click to manage Election!</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );
}
  
  
  //onPress={() => navigation.navigate('Table', { council: council.id })}
  
  const styles = StyleSheet.create({
    card: {
      flex: 1,
      marginRight: 2,
      height: '80%',
      borderRadius : 35,
      width: Dimensions.get('window').width - 25, 
      backgroundColor : '#f5d8a0'
    },
    // card: {
    //   margin: 10,
    //   padding: 10,
    //   backgroundColor: 'white',
    //   borderRadius: 8,
    //   elevation: 3,
    // },
    title: {
      color: 'black',
      fontWeight: '700',
    },
    text: {
      color: 'black',
    },
    subtitle: {
      color: 'black',
      fontWeight: '500',
    },
    view: {
      marginTop: 0,
    },
    manageText: {
      color: 'black',
      textAlign: 'center',
      marginTop: 7,
      fontWeight: '700',
      fontSize: 17,
    }
  });