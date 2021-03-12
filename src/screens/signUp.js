import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Field from '../components/Field';
import Http from '../components/Http';

import { signUpStyles } from '../styles/screens/signUp';

const SignUp = ({ navigation }) => {
    const [user, setUser] = useState({ email: '', password: '', name: '', confirmPassword: '' });
    const [borderColor, setBorderColor] = useState(null);
    const [loading, setLoading] = useState(false);
    
    let passInput = '';
    let pass2Input = '';
    let emailInput = '';
    
    const submitSignUp = async () => {
        setLoading(true); 
        if(!Field.checkFields([ user.email, user.password, user.name, user.confirmPassword ])) {
            Alert.alert('Empty Field', 'Please, fill the fields');

        } else { 
            const data = await Http.send('POST', 'user/singup', user);

        
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');
                
            } else { 
                switch(data.typeResponse) { 
                    case 'Success':  
                        await AsyncStorage.setItem("user", JSON.stringify({ email: user.email, name: user.name, id: data.body.id }));
                        navigation.navigate('Home', { email: user.email, name: user.name, id: data.body.id });
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
                        blurOnSubmit={false}
                        style={[signUpStyles.textInput, {
                            color: borderColor == "name" ? "#3465d9" : "gray"
                        }]}
                        autoFocus
                        //onFocus={(x) => onFocus("name")}
                        onChangeText={name => setUser({ ...user, name: name })}
                        onSubmitEditing={() => emailInput.focus()}
                    />
                </View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "email" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="email" size={20} color={borderColor == "email" ? "#3465d9" : "gray"} />
                    <TextInput
                        ref={input => emailInput = input}
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType={'email-address'}
                        blurOnSubmit={false}
                        style={[signUpStyles.textInput, {
                            color: borderColor == "email" ? "#3465d9" : "gray"
                        }]}
                        //onFocus={() => onFocus("email")}
                        onChangeText={email => setUser({ ...user, email: email })}
                        onSubmitEditing={() => passInput.focus()}
                    />
                </View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "password" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="lock-outline" size={20} color={borderColor == "password" ? "#3465d9" : "gray"} />
                    <TextInput
                        ref={input => passInput = input}
                        placeholder="Password"
                        autoCapitalize="none"
                        blurOnSubmit={false}
                        style={[signUpStyles.textInput, {
                            color: borderColor == "password" ? "#3465d9" : "gray"
                        }]}
                        secureTextEntry
                        //onFocus={() => onFocus("password")}
                        onChangeText={password => setUser({ ...user, password: password })}
                        onSubmitEditing={() => pass2Input.focus()}
                    />
                </View>
                <View style={[signUpStyles.section, {
                    borderColor: borderColor == "confirmPassword" ? "#3465d9" : "gray"
                }]}>
                    <MaterialIcons name="lock-outline" size={20} color={borderColor == "confirmPassword" ? "#3465d9" : "gray"} />
                    <TextInput
                        ref={input => pass2Input = input}
                        placeholder="Confirm Password"
                        autoCapitalize="none"
                        blurOnSubmit={false}
                        style={[signUpStyles.textInput, {
                            color: borderColor == "confirmPassword" ? "#3465d9" : "gray"
                        }]}
                        secureTextEntry
                        //onFocus={() => onFocus("confirmPassword")}
                        onChangeText={password => setUser({ ...user, confirmPassword: password })}
                        onSubmitEditing={() => submitSignUp()}
                    />
                </View>
            </View>
            
            <TouchableOpacity onPress={() => submitSignUp()} style={signUpStyles.signIn}>
                {
                    (loading) 
                    ? <ActivityIndicator size="small" color="#00ff00" /> 
                    : <Text style={signUpStyles.textSignIn}>Sign Up</Text>
                }
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