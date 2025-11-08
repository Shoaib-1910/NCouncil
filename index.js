import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import Main from './Screens/Main';
import { name as appName } from './app.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Main/>
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => Main);
