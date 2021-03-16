import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, Alert, Button, ScrollView, Modal, Image } from 'react-native';

import { Card, ListItem, Icon, Input, CheckBox, Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
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
    const [dateExp, setDateExp] = useState({ flag: false, data: null });
    const [dateNotification, setDateNotification] = useState({ flag: false, data: null });
    const [task, setTask] = useState(route.params);
    const [newArchive, setNewArchive] = useState(ARCHIVE_BLANK);
    const [newStep, setNewStep] = useState(STEP_BLANK);
    const [modal, setModal] = useState({ type: 'date', flag: false}); 
    const [token, setToken] = useState(null); 



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
                    ? deleteStep(item)
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

    const handleStepCheck = (item) => {      
        let stepAux = steps.map(step => {
            if(step.id == item.id) {
                return { ...step, check: !item.check };
            }

            return step;
        }); 
        
        setSteps(stepAux);
        sendEditStep('check');  
    }

    const handlePicker = (date) => {
        if (dateExp.flag) {
            let dateAux = date;

            dateAux.setDate(dateAux.getDate() - 1);
            setDateExp({ data: date, flag: false });  
            updateField('date', date); 
            schedulePushNotification(
                "📬We don't have any more time!",
                `${route.params.tittle}: There is little left until this task expires!`,
                dateAux
            );
        
        } else {
            setDateNotification({ data: date, flag: false });
            updateField('notification', date);
            schedulePushNotification(
                '📬Notification!',
                `the task ${route.params.tittle} requires your attention.`, 
                date
            );
        }
    }

    const handleCancelPiker =() => {
        (dateExp.flag) 
        ? setDateExp({ ...dateExp, flag: false })
        : setDateNotification({ ...dateExp, flag: false })
    }

    const handlePriority = () => {
        updateField('priority', !task.priority);
        setTask({ ...task, priority: !task.priority });
    }

    const handleCheck = () => {
        updateField('check', !task.check);
        setTask({ ...task, check: !task.check })
    }

    const handleNoteUpdate = () => {
        updateField('note', note.note)
        setNote({ ...note, flag: false });
    }

    const schedulePushNotification = async (title, body, trigger) => {
        await Notifications.scheduleNotificationAsync({
            content: { title, body}, 
            trigger,
        });
    }

    const handlePushNotifications = async () => { 
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus; 
        let token = '';
    
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
    
        token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
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

    const alertForDeleteTask = () => {
        Alert.alert(
            "Delete",
            `Are you sure delete ${route.params.tittle}`,
            [
                { text: "Cancel", style: "cancel" }, 
                { text: "OK", onPress: () => deleteTask() }
    
            ], { cancelable: false }
        );
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
    const deleteTask = async () => {
        const data = await Http.send('DELETE', `task/${route.params.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    navigation.goBack();
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

    const updateField = async (type, field) => { 
        const jsonAux = { type, id: route.params.id, field };
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
        let aux = [];

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    aux = data.body; 
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

        return aux;
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
        let aux;

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    aux = data.body; 
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
        
        return aux;
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
        getSteps().then(res => setSteps(res));
        getArchives().then(res => setArchives(res));
        handlePushNotifications().then(res => setToken(res));
    }, []);

    const TextC = ({ txt1, txt2 }) => {
        return (
            <View >
                <Text style={{ color: 'gray' }}>{txt1}</Text>
                <Text style={{ color: 'gray' }}>{txt2}</Text>
            </View>
        )
    } 
    
    return (
        <View style={{ paddingTop: 24, flex:1  }}>
            <DateTimePickerModal
                isVisible={dateExp.flag || dateNotification.flag}
                mode="datetime"
                onConfirm={handlePicker}
                onCancel={handleCancelPiker}
            />
            <Modal
                animationType="slide"
                transparent
                visible={modal}
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
            <View style={{ 
                    paddingTop: 24, 
                    paddingLeft: 16, 
                    paddingBottom: 10,  
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    alignItems: 'center'
                }}
                >
                <CheckBox
                    checked={task.check}
                    onPress={handleCheck}
                />   
                <Text style={{ color: 'gray', fontSize: 30 }}>
                    {route.params.tittle}
                </Text>
                <CheckBox
                    checkedIcon={<Icon name='star' color='gold' type='ionicon' size={30}/>}
                    uncheckedIcon={<Icon name='star-outline' color='grey' type='ionicon' size={30}/>}
                    checked={task.priority}
                    onPress={() => handlePriority()}
                />
            </View>  
            <ScrollView>
                <Card>
                    {
                        steps.map(item => (
                            <ListItem key={item.id} bottomDivider style={{ justifyContent: 'space-between' }}>
                                <CheckBox
                                    checked={item.check}
                                    onPressIn={() => setNewStep({ ...item, check: !item.check })}
                                    onPress={() => handleStepCheck(item)}
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
                <ListItem key={2} bottomDivider>
                        <ListItem.Content>
                            <TouchableOpacity
                                style={{ flexDirection: "row", justifyContent: "space-between" }}
                                onPress={() => setDateNotification({ ...dateNotification, flag: true })}
                                >
                                <View style={{  flexDirection: "row", alignItems: "center", }}>
                                    <Icon 
                                        name='notifications-outline' 
                                        color='gray' 
                                        type='ionicon' 
                                        size={20}
                                        
                                    />
                                    <Text style={{ paddingLeft: 5 }}>
                                        Remember me
                                    </Text>
                                </View>       
                            </TouchableOpacity>
                        </ListItem.Content>                        
                        {
                            (dateNotification.data != null)
                            ? <TextC
                                txt1={dateNotification.data.toString().split(' ').splice(1,3).join('-')}
                                txt2={dateNotification.data.toString().split(' ')[4]}
                            /> 
                            : (route.params.dateNotification != null) 
                            ? <TextC 
                                txt1={route.params.dateNotification.toString().split('T')[0]}
                                txt2={route.params.dateNotification.toString().split('T')[1].split('.')[0]}
                            />
                            : <Text style={{ color: 'gray' }}>...</Text>
                        } 
                        <Icon 
                            name='chevron-forward-outline' 
                            color='gray' 
                            type='ionicon' 
                            size={20}  
                        />
                    </ListItem>
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
                        {
                            (dateExp.data != null)
                            ? 
                            <TextC
                                txt1={dateExp.data.toString().split(' ').splice(1,3).join('-')}
                                txt2={dateExp.data.toString().split(' ')[4]}
                            /> 
                            : (route.params.dateExpiration != null) 
                            ? <TextC 
                                txt1={route.params.dateExpiration.toString().split('T')[0]}
                                txt2={route.params.dateExpiration.toString().split('T')[1].split('.')[0]}
                            />
                            : <Text style={{ color: 'gray' }}>...</Text>
                        } 
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
                    onEndEditing={handleNoteUpdate} 
                />
                </Card>
            </ScrollView>
            <View style={{ 
                    paddingTop: 10, 
                    paddingLeft: 16, 
                    paddingRight: 26,
                    paddingBottom: 5,   
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    alignItems: 'center'
                }}
                > 
                <Text style={{ color: 'gray', fontSize: 20 }}>
                    Task created: 
                    {
                        (route.params.dateCreate)
                        ? route.params.dateCreate.toString().split('T')[0]
                        : 'now'
                    }
                </Text>
                <Icon 
                    name='trash-outline' 
                    color='gray' 
                    type='ionicon' 
                    size={20}
                    onPress={alertForDeleteTask}        
                />
            </View>
        </View>
    )
}


export default TaskDetail;