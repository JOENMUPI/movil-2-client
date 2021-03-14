import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';

import { Card, ListItem, Button, Icon, Input, CheckBox } from 'react-native-elements'

import Field from '../components/Field';
import Http from '../components/Http';


const STEP_BLANK = { description: '', id: 0, check: false }


const TaskDetail = ({ navigation, route }) => {
    const [steps, setSteps] = useState([ ]);
    const [newStep, setNewStep] = useState(STEP_BLANK);
    const [loading, setLoading] = useState(false);

    const toast = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const alertForDelete = (stepItem) => {
        Alert.alert(
            "Delete",
            `Are you sure delete ${stepItem.description}`,
            [
                { text: "Cancel", style: "cancel" }, 
                { text: "OK", onPress: () => deleteStep(stepItem) }
    
            ], { cancelable: false }
        );
    } 

    const editStep = (item) => { 
        if(Field.checkFields([ newStep.description ])) {
            let stepsAux = steps.map(step => {
                if(step.id == item.id) {
                    return newStep;
                }
                
                return step;
            });
    
            setSteps(stepsAux);
            sendEditStep('description');
        } 
    }

    const handlerCheck = (item) => {      
        let stepAux = steps.map(step => {
            if(step.id == item.id) {
                return { ...step, check: !item.check };
            }

            return step;
        }); 
        
        setSteps(stepAux);
        sendEditStep('check');  
    }

    const sendEditStep = async (type) => {
        const data = await Http.send('PUT', 'step', { ...newStep, type });

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) { 
                case 'Success': 
                    toast(data.message); 
                    break;
            
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    break;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    break;
            }
        }

        setNewStep(STEP_BLANK);
    }

    const addStep = async () => {
        if(!Field.checkFields([ newStep.description ])) {
            Alert.alert('Empty Field', 'Please, write a tittle');
        
        } else { 
            setLoading(true);
            const data = await Http.send('POST', 'step', { ...newStep, taskId: route.params.id });
         
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        let newStepAux = { ...newStep, id: data.body.id }
 
                        setSteps([ ...steps, newStepAux]); 
                        setNewStep(STEP_BLANK);
                        break;
                
                    case 'Fail':
                        data.body.errors.forEach(element => {
                            toast(element.text);
                        });
                        break;

                    default:
                        Alert.alert(data.typeResponse, data.message);
                        break;
                }
            }

            setLoading(false);
        }
    }

    const getSteps = async() => {
        const id = route.params.id;
        const data = await Http.send('GET', `step/task/${id}`, null);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    setSteps(data.body); 
                    break;
            
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    break;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    break;
            }
        } 
    }

    const deleteStep = async (stepItem) => {
        const data = await Http.send('DELETE', `step/${stepItem.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    let stepsAux = steps.filter(i => i.id != stepItem.id);
                    
                    toast(data.message);
                    setSteps(stepsAux);
                    break;
            
                case 'Fail':
                    data.body.errors.forEach(element => {
                        toast(element.text);
                    });
                    break;

                default:
                    Alert.alert(data.typeResponse, data.message);
                    break;
            }
        }
    }

    // Ggwp
    useEffect(() => {
        getSteps();
    }, []);



    return (
        <View style={{ paddingTop: 24, flex:1  }}>
            <ScrollView>
                <Card>
                    <TouchableOpacity onPress={() => console.log('holis')}>
                        <Card.Title>HELLO WORLD</Card.Title>
                    </TouchableOpacity>
                    <Card.Divider/>
                    <Text style={{marginBottom: 10}}>
                        The idea with React Native Elements is more about component structure than actual design.
                    </Text>
                    <Card.Image source={require('../../assets/logito.png')}>
                    <Icon name='arrow-forward-outline' color='gray' type='ionicon' size={26}/>
                           
                        <Button
                            icon={<Icon name='code' color='#ffffff' />}
                            buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                            title='VIEW NOW' 
                        />
                    </Card.Image>
                </Card>

                <Card>
                    {
                        steps.map(item => (
                            <ListItem key={item.id} bottomDivider style={{ justifyContent: 'space-between' }}>
                                <CheckBox
                                    checked={item.check}
                                    onPressIn={() => setNewStep({ ...item, check: !item.check })}
                                    onPress={() => handlerCheck(item)}
                                />
                                <ListItem.Content >
                                    <TextInput
                                        placeholder={item.description}
                                        onFocus= {() => setNewStep(item)}
                                        onChangeText={text => setNewStep({...newStep, description: text})}
                                        onEndEditing={() => editStep(item)}
                                    /> 
                                </ListItem.Content>
                                <Icon 
                                    name='close-outline' 
                                    color='gray' 
                                    type='ionicon' 
                                    size={30}
                                    onPress={() => alertForDelete(item)}
                                />
                            </ListItem>
                        ))
                    }
                    <Input
                        placeholder='New step'
                        rightIcon={{ type: 'ionicon', name: 'chevron-forward-outline', color: 'gray' }}
                        leftIcon={{ type: 'ionicon', name: 'reader-outline', color: 'gray' }}
                        onFocus={()=> setNewStep(STEP_BLANK)}
                        onChangeText={text => setNewStep({...newStep, description: text})}
                        onEndEditing={() => addStep()}
                        value={newStep.description}
                    />
                </Card>
            </ScrollView>
        </View>
    )
}

export default TaskDetail;