import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {  
    handlePushNotifications();
  }, []);

  const handlePushNotifications = async () => { 
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus; 

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }

    if (Platform.OS == 'android') {
        Notifications.setNotificationChannelAsync(
            'default', 
            {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            }
        );
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    (token) 
    ? setExpoPushToken(token) 
    : alert('No token!');
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification(new Date());
        }}
      />
      <Button
        title="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx"
        onPress={async () => { await x(); }}
      />
    </View>
  );
}

const x = async () => {
    const dateString = "21/01/2021"; // Jan 21
console.log('_____________________');
console.log(new Date());
    const trigger = new Date(); console.log('arriba', trigger);
    //trigger.setMinutes(0);
    trigger.setSeconds(trigger.getSeconds()+5);
    console.log('segundos', trigger.getSeconds() +2 );
    console.log('hora', trigger.getTime() );
    
    console.log('abajo', trigger);

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Happy new hour!',
        },
        trigger,
    });
 }

const schedulePushNotification = async (tittle, body, trigger) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "📬We don't have any more time!",
            body: 'There is little left until this task expires!'
        }, 
        trigger,
    });
}































/*import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import * as Notifications from 'expo-notifications';


export default function Basic() {
    const [data, setData] = useState();

    const test = async() => {
        let experienceId = '@username/example';
        const expoPushToken = await Notifications.getExpoPushTokenAsync({ experienceId });
        console.log('??????', expoPushToken)
        // Prepare the notification channel
        Notifications.setNotificationChannelAsync('new-emails', {
            name: 'E-mail notifications',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'email-sound.wav', // <- for Android 8.0+, see channelId property below
        });
        
        // Eg. schedule the notification
        Notifications.scheduleNotificationAsync({
            content: {
            title: "You've got mail! 📬",
            body: 'Open the notification to read them all',
            sound: 'email-sound.wav', // <- for Android below 8.0
            },
            trigger: {
            seconds: 2,
            channelId: 'new-emails', // <- for Android 8.0+, see definition above
            },
        });
    }
    
    test();
    
    return (
        <View style={styles.container}>
            <Text>holis</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#212121',
        flex: 1,
    },

    item: {
        height: 60,
        backgroundColor: 'gray',
        marginTop: 10,
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    row: {
        backgroundColor: 'black',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        
    },

    backRow: {
        flexDirection: 'row',
        borderRadius: 20,
        marginHorizontal: 10,
        marginTop: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    text: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 32,
    },

    underlayRight: {
        flex: 1,
        backgroundColor: 'yellow',
        justifyContent: 'flex-start',
    },
    
    underlayLeft: {
        flex: 1,
        backgroundColor: 'tomato',
        justifyContent: 'flex-end',
    },
})*/