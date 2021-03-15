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
    CheckBox, 
} from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from 'react-native-elements'
import DraggableFlatList from 'react-native-draggable-flatlist';
import SwipeableItem from 'react-native-swipeable-item';

import Field from '../components/Field';
import Http from '../components/Http';

import { listDetailStyles } from '../styles/screens/listDetail';


const ListDetail = ({ navigation, route }) => {
    const [task, setTask] = useState([]);
    const [modal, setModal] = useState({ type: 'create', flag: false });
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState({ tittle: '', id: 0, position: task.length + 1 });

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
                    name='notifications' 
                    color='black' 
                    type='ionicon' 
                    size={30} 
                    onPress={() => handlePriority(item.id)}
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

    const handleCheck = (id) => {
        let updated = [...task];
        
        updated = updated.map((taskItem, index) => { 
            if (id === taskItem.id) { 
                return { ...taskItem, check: !taskItem.check };
            }

            return taskItem;
        });

        setTask(updated);
    }

    const handlePriority = (id) => {
        let updated = [...task];
    
        updated = updated.map((taskItem, index) => { 
            if (id === taskItem.id) { 
                return { ...taskItem, priority: !taskItem.priority };
            }

            return taskItem;
        });

        setTask(updated);
    }


    // Logic
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
                    value={item.check}
                    onChange={() => handleCheck(item.id)}
                />
                <View style={listDetailStyles.row}>
                    <TouchableOpacity onLongPress={drag} onPress={() => navigation.navigate('TaskDetail', item)}>
                        <Text style={listDetailStyles.text}>{item.tittle}</Text>
                    </TouchableOpacity> 
                    <Icon 
                        name='pencil' 
                        color='#1e90ff' 
                        type='ionicon' 
                        size={30} 
                        onPress={() => changeToUpdateModel(item)}
                    />  
                </View>
            </View>
        </SwipeableItem>
    )

    const deleteTask = async (taskItem) => {
        const data = await Http.send('DELETE', `task/${taskItem.id}`, null);
        
        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch(data.typeResponse) {
                case 'Success': 
                    let auxTask = task.filter(i => i.id != taskItem.id);
                    
                    toast(data.message);
                    setTask(auxTask);
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
                        let taskAux = task.map((item) => {
                            if(item.id == jsonAux.id) { return jsonAux; } 
                            else { return item }
                        });

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

            setLoading(false); 
        }
        
        setModal({ ...modal, flag: false });
    }

    const getTask = async() => {
        const id = route.params.id;
        const data = await Http.send('GET', `task/list/${id}`, null);

        if(!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else { 
            switch(data.typeResponse) {
                case 'Success': 
                    toast(data.message);
                    setTask(data.body);
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

    const submitNewTask = async () => { 
        if(!Field.checkFields([ newTask.tittle ])) {
            Alert.alert('Empty Field', 'Please, write a tittle');
        
        } else { 
            setLoading(true);
            const id = route.params.id;  
            const data = await Http.send('POST', 'task', { ...newTask, listId: id });

            if(!data) {
                Alert.alert('Fatal Error', 'No data from server...');
    
            } else { 
                switch(data.typeResponse) { 
                    case 'Success': 
                        toast(data.message); 
                        let newTaskAux = { ...newTask, id: data.body.id }
                        let taskAux = task;
                        
                        taskAux.unshift(newTaskAux); 
                        setTask(taskAux);
                        setNewTask({ tittle: '', id: 0, position: task.length + 1 });
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
        getTask();
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
                    {route.params.tittle}
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
