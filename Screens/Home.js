// import React, { useEffect, useState } from 'react';
// import { FlatList, Alert, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View,} from 'react-native';
// import WavyBackground from '../Background/WavyBackground';
// import { Button, FAB } from 'react-native-paper';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { StackRouter, useNavigation } from '@react-navigation/native';
// import CouncilCard from '../Cards/CouncilCard';

// export default function HomeScreen ({ navigation }) {
//   const { width } = useWindowDimensions(); // screen width
//   const [councilData, setCouncilData] = useState([]);

//   useEffect(()=>{
//     const GetCouncils = async () => {
//       try {
//         const response = await fetch(`${baseURL}Council/getCouncils`);
//         if (response.ok) {
//           const json = await response.json();
//           setCouncilData(json);
//         } else {
//           const errorText = await response.text();
//           console.error('Failed to load Data:', errorText);
//           Alert.alert('Error', 'Failed to Data');
//         }
//       } catch (error) {
//         console.error('Error loading Data:', error);
//         Alert.alert('Error', 'An error occurred while loading Data');
//       }
//     };
//      GetCouncils;
//   } , []);


//   const handlePress = async () => {
//     try {
//       await AsyncStorage.removeItem('userToken');
//       console.log('Token removed successfully');
//       navigation.replace('Login'); // Only navigate if the token is successfully removed
//     } catch (error) {
//       console.error('Error removing token:', error);
//       Alert.alert('Error', 'Failed to log out. Please try again.');
//     }
//   };

//   const renderCouncilCard = ({ item }) => (
//     <View style={styles.cardContainer}>
//       <CouncilCard council={item} navigation={navigation} />
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <WavyBackground />
//     <Text style={styles.text} >Neighborhood</Text>
//     <Text style={styles.text} >Council</Text>
//     <View style={styles.container}>
//     <FlatList
//         data={councilData}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderCouncilCard}
//         contentContainerStyle={styles.listContent}
//       />
//       </View>
//       <FAB icon={'plus'} style={styles.fab} color='#fff' backgroundColor='#F0C38E'  />
//       <View style={styles.footerContainer}>
//         <Image
//           source={require('../assets/Footer.png')}
//           style={[styles.footer, { width: width }]} // image width to screen width
//           resizeMode="contain" // Maintain aspect ratio
//         />
//       </View>
//     </SafeAreaView>
//   );
// };



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff', // Adjust the background color if needed
//   },
//   cardContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     margin: 8,
//   },
//   listContent: {
//     paddingBottom: 60, // Adjust if you want padding for the footer
//     paddingTop: 160, // Adjust based on wavy background height
//   },
//   text:{
//     fontFamily : 'KronaOne-Regular',
//     fontSize : 30,
//     textAlign : 'left',
//     left: 5,
//     top: 30,
//     color: 'black'
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Set the background color to white
//   },
//   footerContainer: {
//     position: 'absolute',
//     bottom: 0,
//     width: useWindowDimensions,
//     alignItems: 'center',
//     zIndex : -1
//   },
//   footer: {
//     height: 100,
//     zIndex : -1
//   },
//   fab:{
//     position: 'absolute',
//     margin: 'auto',
//     right: 20,
//     bottom: 100,
//     borderRadius : 50,
//   },
//   button : {

//     margin: 'auto',
//     left: 20,
//   }
// });





////////////////////////////////////////// MY CODE //////////////////////////


