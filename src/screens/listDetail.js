import React, { useState, useEffect, useCallback } from 'react'; 
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
    StyleSheet 
} from 'react-native';

import DraggableFlatList from 'react-native-draggable-flatlist';

import Field from '../components/Field';
import Http from '../components/Http';

import { signInStyles } from '../styles/screens/signIn';


const ListDetail = ({ navigation, route }) => {
    const [task, setTask] = useState([]);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState({ tittle: '', position: task.length + 1 });


    // Utilities
    const toast = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }


    // Logic
    const renderItem = ({ item, index, drag, isActive }) => (
        <View style={styles.item}>
          <CheckBox
            value={item.priority}
            onChange={() => handlePriority(item.id)}
          />
          <TouchableOpacity onLongPress={drag} onPress={() => navigation.navigate('TaskDetail', item)}>
            <Text>{item.tittle}</Text>
          </TouchableOpacity>
          <CheckBox
            value={item.check}
            onChange={() => handleCheck(item.id)}
          />
        </View>
    );
    
    const handleCheck = (id) => {
        let updated = [...task];
        
        updated = updated.map((taskItem, index) => { 
            if (id === taskItem.id) { 
                return { ...taskItem, check: !taskItem.check };
            }

            return taskItem;
        });

        setTask(updated);
    };

    const handlePriority = (id) => {
    let updated = [...task];
    
    updated = updated.map((taskItem, index) => { 
            if (id === taskItem.id) { 
                return { ...taskItem, priority: !taskItem.priority };
            }

            return taskItem;
        });


        setTask(updated);
    };

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

    const submitNewTask = async () => { console.log('hablame:',task.length + 1);
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
                        setNewTask({ ...newTask, id: data.body.id });
                        setTask([...task, newTask]);
                        setNewTask({ tittle: '', position: task.length + 1 });
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
        
        setModal(!modal);
    }


    // Ggwp
    useEffect(() => {
        getTask();
    }, []);
    
    return (
        <View style={styles.screen}>
            <Modal
                animationType="slide"
                transparent
                visible={modal}
                onRequestClose={() => {
                    Alert.alert("New task has been canceled.");
                    setModal(!modal);
                }}
                >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>New task</Text>
                        <TextInput
                            placeholder="Write the task's tittle"
                            style={{
                                marginBottom: 15,
                                borderBottomColor: '#cccccc',
                                borderBottomWidth: 1
                            }}
                            autoFocus
                            onChangeText={tittle => setNewTask({ ...newTask, tittle: tittle })}
                            onSubmitEditing={() => submitNewTask()}
                        />
                        <TouchableOpacity onPress={() => submitNewTask()} style={[styles.button, styles.buttonClose]}>      
                            {
                                (loading) 
                                ? <ActivityIndicator size="small" color="#00ff00" /> 
                                : <Text style={styles.textStyle}>Create task</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={() => setModal(true)} style={signInStyles.signIn}>      
                <Text>New task</Text>   
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <DraggableFlatList
                data={task}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                onDragEnd={({ data }) => setTask(data)}
                />
            </View>
        </View>     
    )
}

const styles = StyleSheet.create({
        screen: {
        marginTop: 24,
        flex: 1,
        backgroundColor: '#212121',
    },
    item: {
        backgroundColor: 'white',
        marginTop: 10,
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
         alignItems: "center",
         marginTop: 22
    },
    screen: {
        marginTop: 24,
        flex: 1,
        backgroundColor: '#212121',
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    buttonClose: {
      backgroundColor: "#2196F3",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
});

export default ListDetail
  