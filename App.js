import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AgentScreen from './screens/AgentScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Giriş' }} />
        <Stack.Screen name="Agent" component={AgentScreen} options={{ title: 'Mobile Agent Aktif' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
