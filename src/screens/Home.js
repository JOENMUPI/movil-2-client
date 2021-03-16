import { StatusBar } from 'expo-status-bar';
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
    ScrollView
} from 'react-native';

import { Icon, SearchBar } from 'react-native-elements'

import Field from '../components/Field';
import Http from '../components/Http';

import { homeStyles } from '../styles/screens/home';


const Home = ({ navigation, route }) => {
    const [list, setList] = useState([]);
    const [modal, setModal] = useState({ type: 'create', flag: false });
    const [loading, setLoading] = useState(false);
    const [newList, setNewList] = useState({ id: 0, tittle: '', background: 'black', tittleForUpdate: '' });


    // Utilities
    const toast = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.TOP
        );
    }

    const changeToUpdateModel = (listItem) => {
        setNewList({ ...listItem, tittleForUpdate: listItem.tittle, tittle: '' });
        setModal({ type: 'update', flag: true });
    }

    const changeToCreateModel = () => {
        let newListAux = newList;

        newListAux.tittle = '';
        setNewList(newListAux);
        setModal({ type: 'create', flag: true });
    }

    const alertForDelete = (listItem) => {
        Alert.alert(
            "Delete",
            `Are you sure delete ${listItem.tittle}`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => deleteList(listItem) }

            ], { cancelable: false }
        );
    }

    const List = ({ data, tittle, theme, stamp }) => {
        return (
            <View style={[homeStyles.viewList, { allignItems: "center" }]}>
                <TouchableOpacity onPress={() => navigation.navigate('ListDetail', data)} style={{ flexDirection: "row" }}>
                    <Icon
                        name='list-outline'
                        color={theme}
                        type='ionicon'
                        size={30}
                        style={{ marginRight: 5 }}
                    />
                    <View>
                        <Text style={{ fontSize: 16 }}>
                            {tittle}
                        </Text>
                        <Text style={{ fontSize: 16, color: '#a4a4a4' }}>
                            {stamp}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={{ flexDirection: "row" }}>
                    <Icon
                        name='pencil'
                        color='#1e90ff'
                        type='ionicon'
                        size={30}
                        style={{ marginRight: 10 }}
                        onPress={() => changeToUpdateModel(data)}
                    />
                    <Icon
                        name='trash'
                        color='red'
                        type='ionicon'
                        size={30}
                        onPress={() => alertForDelete(data)}
                    />
                </View>
            </View>
        )
    }

    // Logic
    const deleteList = async (listItem) => {
        const data = await Http.send('DELETE', `list/${listItem.id}`, null);

        if (!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch (data.typeResponse) {
                case 'Success':
                    let auxList = list.filter(i => i.id != listItem.id);

                    toast(data.message);
                    setList(auxList);
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

    const updateList = async () => {
        if (!Field.checkFields([newList.tittle])) {
            Alert.alert('Empty Field', 'Please, write a tittle');

        } else {
            setLoading(true);
            const { tittleForUpdate, ...jsonAux } = newList;
            const data = await Http.send('PUT', 'list', jsonAux);

            if (!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else {
                switch (data.typeResponse) {
                    case 'Success':
                        toast(data.message);
                        let listAux = list.map((item) => {
                            if (item.id == jsonAux.id) { return jsonAux; }
                            else { return item }
                        });

                        setList(listAux);
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

    const getList = async () => {
        const id = route.params.id;
        const data = await Http.send('GET', `list/user/${id}`, null);

        if (!data) {
            Alert.alert('Fatal Error', 'No data from server...');

        } else {
            switch (data.typeResponse) {
                case 'Success':
                    toast(data.message);
                    setList(data.body);
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

    const submitNewList = async () => {
        if (!Field.checkFields([newList.tittle])) {
            Alert.alert('Empty Field', 'Please, write a tittle');

        } else {
            setLoading(true);
            const id = route.params.id;
            const data = await Http.send('POST', 'list', { ...newList, userId: id });

            if (!data) {
                Alert.alert('Fatal Error', 'No data from server...');

            } else {
                switch (data.typeResponse) {
                    case 'Success':
                        toast(data.message);
                        let newListAux = { ...newList, id: data.body.id }
                        let listAux = list;

                        listAux.unshift(newListAux);
                        setList(listAux);
                        setNewList({ id: 0, tittle: '', background: 'black', tittleForUpdate: '' });
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
        getList();
    }, []);

    return (
        <View style={homeStyles.container}>
            <Modal
                animationType="slide"
                transparent
                visible={modal.flag}
                onRequestClose={() => {
                    (modal.type == 'create')
                        ? Alert.alert('New list has been canceled.')
                        : Alert.alert('Update list has been canceled.');

                    setModal({ ...modal, flag: false });
                }}
            >
                <View style={homeStyles.centeredView}>
                    <View style={homeStyles.modalView}>
                        <Text style={homeStyles.modalText}>
                            {
                                (modal.type == 'create')
                                    ? 'New list'
                                    : `Update ${newList.tittleForUpdate}'s list`
                            }
                        </Text>
                        <TextInput
                            placeholder="Write the list's tittle"
                            style={{
                                marginBottom: 15,
                                borderBottomColor: '#cccccc',
                                borderBottomWidth: 1
                            }}
                            autoFocus
                            onChangeText={tittle => setNewList({ ...newList, tittle: tittle })}
                            onSubmitEditing={() => {
                                (modal.type == 'create')
                                    ? submitNewList()
                                    : updateList();
                            }}
                        />
                        <TouchableOpacity
                            style={[homeStyles.button, homeStyles.buttonClose]}
                            onPress={() => {
                                (modal.type == 'create')
                                    ? submitNewList()
                                    : updateList()
                            }}
                        >
                            {
                                (loading)
                                    ? <ActivityIndicator size="small" color="#00ff00" />
                                    : (modal.type == 'create')
                                        ? <Text style={homeStyles.textStyle}> Create list </Text>
                                        : <Text style={homeStyles.textStyle}> Update list </Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <StatusBar style="auto" />
            <View style={homeStyles.viewTittle}>

            </View>
            <View style={homeStyles.header}>
                <Text style={{ fontSize: 24 }}>
                    Lists
                </Text>
                <View style={homeStyles.buttonAdd} >
                    <Icon
                        name='add-outline'
                        color='#1e90ff'
                        type='ionicon'
                        size={30}
                        onPress={() => changeToCreateModel()}
                    />
                </View>
            </View>
            <ScrollView style={{ backgroundColor: '#f4f6fc' }}>
                {
                    (list.length <= 0)
                        ? <Text>User dont have list, create one!</Text>
                        : list.map(listItem => (
                            <List
                                data={listItem}
                                tittle={listItem.tittle}
                                theme={listItem.background}
                                stamp={''}
                            />
                        ))
                }
            </ScrollView>
        </View>
    );
    const SearchBars = ({ data, tittle, }) => {


        renderSeparator = () => {
            return (

                <View
                    style={{
                        height: 1,
                        width: '100%',
                        backgroundColor: '#CED0CE',
                    }}
                />
            );
        };

        searchItems = text => {
            const newData = this.tile.filter(item => {
                const itemData = `${item.name.toUpperCase()}`;
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            this.setState({
                data: newData,
                value: text,
            });
        };

        renderHeader = () => {
            return (

                <SearchBar
                    style={{ height: 60, borderColor: '#000', borderWidth: 1 }}
                    placeholder="   Type Here...Key word"
                    onChangeText={text => this.searchItems(text)}
                    value={this.state.value}
                />
            );
        };


        return (

            <View
                style={{
                    flex: 1,
                    padding: 25,
                    width: '98%',
                    alignSelf: 'center',
                    justifyContent: 'center',
                }}>


                <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                        <Text style={{ padding: 10 }}>{item.name} </Text>
                    )}
                    keyExtractor={item => item.name}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                />
            </View>
        );

    }

}

export default Home