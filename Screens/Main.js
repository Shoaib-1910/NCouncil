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
 import VotingScreen from './Election/VotingScreen';
import ViewNomination from './Election/ViewNominations';
import ResidentScreen from './ResidentScreen';
import NominatePanel from './Election/NominatePanel';
import NominateCandidate from './Election/NominateCandidate';
import CommitteeMemberScreen from './CommitteeMemberScreen';
import ChairmanScreen from './ChairmanScreen';
import TreasurerScreen from './TreasurerScreen';
import ElectionHistory from './Election/ElectionHistory';
import ReportProblem from './ReportProblem/ReportProblem';
import ViewReportedProblems from './ReportProblem/ViewReportedProblem';
import SubmitReport from './ReportProblem/SubmitReport';
import ViewProblemProgress from './ReportProblem/ViewProblemProgress';
import ProjectDetails from './Project/ProjectsDetails';
import ShowProjectLogs from './Project/ShowProjectLogs';
import Meeting from './Meeting/Meeting';
import ScheduleMeeting from './Meeting/ScheduleMeeting';
const Stack = createNativeStackNavigator();

export default function Main() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              gestureEnabled: false, // Disable back gesture on login
            }}
          />
          <Stack.Screen name="SignUp" component={SignUp} />

          {/* Main App Screens */}
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              gestureEnabled: false, // Disable back gesture on home
            }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />

          {/* Council Screens */}
          <Stack.Screen name="JoinCouncil" component={JoinCouncil} />
          <Stack.Screen name="CreateCouncil" component={CreateCouncil} />

          {/* Admin Screens */}
          <Stack.Screen name="AdminScreen" component={AdminScreen} />
          <Stack.Screen name="InviteResident" component={InviteResident} />

          {/* Election Screens */}
          <Stack.Screen name="CreateElection" component={CreateElection} />
          <Stack.Screen name="ViewElection" component={ViewElection} />
          <Stack.Screen name="AdministrateElection" component={AdministrateElection} />
          <Stack.Screen name="ViewNomination" component={ViewNomination} />
          <Stack.Screen name="NominatePanel" component={NominatePanel} />
          <Stack.Screen name="NominateCandidate" component={NominateCandidate} />
          <Stack.Screen name="ElectionHistory" component={ElectionHistory} />
           <Stack.Screen name="VotingScreen" component={VotingScreen} />
          {/* Role Screens */}
          <Stack.Screen name="ResidentScreen" component={ResidentScreen} />
          <Stack.Screen name="CommitteeMember" component={CommitteeMemberScreen} />
          <Stack.Screen name="Chairman" component={ChairmanScreen} />
          <Stack.Screen name="Treasurer" component={TreasurerScreen} />

          {/* Report Screens */}
          <Stack.Screen name="ReportProblem" component ={ReportProblem} />
          <Stack.Screen name="ViewReportedProblems" component ={ViewReportedProblems} />
          <Stack.Screen name="SubmitReport" component ={SubmitReport} />
          <Stack.Screen name="ViewProblemProgress" component ={ViewProblemProgress} />

           {/* Project Screens */}
           <Stack.Screen name="ProjectDetails" component ={ProjectDetails} />
           <Stack.Screen name="ShowProjectLogs" component ={ShowProjectLogs} />

           {/* Meeting Screens */}
           <Stack.Screen name="Meeting" component ={Meeting} />
           <Stack.Screen name="ScheduleMeeting" component ={ScheduleMeeting} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
//   <View>
//      <Text>Hello World</Text>
//    </View>
  );
}