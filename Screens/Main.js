import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './SplashScreen';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import HomeScreen from './Home';
import ProfileScreen from './ProfileScreen';
import JoinCouncil from './Council/JoinCouncilScreen';
import CreateCouncil from './Council/CreateCouncil';
import AdminScreen from './Admin/AdminScreen';
import AdministrateElection from './Admin/AdministrateElection';
import InviteResident from './Admin/InviteResident';
import CreateElection from './Election/CreateElection';
import ViewElection from './Election/ViewElection';
import ViewNomination from './Election/ViewNominations';


const Stack = createNativeStackNavigator();

export default function Main() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="JoinCouncil" component={JoinCouncil} />
          <Stack.Screen name="CreateCouncil" component={CreateCouncil} />
           <Stack.Screen name="AdminScreen" component={AdminScreen} />
            <Stack.Screen name="Invite Resident" component={InviteResident} />
           <Stack.Screen name="Administrate Election" component={AdministrateElection} />
           <Stack.Screen name="Create Election" component={CreateElection} />
           <Stack.Screen name="View Election" component={ViewElection} />
            <Stack.Screen name="ViewNomination" component={ViewNomination} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
