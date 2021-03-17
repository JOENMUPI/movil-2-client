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


const TaskDetail = ({ route }) => { 
    const [note, setNote] = useState({ flag: false, note: route.params.item.note });
    const [dateExp, setDateExp] = useState({ flag: false, data: null });
    const [dateNotification, setDateNotification] = useState({ flag: false, data: null });
    const [task, setTask] = useState(route.params.item);
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
            const stepsAux = task.steps.map(step => {
                if(step.id == item.id) {
                    return newStep;
                }
                
                return step;
            });

            const taskAux = { ...task, steps: stepsAux }

            route.params.callback(taskAux, 'update');
            setTask(taskAux);
            sendEditStep('description');
        } 
    }

    const handleStepCheck = (item) => {   
        const stepAux = task.steps.map(step => {
            if(step.id == item.id) {
                return newStep;
            }

            return step;
        });

        const taskAux = { ...task, steps: stepAux } 
        
        route.params.callback(taskAux, 'update');
        setTask(taskAux);
        sendEditStep('check');  
    }

    const handlePicker = (date) => {
        if (dateExp.flag) {
            let dateAux = date;

            dateAux.setDate(date.getDate() - 1);
            route.params.callback({ ...task, dateExpiration: date }, 'update');
            setDateExp({ data: date, flag: false });  
            updateField('date', date); 
            schedulePushNotification(
                "📬We don't have any more time!",
                `${route.params.item.tittle}: There is little left until this task expires!`,
                dateAux
            );
        
        } else { 
            route.params.callback({ ...task, dateNotification: date }, 'update');
            setDateNotification({ data: date, flag: false });
            updateField('notification', date);
            schedulePushNotification(
                '📬Notification!',
                `the task ${route.params.item.tittle} requires your attention.`, 
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
        const newData  = { ...task, priority: !task.priority }

        route.params.callback(newData, 'update');
        updateField('priority', !task.priority);
        setTask(newData);
    }

    const handleCheck = () => {
        const newData = { ...task, check: !task.check }
        
        route.params.callback(newData, 'update');
        updateField('check', !task.check);
        setTask(newData);
    }

    const handleNoteUpdate = () => {
        route.params.callback({  ...task, note: note.note }, 'update');
        updateField('note', note.note);
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
    const updateField = async (type, field) => { 
        const jsonAux = { type, id: route.params.item.id, field };
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
            const data = await Http.send('POST', 'step', { ...newStep, taskId: route.params.item.id });
         
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        const newStepAux = { ...newStep, id: data.body.id }
                        let stepAux = task.steps;
                        
                        stepAux.push(newStepAux);
                        const taskAux = { ...task, steps: stepAux }
                        
                        route.params.callback(taskAux);
                        setTask(taskAux);
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

    const deleteStep = async (stepItem) => {
        const data = await Http.send('DELETE', `step/${stepItem.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);    
                    const stepsAux = task.steps.filter(i => i.id != stepItem.id);
                    const taskAux = { ...task, steps: stepsAux }

                    route.params.callback(taskAux);
                    setTask(taskAux);
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
    const addArchive = async (archive) => { 
        if(!Field.checkFields([ archive.data.type, archive.data.format, archive.data.tittle ])) {
            Alert.alert('Empty Field', 'Mayday');
        
        } else { 
            const data = await Http.send('POST', 'archive', { data: archive.data, taskId: route.params.item.id });
         
            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        const newArchiveAux = { ...archive, id: data.body.id }
                        let archivesAux = task.archives;
             
                        archivesAux.push(newArchiveAux);
                        const taskAux = { ...task, archives: archivesAux }

                        route.params.callback(taskAux, 'update');
                        setTask(taskAux);
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
                    toast(data.message);    
                    const archivesAux = task.archives.filter(i => i.id != archiveItem.id);
                    const taskAux = { ...task, archives: archivesAux }
                    
                    route.params.callback(taskAux, 'update');
                    setTask(taskAux);
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
        handlePushNotifications().then(res => setToken(res));
    }, []);

    const TextC2 = ({ data1, data2 }) => {
        let data2Aux = [ '...', '...' ];

        if(data2 != null) { 
            if(data2.toString().indexOf('Z') != -1) {
                data2Aux[0] = data2.toString().split('T')[0];
                data2Aux[1] = data2.toString().split('T')[1].split('.')[0];
            
            } else {
                data2Aux[0] = data2.toString().split(' ').splice(1,3).join('-');
                data2Aux[1] = data2.toString().split(' ')[4];
            }
        }

        return (   
            <View>
                {
                    (data1 != null)
                    ? <View >
                        <Text style={{ color: 'gray' }}>{data1.toString().split(' ').splice(1,3).join('-')}</Text>
                        <Text style={{ color: 'gray' }}>{data1.toString().split(' ')[4]}</Text>
                    </View>
                    : <View >
                        <Text style={{ color: 'gray' }}>{data2Aux[0]}</Text>
                        <Text style={{ color: 'gray' }}>{data2Aux[1]}</Text>
                    </View>
                }
            </View>
        )
    }

    const CardArchiveC = () => (
        <Card>
            {
                task.archives.map(item => (
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
    )

    const CardDatesC = () => (
        <Card>
            <ListItem 
                key={2} 
                bottomDivider
                onPress={() => setDateNotification({ ...dateNotification, flag: true })} 
                >
                <ListItem.Content>
                    <View
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                        >
                        <View style={{  flexDirection: "row", alignItems: "center", }}>
                            <Icon 
                                name='notifications-outline' 
                                color='gray' 
                                type='ionicon' 
                                size={20}
                                
                            />
                            <Text style={{ paddingLeft: 5, color: 'gray' }}>
                                Remember me
                            </Text>
                        </View>       
                    </View>
                </ListItem.Content>  
                <TextC2
                    data1={dateNotification.data}
                    data2={route.params.item.dateNotification}
                />
                <Icon 
                    name='chevron-forward-outline' 
                    color='gray' 
                    type='ionicon' 
                    size={20}  
                />
            </ListItem>
            <ListItem 
                key={0} 
                bottomDivider
                onPress={() => setDateExp({ ...dateExp, flag: true })}
                >
                <ListItem.Content>
                    <View
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                        >
                        <View style={{  flexDirection: "row", alignItems: "center", }}>
                            <Icon 
                                name='calendar-outline' 
                                color='gray' 
                                type='ionicon' 
                                size={20}
                                
                            />
                            <Text style={{ paddingLeft: 5, color: 'gray' }}>
                                Expiration date
                            </Text>
                        </View>
                    </View>
                </ListItem.Content>
                <TextC2
                    data1={dateExp.data}
                    data2={route.params.item.dateExpiration}
                />
                <Icon 
                    name='chevron-forward-outline' 
                    color='gray' 
                    type='ionicon' 
                    size={20}
                />
            </ListItem>
        </Card>
    )

    const CardNoteC = () => (
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
    )
    
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
                    {route.params.item.tittle}
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
                    task.steps.map(item => (
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
                <CardArchiveC/> 
                <CardDatesC/>
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
                    {'Task created: '}  
                    {
                        (route.params.item.dateCreate)
                        ? route.params.item.dateCreate.toString().split('T')[0]
                        : 'Now'
                    }
                </Text>
            </View>
        </View>
    )
}


export default TaskDetail;