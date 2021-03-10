import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';

import { profileStyles } from '../styles/screens/profile';

const Profile = ({ navigation }) => {

    const [loading, setLoading] = useState(false);

    const signOut = async () => {
        try {
            setLoading(true);
            await AsyncStorage.removeItem('token');
            setLoading(false);
            setTimeout(() => {
                navigation.navigate("SignIn");
            }, 500);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <View style={profileStyles.container}>
            <View>
                {loading ? <ActivityIndicator /> : null}
                <Button color="blue" mode="contained" onPress={() => signOut()}>
                    Sign Out
                </Button>
            </View>
        </View>
    )
}

export default Profile;