import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignUp from './src/screens/signUp';
import SignIn from './src/screens/signIn';
import Dashboard from './src/screens/dashboard';
import Task from './src/screens/Task';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Task" component={Task} options={{ title: "Task", headerShown: false }}></Stack.Screen>
        <Stack.Screen options={{ headerShown: false }} name="Dashboard" component={Dashboard}></Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUp} options={{ title: "Sign Up", headerShown: false }}></Stack.Screen>
        <Stack.Screen name="SignIn" component={SignIn} options={{ title: "Sign In", headerShown: false }}></Stack.Screen>


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