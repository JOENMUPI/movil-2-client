import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignUp from './src/screens/signUp';
import SignIn from './src/screens/signIn';
import Home from './src/screens/home';
import ListDetail from './src/screens/listDetail';
import TaskDetail from './src/screens/taskDetail';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>     
        <Stack.Screen name="SignIn" component={SignIn} options={{ title: "Sign In", headerShown: false }}></Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUp} options={{ title: "Sign Up", headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Home" component={Home} options={{ title: "Home", headerShown: false }}></Stack.Screen>
        <Stack.Screen name="ListDetail" component={ListDetail} options={{ title: "List Detail", headerShown: false }}></Stack.Screen>
        <Stack.Screen name="TaskDetail" component={TaskDetail} options={{ title: "Task Detail", headerShown: false }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});