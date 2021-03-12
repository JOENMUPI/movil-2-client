import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Field from '../components/Field';
import Http from '../components/Http';

import { signInStyles } from '../styles/screens/signIn';



const SignIn = ({ navigation }) => {
    const [user, setUser] = useState({ email: '', password: '' });
    const [borderColor, setBorderColor] = useState(null);
    const [loading, setLoading] = useState(false);

    let passInput = '';

    const submitSignIn = async () => { 
        setLoading(true);
        if(!Field.checkFields([ user.email, user.password ])) {
            Alert.alert('Empty Field', 'Please, fill the fields');
            
        } else {
            const data = await Http.send('POST', 'user/singin', user);
        
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');
                
            } else {
                switch(data.typeResponse) {
                    case 'Success':  
                        await AsyncStorage.setItem("user", JSON.stringify(data.body[0]));
                        navigation.navigate('Home', data.body[0]);
                        break;
                
                    case 'Fail':
                        data.body.errors.forEach(element => {
                            ToastAndroid.showWithGravity(
                                element.text,
                                ToastAndroid.SHORT,
                                ToastAndroid.TOP
                            );
                        });
                        break;

                    default:
                        Alert.alert(data.typeResponse, data.message);
                        break;
                }
            }
        }

        setLoading(false);
    }

    const onFocus = value => {
        setBorderColor(value);
    }

    const removeUser = async () => {
        await AsyncStorage.removeItem('user');
    }

    useEffect(async () => {
        removeUser();
    }, []);

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
                        autoCapitalize="none"
                        keyboardType={'email-address'}
                        blurOnSubmit={false}
                        style={[signInStyles.textInput, {
                            color: borderColor == "email" ? "#3465d9" : "gray"
                        }]}
                        autoFocus
                        //onFocus={() => onFocus("email")}
                        onChangeText={email => setUser({ ...user, email: email })}
                        onSubmitEditing={() => passInput.focus()}
                    />
                </View>
                <View style={[signInStyles.section, {
                    borderColor: borderColor == "password" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="lock-outline" size={20} color={borderColor == "password" ? "#3465d9" : "gray"} />
                    <TextInput
                        ref={input => passInput = input}
                        placeholder="Password"
                        autoCapitalize="none"
                        style={[signInStyles.textInput, {
                            color: borderColor == "password" ? "#3465d9" : "gray"
                        }]}
                        secureTextEntry
                        //onFocus={() => onFocus("password")}
                        onChangeText={password => setUser({ ...user, password: password })}
                    />
                </View>
            </View>
            
            <TouchableOpacity onPress={() => submitSignIn()} style={signInStyles.signIn}>
                {
                    (loading) 
                    ? <ActivityIndicator size="small" color="#00ff00" /> 
                    : <Text style={signInStyles.textSignIn}>Sign In</Text>
                }
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