import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './SplashScreen';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import HomeScreen from './Home';
import JoinCouncil from './Council/JoinCouncilScreen';     // 👈 add this
import ProfileScreen from './ProfileScreen'; // 👈 add this

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
          <Stack.Screen name="JoinCouncil" component={JoinCouncil} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
