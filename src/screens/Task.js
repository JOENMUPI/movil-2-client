import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { MaterialCommunityIcons, AntDesing } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { color } from 'react-native-reanimated';
import { createPortal } from 'react-dom';

const colors = {
    themeColor: "#4263ec",
    white: "#fff",
    background: "f4f6fc",
    greyish: "#a4a4a4",
    tint: "#2b49c"
}

const tasks = [{
    task: "Morning Walk",
    icon: "hike",
    theme: "#008b8b",
    stamp: "Today . 8am"
},
{
    task: "Meet with HR",
    icon: "account-tie",
    theme: "#3700c",
    stamp: "Today . 8pm"
},
{
    task: "Shopping with family",
    icon: "cart",
    theme: "#fed132",
    stamp: "Tomorrow . 3pm"
},
{
    task: "Time for Gym",
    icon: "weight",
    theme: "#008b8b",
    stamp: "Saturday . 4pm"
},
];
const Task = ({ tasks, icon, theme, stamp }) => {
    return (
        <View>
            <View style={{
                backgroundColor: colors.white,
                flexDirection: "row",
                marginHorizontal: 16,
                marginVertical: 4,
                borderRadius: 20,
                paddingVertical: 20,
                paddingHorizontal: 24,
                alignItems: "center",
                justifyContent: "space-between"
            }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}></View>
                <MaterialCommunityIcons
                    name={icon}
                    size={30}
                    style={{ color: theme, marginRight: 5 }}
                />

                <View>
                    <Text style={{ fontSize: 16 }}>{task}</Text>
                    <Text style={{ color: colors.greyish }}>{stamp}</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row" }}>
                <MaterialCommunityIcons
                    name="pencil"
                    size={30}
                    style={{ color: theme }}
                />
                <MaterialCommunityIcons
                    name="trash-can"
                    size={30}
                    style={{ color: theme, marginLeft: 5 }}
                />
            </View>
        </View>
    );
};
export default function Task(props) {
    return (
        <View style={{
            flex: 1,
            backgroundColor: color.themeColor
        }}>

            <StatusBar barStyle="light-content" backgroundColor={colors.themeColor} />
            <View style={{ backgroundColor: colors.themeColor }}>
                <View
                    style={{
                        padding: 16,
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}
                >
                    <MaterialCommunityIcons
                        name="text"
                        size={30}
                        style={{ color: color.white }}
                    />
                    <View style={{ flexDirection: "row" }}>
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={30}
                            style={{ color: color.white }}
                        />
                        <AntDesing
                            name="user"
                            size={30}
                            style={{ color: color.white }}
                        />

                    </View>
                </View>
                <View style={{ padding: 16 }}>
                    <Text style={{ color: colors.white, fontSize: 30 }}>
                        {"Hello,\nJuan"}
                    </Text>
                    <View style={{
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        backgroundColor: colors.tint,
                        borderRadius: 20,
                        marginVertical: 20, alignItems: "center"

                    }}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={30}
                            style={{ color: color.white }}
                        />
                        <View style={{ flexDirection: "row" }}>
                            <MaterialCommunityIcons
                                name="microphone"
                                size={30}
                                style={{ color: color.white }}
                            />
                            <MaterialCommunityIcons
                                name="tune"
                                size={30}
                                style={{ color: color.white }}
                            />

                        </View>

                    </View>

                </View>
            </View>
            <View
                style={{
                    padding: 20,
                    flexDirection: "row",
                    backgroundColor: colors.background,
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTopLeftRadius: 20
                }}
            >
                <Text style={{ fontSize: 24 }}>Task</Text>
                <MaterialCommunityIcons
                    name="plus"
                    size={40}
                    style={{
                        color: colors.themeColor,
                        backgroundColor: colors.white,
                        borderRadius: 20,
                        marginHorizontal: 8
                    }}
                />

            </View>
            <ScrollView style={{
                backgroundColor: colors.background
            }}>
                {taks.map(task => (<Task
                    task={task.task}
                    icon={task.icon}
                    theme={task.theme}
                    stamp={task.stamp}
                />
                ))}
            </ScrollView>

        </View>
    );
}



