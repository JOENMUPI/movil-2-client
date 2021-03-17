import React, { useState, useEffect } from 'react'; 
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ToastAndroid, 
    Alert, 
    ActivityIndicator, 
    Modal, 
    TextInput, 
} from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, CheckBox } from 'react-native-elements'
import DraggableFlatList from 'react-native-draggable-flatlist';
import SwipeableItem from 'react-native-swipeable-item';

import Field from '../components/Field';
import Http from '../components/Http';

import { listDetailStyles } from '../styles/screens/listDetail';

const TASK_BLANK = {
    archives: [],
    check: false,
    dateCreate: null,
    dateExpiration: null,
    dateNotification: null,
    id: 0,
    listId: 0,
    note: null,
    position: 0,
    priority: false,
    steps: [],
    tittle: '',
}


const ListDetail = ({ navigation, route }) => {
    const [task, setTask] = useState(route.params.item.tasks);
    const [modal, setModal] = useState({ type: 'create', flag: false });
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState(TASK_BLANK);

    let itemRefs = new Map();
    const { multiply, sub } = Animated;


    // Utilities
    const toast = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const changeToUpdateModel = (taskItem) => {  
        setNewTask({...taskItem, tittleForUpdate: taskItem.tittle, tittle: '' });
        setModal({ type: 'update', flag: true }); 
    }

    const changeToCreateModel = () => {  
        let newTaskAux = newTask;

        newTaskAux.tittle = '';
        setNewTask(newTaskAux);
        setModal({ type: 'create', flag: true }); 
    }

    const alertForDelete = (taskItem) => {
        Alert.alert(
            "Delete",
            `Are you sure delete ${taskItem.tittle}`,
            [
                { text: "Cancel", style: "cancel" }, 
                { text: "OK", onPress: () => deleteTask(taskItem) }
    
            ], { cancelable: false }
        );
    } 

    const renderUnderlayLeft = ({ item, percentOpen, close }) => (
        <Animated.View style={[ listDetailStyles.backRow, listDetailStyles.underlayLeft, { opacity: percentOpen } ]}>
            <Icon 
                name='trash' 
                color='black' 
                type='ionicon' 
                size={30} 
                onPress={() => alertForDelete(item)}
                onPressOut={close}
            />
        </Animated.View>
    )

    const renderUnderlayRight = ({ item, percentOpen, open, close }) => (
        <View style={[listDetailStyles.backRow, listDetailStyles.underlayRight]}>
            <Animated.View
                style={[{ transform: [{ translateX: multiply(sub(1, percentOpen), -100) }] }]}
                >
                <Icon 
                    name='pencil' 
                    color='black' 
                    type='ionicon' 
                    size={30} 
                    onPress={() => changeToUpdateModel(item)}
                    onPressOut={close}
                />
            </Animated.View>
        </View>
    )

    const closeSwipe = (open, item) => {
        if (open) { 
            [...itemRefs.entries()].forEach(([key, ref]) => {
                if (key !== item.id && ref) ref.close();
            });
        }
    }

    const setReferenceItemSwipe = (ref, item) => {
        if (ref && !itemRefs.get(item.key)) {
            itemRefs.set(item.id, ref);
        }
    }

    const handleCheck = (item) => {
        const aux = { ...item, check: !item.check }

        callback2(aux, 'update');
        updateField('check', aux.check, aux.id);
    }

    const orderTask = () => {
        let taskAuxPriority = [];
        let taskAuxNoPriority = [];

        task.forEach(taskItem => {
            (taskItem.priority)
            ? taskAuxPriority.push(taskItem)
            : taskAuxNoPriority.push(taskItem);
        });

        const taskAux = taskAuxPriority.concat(taskAuxNoPriority); 
        
        setTask(taskAux);
    }

    const handlePriority = (item) => {
        const newData = { ...item, priority: !item.priority }
        let taskAux = [];
        
        if(newData.priority) {
            taskAux = task.filter(i => i.id != item.id);
            taskAux.unshift(newData);
        } else {
            taskAux = task.map(i => {
                if(i.id == item.id) {
                    return newData;
                }

                return i;
            });
        } 

        route.params.callback(newData, 'update');
        updateField('priority', newData.priority, newData.id); 
        setTask(taskAux);
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

    const callback2 = (item, type) => { 
        let taskAux = [];

        switch(type) {
            case 'update': 
                taskAux = task.map(taskItem => {  
                    if(taskItem.id == item.id) {
                        return item;
                    
                    } else {
                        return taskItem;
                    }
                });
                break;
            
            case 'delete':
                taskAux = task.filter(i => i.id != item.id);
                break;
        }

        route.params.callback(item, type);
        setTask(taskAux);
    }

    const renderItem = ({ item, index, drag }) => (
        <SwipeableItem
            key={item.key}
            item={item}
            ref={(ref) => setReferenceItemSwipe(ref, item)}
            onChange={({ open }) => closeSwipe(open, item)}
            overSwipe={20}
            renderUnderlayLeft={renderUnderlayLeft}
            renderUnderlayRight={renderUnderlayRight}
            snapPointsLeft={[75]}
            snapPointsRight={[75]}
            >
            <View style={listDetailStyles.item}>
                <CheckBox
                    checked={item.check}
                    onPress={() => handleCheck(item)}
                />
                <View style={listDetailStyles.row}>
                    <TouchableOpacity 
                        onLongPress={drag} 
                        onPress={() => navigation.navigate('TaskDetail', { item, callback: callback2.bind(this) })}
                        >
                        <Text style={listDetailStyles.text}>{item.tittle}</Text>
                    </TouchableOpacity> 
                    <CheckBox
                        checkedIcon={<Icon name='star' color='gold' type='ionicon' size={20}/>}
                        uncheckedIcon={<Icon name='star-outline' color='grey' type='ionicon' size={20}/>}
                        checked={item.priority}
                        onPress={() => handlePriority(item)}
                    />  
                </View>
            </View>
        </SwipeableItem>
    )


    // Logic


    const updateField = async (type, field, id) => { 
        const data = await Http.send('PUT', 'task/field', { type, id, field });

        (!data) 
        ? Alert.alert('Fatal Error', 'No data from server...')
        : basicHandlerResponse(data);
    }

    const deleteTask = async (taskItem) => {
        const data = await Http.send('DELETE', `task/${taskItem.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    callback2({ ...taskItem, listId: route.params.item.id }, 'delete')
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

    const updateTaskTittle = async () => { 
        if(!Field.checkFields([ newTask.tittle ])) {
            Alert.alert('Empty Field', 'Please, write a tittle');
        
        } else {
            setLoading(true); 
            const jsonAux = { id: newTask.id, field: newTask.tittle, type: 'tittle' } 
            const data = await Http.send('PUT', 'task/field', jsonAux);

            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else { 
                switch(data.typeResponse) {
                    case 'Success': 
                        toast(data.message);
                        callback2({ ...newTask, listId: route.params.item.id }, 'update');
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
        
        setModal({ ...modal, flag: false });
    }

    const submitNewTask = async () => { 
        if(!Field.checkFields([ newTask.tittle ])) {
            Alert.alert('Empty Field', 'Please, write a tittle');
        
        } else { 
            setLoading(true);
            const id = route.params.item.id;  
            const data = await Http.send('POST', 'task', { ...newTask, listId: id });

            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');
    
            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        let newTaskAux = { ...newTask, id: data.body.id, listId: id }
                        let taskAux = task;
                        
                        taskAux.unshift(newTaskAux);
                        route.params.callback(newTaskAux, 'create'); 
                        setTask(taskAux);
                        setNewTask(TASK_BLANK);
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
        
        setModal({ ...modal, flag: false });
    }

    // Ggwp
    useEffect(() => {
        orderTask(); 
    }, []);
    
    return (
        <View style={listDetailStyles.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal.flag}
                onRequestClose={() => {
                    (modal.type == 'create') 
                    ? Alert.alert('New task has been canceled.')
                    : Alert.alert('Update task has been canceled.');

                    setModal({ ...modal, flag: false });
                }}
                > 
                <View style={listDetailStyles.centeredView}>
                    <View style={listDetailStyles.modalView}>
                        <Text style={listDetailStyles.modalText}>
                            { 
                                (modal.type == 'create') 
                                ? 'New task' 
                                : `Update ${newTask.tittleForUpdate}'s task` 
                            }
                        </Text>
                        <TextInput
                            placeholder="Write the task's tittle"
                            style={{
                                marginBottom: 15,
                                borderBottomColor: '#cccccc',
                                borderBottomWidth: 1
                            }}
                            autoFocus
                            onChangeText={tittle => setNewTask({ ...newTask, tittle: tittle })}
                            onSubmitEditing={() => {
                                (modal.type == 'create') 
                                ? submitNewTask()
                                : updateTaskTittle();
                            }}
                        />
                        <TouchableOpacity 
                            onPress={() => {
                                (modal.type == 'create') 
                                ? submitNewTask()
                                : updateTaskTittle()
                            }}
                            style={[listDetailStyles.button, listDetailStyles.buttonClose]}
                            >      
                            {
                                (loading) 
                                ? <ActivityIndicator size="small" color="#00ff00" /> 
                                : (modal.type == 'create') 
                                    ? <Text style={listDetailStyles.textStyle}> Create task </Text>
                                    : <Text style={listDetailStyles.textStyle}> Update task </Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={listDetailStyles.viewTittle}>
                <Text style={listDetailStyles.textTtittle}>
                    {route.params.item.tittle}
                </Text>
            </View>
            <View style={listDetailStyles.header}>
                <Text style={{ fontSize: 24 }}>
                    Tasks
                </Text>
                <View style={listDetailStyles.buttonAdd}>
                    <Icon 
                        name='add' 
                        color='#1e90ff' 
                        type='ionicon' 
                        size={30} 
                        onPress={() => changeToCreateModel()}
                    />
                </View>   
            </View>

            <View style={{ flex: 1 }}>
                <DraggableFlatList style={{ backgroundColor: '#f4f6fc' }}
                    data={task}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    onDragEnd={({ data }) => setTask(data)}
                />
            </View>
        </View>     
    )
}

export default ListDetail
