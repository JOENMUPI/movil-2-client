import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, Alert, Button, ScrollView, Modal, Image } from 'react-native';

import { Card, ListItem, Icon, Input, CheckBox, Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

import Field from '../components/Field';
import Http from '../components/Http';

import { homeStyles } from '../styles/screens/home';


const STEP_BLANK = { description: '', id: 0, check: false }
const ARCHIVE_BLANK = { id: 0, data: { } };


const TaskDetail = ({ navigation, route }) => {
    const [steps, setSteps] = useState([]);
    const [archives, setArchives] = useState([]);
    const [note, setNote] = useState({ flag: false, note: route.params.note });
    const [hourExp, setHourExp] = useState({ flag: false, data: route.params.hourExpiration });
    const [dateExp, setDateExp] = useState({ flag: false, data: route.params.dateExpiration });
    const [newArchive, setNewArchive] = useState(ARCHIVE_BLANK);
    const [newStep, setNewStep] = useState(STEP_BLANK);
    const [modal, setModal] = useState({ type: 'date', flag: false});


    // Utilties
    const toast = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const alertForDelete = (item, type) => {
        Alert.alert(
            "Delete",
            `Are you sure delete ${(type == 'step') ? item.description : item.data.tittle}`,
            [
                { text: "Cancel", style: "cancel" }, 
                { text: "OK", onPress: () => { 
                    (type == 'step')
                    ? deleteStep(Item)
                    : deleteArchives(item); 
                }}
    
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

    const handleDateExp = (date) => { 
        setDateExp({ data: date, flag: false });
        updateDateExpiration(date); 
    }

    const handleTimeExp = (date) => { 
        setHourExp({ data: date, flag: false });
        updateHourExpiration(date);
    }

    const openImagePickerAsync = async () => {  
            let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if(permission.status != 'granted') {
                Alert.alert(
                'Error', 
                'Sorry, we need camera roll permissions to make this work!',
                { cancelable: false }
            );
            return;

        }  else {
            let imgResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            }); 

            if(imgResult.cancelled == true) {
                return;

            } else { 
                let aux = imgResult.uri.split('/');
                
                aux = aux[aux.length - 1].split('.'); 
                imgResult = { ...imgResult, tittle: aux[0], format: aux[1] }
                addArchive({ data: imgResult, id: 0 });
            } 
        }
    }

    const basicHandlerResponse = (data) => {
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


    // Logic
    const updateNote = async () => { 
        const jsonAux = { type: 'note', id: route.params.id, field: note.note };
        const data = await Http.send('PUT', 'task/field', jsonAux);

        (!data) 
        ? Alert.alert('Fatal Error', 'No data from server...')
        : basicHandlerResponse(data);

        setNote({ ...note, flag: false })
    }

    const updateDateExpiration = async (date) => { 
        const jsonAux = { type: 'date', id: route.params.id, field: date };
        const data = await Http.send('PUT', 'task/field', jsonAux);

        (!data) 
        ? Alert.alert('Fatal Error', 'No data from server...')
        : basicHandlerResponse(data);
    }

    const updateHourExpiration = async (time) => { 
        const jsonAux = { type: 'time', id: route.params.id, field: time };
        const data = await Http.send('PUT', 'task/field', jsonAux);

        (!data) 
        ? Alert.alert('Fatal Error', 'No data from server...')
        : basicHandlerResponse(data);
    }


    // Step Logic
    const sendEditStep = async (type) => {
        const data = await Http.send('PUT', 'step', { ...newStep, type });

        (!data) 
        ? Alert.alert('Fatal Error', 'No data from server...')
        : basicHandlerResponse(data);
        
        setNewStep(STEP_BLANK);
    }

    const addStep = async () => {
        if(!Field.checkFields([ newStep.description ])) {
            Alert.alert('Empty Field', 'Please, write a tittle');
        
        } else { 
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


    // Archives logic
    const getArchives = async() => {
        const id = route.params.id;
        const data = await Http.send('GET', `archive/task/${id}`, null);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    setArchives(data.body); 
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

    const addArchive = async (archive) => { 
        if(!Field.checkFields([ archive.data.type, archive.data.format, archive.data.tittle ])) {
            Alert.alert('Empty Field', 'Mayday');
        
        } else { 
            const data = await Http.send('POST', 'archive', { data: archive.data, taskId: route.params.id });
         
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        let newArchiveAux = { ...archive, id: data.body.id }
 
                        setArchives([ ...archives, newArchiveAux]); 
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
    }

    const deleteArchives = async (archiveItem) => {
        const data = await Http.send('DELETE', `archive/${archiveItem.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    let archivesAux = archives.filter(i => i.id != archiveItem.id);
                    
                    toast(data.message);
                    setArchives(archivesAux);
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
        getArchives();
    }, []); 


    return (
        <View style={{ paddingTop: 24, flex:1  }}>
        <View>
            <Button title="Show Date Picker" onPress={() => setDateExp({ ...dateExp, flag: true })} />
            <DateTimePickerModal
                isVisible={dateExp.flag}
                mode="date"
                onConfirm={handleDateExp}
                onCancel={() => setDateExp({ ...dateExp, flag: false })}
            />
        </View>
        <View>
            <Button title="Show time Picker" onPress={() => setHourExp({ ...hourExp, flag: true })} />
            <DateTimePickerModal
                isVisible={hourExp.flag}
                mode="time"
                onConfirm={handleTimeExp}
                onCancel={() => setHourExp({ ...hourExp, flag: false })}
            />
        </View>

            <Modal
                animationType="slide"
                transparent
                visible={modal.flag}
                onRequestClose={() => setModal(false)}
                >
                <TouchableOpacity
                    style={homeStyles.centeredView} 
                    onPress={() => setModal(false)}
                    >
                    <View style={homeStyles.modalView}>
                    <Image 
                        source={{ uri: newArchive.data.uri }} 
                        style={{ width: 300, height: 300 }} 
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView>
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
                                    size={20}
                                    onPress={() => alertForDelete(item, 'step')}
                                />
                            </ListItem>
                        ))
                    }
                    <Input
                        placeholder='New step'
                        rightIcon={{ type: 'ionicon', name: 'chevron-forward-outline', color: 'gray', size: 20 }}
                        leftIcon={{ type: 'ionicon', name: 'reader-outline', color: 'gray', size: 20 }}
                        onFocus={()=> setNewStep(STEP_BLANK)}
                        onChangeText={text => setNewStep({...newStep, description: text})}
                        onEndEditing={() => addStep()}
                        value={newStep.description}
                    />
                </Card>
                <Card>
                    {
                        archives.map(item => (
                            <ListItem key={item.id} bottomDivider style={{ paddingBottom: 20, justifyContent: 'space-between' }}>
                                <View style={{ borderRadius: 10, backgroundColor: 'grey' }}>
                                    <Avatar
                                        size="small"
                                        title={item.data.format}
                                        activeOpacity={0.7}
                                    />
                                </View>
                                
                                <ListItem.Content>
                                    <TouchableOpacity
                                        onPressIn={() => setNewArchive(item)}
                                        onPress={() => setModal(true)}
                                        >
                                        <Text>
                                            {item.data.tittle}
                                        </Text>
                                    </TouchableOpacity> 
                                </ListItem.Content>
                                <Icon 
                                    name='close-outline' 
                                    color='gray' 
                                    type='ionicon' 
                                    size={20}
                                    onPress={() => alertForDelete(item, 'image')}
                                />
                            </ListItem>
                        ))
                    }
                    <TouchableOpacity 
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                        onPress={() => openImagePickerAsync()}
                        >
                        <View style={{  flexDirection: "row", alignItems: "center", }}>
                            <Icon 
                                name='attach-outline' 
                                color='gray' 
                                type='ionicon' 
                                size={20}        
                            />
                            <Text>
                                Add archives
                            </Text>
                        </View>     
                        <Icon 
                            name='chevron-forward-outline' 
                            color='gray' 
                            type='ionicon' 
                            size={20}
                            
                        />
                    </TouchableOpacity>
                </Card> 
                <Card>
                    <ListItem key={0} bottomDivider>
                        <ListItem.Content>
                            <TouchableOpacity
                                style={{ flexDirection: "row", justifyContent: "space-between" }}
                                onPress={() => setDateExp({ ...dateExp, flag: true })}
                                >
                                <View style={{  flexDirection: "row", alignItems: "center", }}>
                                    <Icon 
                                        name='calendar-outline' 
                                        color='gray' 
                                        type='ionicon' 
                                        size={20}
                                        
                                    />
                                    <Text style={{ paddingLeft: 5 }}>
                                        Expiration date
                                    </Text>
                                </View>
                                
                                
                            </TouchableOpacity>
                        </ListItem.Content>    
                        <Text style={{ paddingLeft: 5 }}>
                                {
                                    (dateExp.data != null)
                                    ? dateExp.data.toString().split(' ').splice(1,3).join('-')
                                    : null
                                }
                            </Text>
                        <Icon 
                            name='chevron-forward-outline' 
                            color='gray' 
                            type='ionicon' 
                            size={20}
                        />
                    </ListItem>
                    <ListItem key={1} bottomDivider>
                        <ListItem.Content>
                            <TouchableOpacity
                                style={{ flexDirection: "row", justifyContent: "space-between" }}
                                onPress={() => setHourExp({ ...hourExp, flag: true })}
                                >
                                <View style={{  flexDirection: "row", alignItems: "center", }}>
                                    <Icon 
                                        name='alarm-outline' 
                                        color='gray' 
                                        type='ionicon' 
                                        size={20}
                                        
                                    />
                                    <Text style={{ paddingLeft: 5 }}>
                                        Expiration hour
                                    </Text>
                                </View>       
                            </TouchableOpacity>
                        </ListItem.Content>
                        <Text style={{ paddingLeft: 5 }}>
                            {
                                (hourExp.data != null)
                                ? hourExp.data.toString().split(' ')[4]
                                : null
                            }
                        </Text>    
                        <Icon 
                            name='chevron-forward-outline' 
                            color='gray' 
                            type='ionicon' 
                            size={20}  
                        />
                    </ListItem>
                </Card>
                <Card>
                {
                    (!note.flag) 
                    ? null 
                    : <TouchableOpacity
                        style={{ backgroundColor: '#1e90ff', alignItems: 'center', borderRadius: 5, padding: 15  }}
                        onPressIn={() => updateNote()} 
                        onPress={() =>  setNote({ ...note, flag: false })}
                        >
                        <Text style={{ color: 'white' }}>
                            Finish editing
                        </Text>
                    </TouchableOpacity>    
                }
                <TextInput
                    placeholder={'Add note!'}
                    multiline
                    numberOfLines={3}
                    value={note.note}
                    onFocus={() => setNote({ ...note, flag: true })}
                    onChangeText={(text) => setNote({ ...note, note: text })}    
                />
                </Card>
            </ScrollView>
        </View>
    )
}


export default TaskDetail;