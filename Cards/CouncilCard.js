import React, { useEffect, useState } from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, Dimensions, Alert, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DividerLine from '../Background/LineDivider';
import { baseImageURL } from '../Screens/Api';
import baseURL  from '../Screens/Api';

export default function CouncilCard({ route, council, navigation, member, displayPicture}) {
  const [isLoading, setIsLoading] = useState(true);
  const[memberId, setMemberId] = useState(null);
  //const { member } = route.params;
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData && userData.memberId && userData.fullName) {
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
  

  const checkUserType = async () => {
 try {
   const url = `${baseURL}Council/GetUserType?memberId=${memberId}&councilId=${council.id}`;
   console.log("REQUEST URL:", url);

   const response = await fetch(url);

   console.log("HTTP STATUS:", response.status);
   console.log("HTTP OK:", response.ok);
   console.log("HEADERS:", Object.fromEntries(response.headers.entries()));

   const rawText = await response.text();
   console.log("RAW RESPONSE TEXT:", rawText);

   let role;
   try {
     role = JSON.parse(rawText);
   } catch (e) {
     console.log("JSON PARSE FAILED. RESPONSE IS NOT JSON.");
     throw new Error("Invalid JSON returned from server");
   }

   console.log("PARSED ROLE VALUE:", role);
   console.log("MEMBER ID:", memberId);
   console.log("COUNCIL ID:", council.id);

   if (!response.ok) {
     Alert.alert(
       "API Error",
       `Status: ${response.status}\nResponse: ${rawText}`
     );
     return;
   }

   if (!role) {
     Alert.alert("API Error", "Role is null or empty");
     return;
   }

   switch (role) {
     case 'Admin':
       navigation.navigate('AdminScreen', { role, Council: council.id });
       break;

     case 'Member':
       navigation.navigate('ResidentScreen', {
         role,
         Council: council.id,
         councilName: council.Name,
         councilDescription: council.Description,
       });
       break;

     case 'Councillor':
       navigation.navigate('CommitteeMemberScreen', {
         role,
         Council: council.id,
         councilName: council.Name,
         councilDescription: council.Description,
       });
       break;

     case 'Chairperson':
       navigation.navigate('ChairmanScreen', {
         role,
         Council: council.id,
         councilName: council.Name,
         councilDescription: council.Description,
       });
       break;

     case 'Treasurer':
       navigation.navigate('TreasurerScreen', {
         role,
         Council: council.id,
         councilName: council.Name,
         councilDescription: council.Description,
       });
       break;

     case 'Secratary':
       navigation.navigate('SecrataryScreen', {
         role,
         Council: council.id,
         councilName: council.Name,
         councilDescription: council.Description,
       });
       break;

     default:
       Alert.alert(
         'Unknown Role',
         `Server returned unexpected role: ${role}`
       );
   }

 } catch (error) {
   console.log("FETCH CRASH ERROR:", error.message);
   console.log("FULL ERROR OBJECT:", error);

   Alert.alert(
     'Network / Parse Error',
     error.message
   );
 } finally {
   setIsLoading(false);
 }

  };

  // useEffect(() => {
  //   checkUserType();
  // }, [navigation]);

  return (
    <View style={styles.view}>
      <Card style={styles.card} onPress={checkUserType}>
        <View style={styles.cardContent}>
          {/* Display Picture on the left */}
          {displayPicture && (
            <Image
              source={{ uri: `${baseImageURL}${displayPicture}` }}
              style={styles.displayPicture}
              resizeMode="cover"
            />
          )}
  
          {/* Council Info */}
          <View style={styles.infoContainer}>
            <Title style={{marginLeft: 0 ,color: 'black', fontWeight: '700', fontSize: 17 }}>
              {council.Name}
            </Title>
            <Paragraph
              style={{marginLeft: 0, color: 'black', fontSize: 12 }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {council.Description}
            </Paragraph>
          </View>
        </View>
      </Card>
      <DividerLine />
    </View>
  );
}  
//onPress={() => navigation.navigate('Table', { council: council.id })}

const styles = StyleSheet.create({
  view: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    marginRight: 2,
    height: '80%',
    borderRadius: 20,
    width: Dimensions.get('window').width - 25,
    backgroundColor: '#f5d8a0',
  },
  displayPicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 8,
  },
  cardContent: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Vertically center items
  },
  infoContainer: {
    flex: 1, // Take remaining space for text
  },
});
