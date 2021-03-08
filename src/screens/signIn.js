import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import axios from 'axios';

import { signInStyles } from '../styles/screens/signIn';

const SignIn = ({ navigation }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [borderColor, setBorderColor] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitSignIn = async () => {
        try {
            setLoading(true);
            let res = await axios.post("https://noseXd.herokuapp.com/signin", {
                email,
                password
            });
            setLoading(false);
            await AsyncStorage.setItem("token", res.data.token);
            setTimeout(() => {
                navigation.navigate("Dashboard");
            }, 500);
        } catch (e) {
            Alert.alert(e.response.data.error);
        }
    }

    const onFocus = value => {
        setBorderColor(value);
    }

    return (
        <View style={signInStyles.container}>
            <Text style={signInStyles.title}>Sign In</Text>
            <Text style={signInStyles.subtitle}>Sign In with Email and Password</Text>
            <View>
                <View style={[signInStyles.section, {
                    borderColor: borderColor == "email" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="email" size={20} color={borderColor == "email" ? "#3465d9" : "gray"} />
                    <TextInput
                        placeholder="Email"
                        style={[signInStyles.textInput, {
                            color: borderColor == "email" ? "#3465d9" : "gray"
                        }]}
                        onFocus={() => onFocus("email")}
                        onChangeText={email => setEmail(email)}
                    />
                </View>
                <View style={[signInStyles.section, {
                    borderColor: borderColor == "password" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="lock-outline" size={20} color={borderColor == "password" ? "#3465d9" : "gray"} />
                    <TextInput
                        placeholder="Password"
                        style={[signInStyles.textInput, {
                            color: borderColor == "password" ? "#3465d9" : "gray"
                        }]}
                        secureTextEntry
                        onFocus={() => onFocus("password")}
                        onChangeText={password => setPassword(password)}
                    />
                </View>
            </View>
            {loading ? <ActivityIndicator /> : null}
            <TouchableOpacity onPress={() => submitSignIn()} style={signInStyles.signIn}>
                <Text style={signInStyles.textSignIn}>Sign In</Text>
            </TouchableOpacity>
            <View style={signInStyles.signUp}>
                <Text style={[signInStyles.textSignUp, {
                    color: "gray"
                }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                    <Text style={[signInStyles.textSignUp, {
                        color: "#3465d9",
                        marginLeft: 3
                    }]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SignIn;