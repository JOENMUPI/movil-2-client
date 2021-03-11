import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Task from './Task';
import Delete from './DeleteTask';
import Profile from './Profile';
import New from './Newtask';
import modificationTask from './ModificationTask';

const Tab = createMaterialBottomTabNavigator();
const ProfileStack = createStackNavigator();
const Tas = createStackNavigator();
const DeleteTask = createStackNavigator();
const NewTask = createStackNavigator();
const ModificationTask = createStackNavigator();


const ProfileStackScreen = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen
            options={{ headerLeft: false }}
            name="Profile"
            component={Profile}>
        </ProfileStack.Screen>
    </ProfileStack.Navigator>
)
const TaskStackScreen = () => (
    <TaskStack.Navigator>
        <TaskStack.Screen
            options={{ headerLeft: false }}
            name="Task"
            component={Task}>
        </TaskStack.Screen>
    </TaskStack.Navigator>
)

const DeleteStackScreen = () => (
    <DeleteStack.Navigator>
        <DeleteStack.Screen
            options={{ headerLeft: false }}
            name="delete"
            component={Delete}>
        </DeleteStack.Screen>
    </DeleteStack.Navigator>
)

const NewStackScreen = () => (
    <NewStack.Navigator>
        <NewStack.Screen
            options={{ headerLeft: false }}
            name="new"
            component={Name}>
        </NewStack.Screen>
    </NewStack.Navigator>
)
const ModificationStackScreen = () => (
    <ModificationStack.Navigator>
        <ModificationStack.Screen
            options={{ headerLeft: false }}
            name="modification"
            component={Modification}>
        </ModificationStack.Screen>
    </ModificationStack.Navigator>
)

const Dashboard = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Profile" component={ProfileStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="account" size={26} />
                )
            }} />
            <Tab.Screen name="Task" component={TaskStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="tooltip-outline" size={26} />
                )
            }} />
            <Tab.Screen name="Delete" component={DeleteStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="delete" size={26} />
                )
            }} />
            <Tab.Screen name="New" component={NewStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="tooltip-plus-outline" size={26} />
                )
            }} />
            <Tab.Screen name="Modification" component={ModificationStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="file-edit-outline" size={26} />
                )
            }} />

        </Tab.Navigator>
    )
}

export default Dashboard;