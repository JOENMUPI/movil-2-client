import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Task from './Task';
import DeleteTask from './deleteTask';
import Profile from './Profile';
import ModificateTask from './ModificateTask';
import NewTask from './Newtask';

const Tab = createMaterialBottomTabNavigator();
const ProfileStack = createStackNavigator();
const Delete = createStackNavigator();
const task = createStackNavigator();
const Modificate = createStackNavigator();
const New = createStackNavigator()


const TaskStackScreen = () => (
    <TaskStack.Navigator>
        <TaskStack.Screen
            options={{ headerLeft: false }}
            name="Task"
            component={Task}>
        </TaskStack.Screen>
    </TaskStack.Navigator>
)

const DeleteTaskStackScreen = () => (
    <DeleteTaskStack.Navigator>
        <DeleteTaskStack.Screen
            options={{ headerLeft: false }}
            name="Delete"
            component={Delete}>
        </DeleteTaskStack.Screen>
    </DeleteTaskStack.Navigator>
)

const ModificateTaskStackScreen = () => (
    <ModificateTaskStack.Navigator>
        <ModificateTaskStack.Screen
            options={{ headerLeft: false }}
            name="Modificate"
            component={Modificate}>
        </ModificateTaskStack.Screen>
    </ModificateTaskStack.Navigator>
)
const NewTaskStackScreen = () => (
    <NewTaskStack.Navigator>
        <NewTaskStack.Screen
            options={{ headerLeft: false }}
            name="New"
            component={New}>
        </NewTaskStack.Screen>
    </NewTaskStack.Navigator>

)



const ProfileStackScreen = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen
            options={{ headerLeft: false }}
            name="Profile"
            component={Profile}>
        </ProfileStack.Screen>
    </ProfileStack.Navigator>
)

const Dashboard = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Task" component={TaskStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="text-box-multiple" size={26} />
                )
            }} />
            <Tab.Screen name="delete" component={DeleteTaskStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="text-box-remove" size={26} />
                )
            }} />
            <Tab.Screen name="modificate" component={ModificateTaskStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="clipboard-edit-outline" size={26} />
                )
            }} />
            <Tab.Screen name="new" component={NewTaskStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="text-box-plus" size={26} />
                )
            }} />
            <Tab.Screen name="Profile" component={ProfileStackScreen} options={{
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="account" size={26} />
                )
            }} />
        </Tab.Navigator>
    )
}

export default Dashboard;