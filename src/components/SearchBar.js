import React, { useState , useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SearchBar, CheckBox, Icon } from 'react-native-elements';


const SearchBarC = ({ arrayData, vissible, onCancel, onPressItem }) => {
    const [data, setData] = useState(arrayData);
    const [value, setValue] = useState('');

    const renderSeparator = () => {
        return (
            <View
                style={{
                    height: 10,
                    width: '100%',
                    backgroundColor: '#f4f6fc',
                }}
            />
        )
    }
    

    const searchItems = text => {
        const newData = arrayData.filter(item => {
            const itemData = `${item.tittle.toUpperCase()}`;
            const textData = text.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });

        setData(newData);
        setValue(text);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => { onPressItem(item); setData([]); setValue(''); }}
            style={{  
                backgroundColor: 'white' , 
                flexDirection: "row", 
                borderRadius:20, 
                alignItems: 'center', 
                justifyContent: 'space-between' 
            }}
            >
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <CheckBox checked={item.check}/>
                <Text style={{ fontWeight: "bold", color: "gray" }}>{item.tittle}</Text>
            </View>
            <View>
                <CheckBox
                    checkedIcon={<Icon name='star' color='gold' type='ionicon' size={20}/>}
                    uncheckedIcon={<Icon name='star-outline' color='grey' type='ionicon' size={20}/>}
                    checked={item.priority}
                />
            </View>
        </TouchableOpacity>
    )
    
    return (
        <Modal 
            animationType="slide"
            transparent
            visible={vissible}
            onRequestClose={() => { onCancel(); setData([]); setValue(''); }}
            style={{
                flex: 1,
                height: '100%',
                width: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
            }}
            >
            <SearchBar
                inputContainerStyle={{ backgroundColor: 'white' }}
                inputStyle={{ backgroundColor:'white'}}
                containerStyle={ {backgroundColor: 'white', borderWidth: 1, borderRadius: 5 }}
                placeholder="Write a task's tittle"
                onChangeText={searchItems}
                value={value}
            />
            {
                (data.length < 1 && value != '') 
                ? <Text style={{ padding: 20,backgroundColor: '#f4f6fc', fontSize: 25, color: 'gray', textAlign: "center" }}>
                    Nothing found with "{value}"
                </Text>
                : null
            }
            <FlatList
                style = {{ paddingTop: 10, paddingHorizontal: 16, backgroundColor: '#f4f6fc' }}
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={renderSeparator}
            />
        </Modal>
    )
}

export default SearchBarC;