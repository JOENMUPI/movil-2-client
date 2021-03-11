import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { ScrollView } from 'react-native';

const colors = {
    themeColor: '#006aff',
    white: '#fff',
    background: '#f4f6fc',
    greyish: '#a4a4a4',
    tint: '#2b49c3'
}

const tasks = [

    {
        task: "Ser Veneco",
        icon: "hiking",
        theme: "#8a621a",
        stamp: "Today  .  6am"
    },
    {
        task: "Odiar a Irse la luz",
        icon: "chemical-weapon",
        theme: "#fddb00",
        stamp: "Today  .  8am"
    },
    {
        task: "Vivir en Socialismo",
        icon: "hiking",
        theme: "#ff0000",
        stamp: "Today  .  10am"
    },
    {
        task: "Jugar  ",
        icon: "barn",
        theme: "#000000",
        stamp: "Today  .  11am"
    },
    {
        task: "FiveM",
        icon: "car",
        theme: "#ff6d00",
        stamp: "Today  .  3pm"
    },
    {
        task: "Comer",
        icon: "cards-heart",
        theme: "#02a000",
        stamp: "Today  .  8pm"
    },
    {
        task: "Dormir",
        icon: "bed",
        theme: "#02a0ff",
        stamp: "Today  .  11pm"
    },
];

const Task = ({ task, icon, theme, stamp }) => {
    return (
        <View style={{
            backgroundColor: colors.white,
            flexDirection: "row",
            marginHorizontal: 16,
            marginVertical: 4,
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 24,
            allignItems: "center",
            justifyContent: "space-between"
        }}>
            <View style={{ flexDirection: "row" }}>
                <MaterialCommunityIcons
                    name={icon}
                    size={30}
                    style={{ color: theme, marginRight: 5 }} />
                <View>
                    <Text style={{ fontSize: 16 }}>{task}</Text>
                    <Text style={{ fontSize: 16, color: colors.greyish }}>{stamp}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", }}>
                <MaterialCommunityIcons
                    name="pencil"
                    size={30}
                    style={{ color: theme }} />
                <MaterialCommunityIcons
                    name="trash-can"
                    size={30}
                    style={{ color: theme, marginLeft: 10 }} />
            </View>
        </View>
    )
}

export default function Tas() {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <View style={{ paddingTop: 30, paddingLeft: 10, flexDirection: "row", justifyContent: "space-between" }}>

                <MaterialCommunityIcons
                    name="text"
                    size={50}
                    style={{ color: colors.white }} />

                <View style={{ flexDirection: "row", paddingTop: 10, paddingRight: 10 }}>
                    <AntDesign
                        name="user"
                        size={35}
                        style={{ color: colors.white }} />
                </View>

            </View>

            <View style={{ paddingLeft: 16, paddingTop: 5, paddingBottom: 10 }}>
                <Text style={{ color: colors.background, fontSize: 30 }}>
                    {"Hello, Juan"}
                </Text>
            </View>

            <View style={{
                padding: 20,
                flexDirection: "row",
                backgroundColor: colors.background,
                justifyContent: "space-between",
                alignItems: "center",
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20
            }}>
                <Text style={{ fontSize: 24, }}>{"Tasks"} </Text>
                <MaterialCommunityIcons name="plus" size={30} style={{ color: colors.themeColor, backgroundColor: colors.white, borderRadius: 20 }} />
            </View>
            <ScrollView style={{
                backgroundColor: colors.background
            }}>
                {tasks.map(task => (
                    <Task
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.themeColor,
    },
});