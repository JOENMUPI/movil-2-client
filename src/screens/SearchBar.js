import React, { Component } from 'react';
import { View, Text, FlatList, TextInput, ListItem } from 'react-native';
import { SearchBar } from 'react-native-elements';


class SearchBars extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            value: '',
        };

        this.arrayNew = [
            { name: 'ir a comprar ' },
            { name: 'vender' },
            { name: 'comer ' },
            { name: 'Tristan' },
            { name: 'Marie' },
            { name: 'Onni' },
            { name: 'sophie' },
            { name: 'Brad' },
            { name: 'Samual' },
            { name: 'Omur' },
            { name: 'Ower' },
            { name: 'Awery' },
            { name: 'Ann' },
            { name: 'Jhone' },
            { name: 'z' },
            { name: 'bb' },
            { name: 'cc' },
            { name: 'd' },
            { name: 'e' },
            { name: 'f' },
            { name: 'g' },
            { name: 'h' },
            { name: 'i' },
            { name: 'j' },
            { name: 'k' },
            { name: 'l' },
        ];
    }

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
        const newData = this.arrayNew.filter(item => {
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

    render() {
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

export default SearchBars;
