import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';

import axios from 'axios';

import { signUpStyles } from '../styles/screens/signUp';

const SignUp = ({ navigation }) => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [borderColor, setBorderColor] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitSignUp = async () => {
        try {
            setLoading(true);
            let res = await axios.post("https://noseXD.herokuapp.com/signup", {
                name,
                email,
                password
            });
            setLoading(false);
            setTimeout(() => {
                navigation.navigate("SignIn");
            }, 500);
        } catch (e) {
            Alert.alert(e.response.data.error);
        }
    }

    const onFocus = value => {
        setBorderColor(value);
    }

    return (
        <View style={signUpStyles.container}>
            <Text style={signUpStyles.title}>Sign Up</Text>
            <Text style={signUpStyles.subtitle}>Sign Up with Email and Password</Text>
            <View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "name" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="person" size={20} color={borderColor == "name" ? "#3465d9" : "gray"} />
                    <TextInput
                        placeholder="Name"
                        style={[signUpStyles.textInput, {
                            color: borderColor == "name" ? "#3465d9" : "gray"
                        }]}
                        onFocus={() => onFocus("name")}
                        onChangeText={name => setName(name)}
                    />
                </View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "email" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="email" size={20} color={borderColor == "email" ? "#3465d9" : "gray"} />
                    <TextInput
                        placeholder="Email"
                        style={[signUpStyles.textInput, {
                            color: borderColor == "email" ? "#3465d9" : "gray"
                        }]}
                        onFocus={() => onFocus("email")}
                        onChangeText={email => setEmail(email)}
                    />
                </View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "password" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="lock-outline" size={20} color={borderColor == "password" ? "#3465d9" : "gray"} />
                    <TextInput
                        placeholder="Password"
                        style={[signUpStyles.textInput, {
                            color: borderColor == "password" ? "#3465d9" : "gray"
                        }]}
                        secureTextEntry
                        onFocus={() => onFocus("password")}
                        onChangeText={password => setPassword(password)}
                    />
                </View>
            </View>
            {loading ? <ActivityIndicator /> : null}
            <TouchableOpacity onPress={() => submitSignUp()} style={signUpStyles.signIn}>
                <Text style={signUpStyles.textSignIn}>Sign Up</Text>
            </TouchableOpacity>
            <View style={signUpStyles.signUp}>
                <Text style={[signUpStyles.textSignUp, {
                    color: "gray"
                }]}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                    <Text style={[signUpStyles.textSignUp, {
                        color: "#3465d9",
                        marginLeft: 3
                    }]}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default SignUp;