import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Alert, Image, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, Modal, TouchableOpacity, BackHandler, TextInput } from 'react-native';
import WavyBackground2 from '../Background/WavyBackground2';
import { FAB, Portal, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CouncilCard from '../Cards/CouncilCard';
import { useFocusEffect } from '@react-navigation/native';
import baseURL  from './Api';

export default function HomeScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const [councilData, setCouncilData] = useState([]);
  const [memberId, setMemberId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert(
          'Confirm Exit',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.memberId) {
          setMemberId(userData.memberId);
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

  // Fetch councils once memberId is ready
  useEffect(() => {
    if (memberId) {
      GetCouncils();
    }
  }, [memberId]);

  // Fetch council data from API
  const GetCouncils = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}Council/GetCouncils?memberId=${memberId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();

      if (response.ok) {
        setCouncilData(json);
        setFilteredData(json);
      } else if (response.status === 204) {
        setCouncilData([]);
        setFilteredData([]);
        Alert.alert('No Councils Found');
      } else {
        console.error('API Error:', json);
        Alert.alert('Error', json?.message || 'Failed to load data.');
      }
    } catch (error) {
      console.error('API fetch error:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Are you sure?',
      'Do you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ok',
          onPress: async () => {
            try {
              closeMenu();
              await AsyncStorage.removeItem('userToken');
              navigation.replace('Login');
              console.log('Logged out successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredData(councilData);
    } else {
      const filtered = councilData.filter((council) =>
        council.Name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const renderCouncilCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <CouncilCard council={item} navigation={navigation} member={memberId} displayPicture={item.DisplayPictureUrl}/>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyBackground2 />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Neighborhood</Text>
        <Text style={styles.headerText}>Council</Text>
      </View>

      <TextInput
        style={styles.searchBox}
        placeholder="Search Councils..."
        placeholderTextColor={'black'}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.contentContainer}>
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCouncilCard}
          refreshing={loading}
          onRefresh={GetCouncils}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{ textAlign: 'center', color: 'black', fontSize: 20 }}>
                No Councils Added, try joining them with the plus icon
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Provider>
        <Portal>
          <FAB.Group
            open={isOpen}
            icon={isOpen ? 'close' : 'plus'}
            backgroundColor="#F0C38E"
            actions={[
              {
                icon: 'pencil',
                label: 'Add New Council',
                onPress: () => navigation.replace('JoinCouncil', { memberID: memberId }),
                labelStyle: { color: 'black' },
                color: 'white',
              },
            ]}
            onStateChange={({ open }) => setIsOpen(open)}
            fabStyle={styles.fab}
            backdropColor="transparent"
            style={styles.fabGroup}
            color="#F0C38E"
          />
        </Portal>
      </Provider>

      <FAB
        icon="dots-vertical"
        style={styles.fab3}
        color="#000"
        onPress={openMenu}
      />

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuOption} onPress={() => { navigation.navigate('ProfileScreen'); closeMenu(); }}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOption} onPress={handleLogout}>
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Image
        source={require('../assets/Footer.png')}
        style={[styles.footer, { width: width }]}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { alignItems: 'flex-start', marginTop: 30, marginLeft: 5, marginBottom: 10 },
  headerText: { fontFamily: 'KronaOne-Regular', fontSize: 25, color: '#000', marginBottom: 15 },
  contentContainer: { flex: 1, paddingHorizontal: 0, paddingBottom: 80 },
  listContent: { marginTop: 10, paddingBottom: 0 },
  cardContainer: { borderRadius: 20, padding: 0 },
  searchBox: { height: 50, marginHorizontal: 15, marginBottom: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, color : 'black', borderColor: '#ccc', backgroundColor: '#fff' },
  fab: { backgroundColor: '#555' },
  fabGroup: { position: 'absolute', right: 10, bottom: 80 },
  fab3: { position: 'absolute', right: 20, top: 30, backgroundColor: '#f5d8a0', borderRadius: 25 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  menuContainer: { marginTop: 70, marginRight: 25, width: 150, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  menuOption: { paddingVertical: 10 },
  menuText: { fontSize: 16, color: '#333' },
  footer: { position: 'absolute', bottom: 0, zIndex: -1 },
});



// /////////////  Modal Code
// <View style={styles.container2}>
// <TouchableOpacity style={styles.optionsButton} onPress={openMenu}>
// <Text style={styles.optionsText}>⋮</Text> {/* Three dots icon */}
// </TouchableOpacity>
// <Modal
// visible={modalVisible}
// transparent={true}
// animationType="fade"
// onRequestClose={closeMenu}
// >
// <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
//   <View style={styles.menuContainer}>
//     <TouchableOpacity style={styles.menuOption} onPress={{}}>
//       <Text style={styles.menuText}>Profile</Text>
//     </TouchableOpacity>
//     <TouchableOpacity style={styles.menuOption} onPress={{}}>
//       <Text style={styles.menuText}>Logout</Text>
//     </TouchableOpacity>
//   </View>
// </TouchableOpacity>
// </Modal>
// </View>

////////////////////////////// MY CODE END////////////////////////////

