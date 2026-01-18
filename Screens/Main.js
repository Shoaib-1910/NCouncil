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

import ChairmanScreen from './ChairmanScreen';
import TreasurerScreen from './TreasurerScreen';
import ElectionHistory from './Election/ElectionHistory';
import ReportProblem from './ReportProblem/ReportProblem';
import ViewReportedProblems from './ReportProblem/ViewReportedProblem';
import SubmitReport from './ReportProblem/SubmitReport';
import ViewIssues from './ReportProblem/ViewIssues';
import ViewProblemProgressForPanel from './ReportProblem/ViewProblemProgressForPanel';
import ViewProblemProgress from './ReportProblem/ViewProblemProgress';
import ViewIssuesForPanel from './ReportProblem/ViewIssuesForPanel';
import ProjectDetails from './Project/ProjectsDetails';
import ShowProjectLogs from './Project/ShowProjectLogs';
import Project from './Project/Project';
import ManageProjects from './Project/ManageProjects';
import AddProject from './Project/AddProject';
import ProjectLogs from './Project/ProjectLogs';
import Meeting from './Meeting/Meeting';
import ScheduleMeeting from './Meeting/ScheduleMeeting';
import SecrataryScreen from './SecrataryScreen';
import CommitteeMemberScreen from './CommitteeMemberScreen';
import Announcement from './Announcement/Announcement';
import AddAnnouncement from './Announcement/AddAnnouncement';
import ComplaintDiaryForPanel from './ReportProblem/ComplaintDiaryForPanel';
import ComplaintDiaryForChairman from './ReportProblem/ComplaintDiaryForChairman';
import ManageContributions from './Contributions/Contribution';
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
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

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
          <Stack.Screen name="ViewIssues" component ={ViewIssues} />
           <Stack.Screen name="ViewProblemProgressForPanel" component ={ViewProblemProgressForPanel} />
           <Stack.Screen name="ViewIssuesForPanel" component ={ViewIssuesForPanel} />
           {/* Project Screens */}
           <Stack.Screen name="ProjectDetails" component ={ProjectDetails} />
           <Stack.Screen name="ShowProjectLogs" component ={ShowProjectLogs} />
           <Stack.Screen name="Project" component ={Project} />
            <Stack.Screen name="ManageProjects" component ={ManageProjects} />
<Stack.Screen name="AddProject" component ={AddProject} />
<Stack.Screen name="ProjectLogs" component ={ProjectLogs} />
           {/* Meeting Screens */}
           <Stack.Screen name="Meeting" component ={Meeting} />
           <Stack.Screen name="ScheduleMeeting" component ={ScheduleMeeting} />

           {/* Meeting Screens */}
            <Stack.Screen name="ChairmanScreen" component ={ChairmanScreen} />
            <Stack.Screen name="TreasurerScreen" component ={TreasurerScreen} />
            <Stack.Screen name="SecrataryScreen" component ={SecrataryScreen} />
            <Stack.Screen name="CommitteeMemberScreen" component ={CommitteeMemberScreen} />

            <Stack.Screen name="Announcement" component ={Announcement} />
            <Stack.Screen name="AddAnnouncement" component ={AddAnnouncement} />
            <Stack.Screen name="ComplaintDiaryForPanel" component ={ComplaintDiaryForPanel} />
            <Stack.Screen name="ComplaintDiaryForChairman" component ={ComplaintDiaryForChairman} />

            <Stack.Screen name="ManageContributions" component ={ManageContributions} />

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
//   <View>
//      <Text>Hello World</Text>
//    </View>
  );
}