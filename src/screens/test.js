import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    LayoutAnimation,
    CheckBox,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import SwipeableItem from 'react-native-swipeable-item';

const NUM_ITEMS = 20;
const getColor = (i) => {
    const multiplier = 255 / (NUM_ITEMS - 1);
    const colorVal = i * multiplier;
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

const initialData = [...Array(NUM_ITEMS)].fill(0).map((d, index) => {
    const backgroundColor = getColor(index);
    
    return {
        text: `ROW ${index}`,
        key: `key-${backgroundColor}`,
    }
})

export default function Basic() {
    const [listData, setListData] = useState(initialData);

    let itemRefs = new Map();
    const { multiply, sub } = Animated;

    const deleteItem = (item) => {
        const updatedData = listData.filter(i => i !== item);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setListData(updatedData);
    }

    const renderUnderlayLeft = ({ item, percentOpen, close }) => (
        <Animated.View style={[styles.backRow, styles.underlayLeft, { opacity: percentOpen }]}>
            <TouchableOpacity onPress={() => deleteItem(item)} onPressOut={close}>
                <MaterialCommunityIcons
                    name={'trash-can'}
                    size={30}
                    style={{ color: 'black' }} 
                />
            </TouchableOpacity>
        </Animated.View>
    )

    const renderUnderlayRight = ({ item, percentOpen, open }) => (
        <View style={[styles.backRow, styles.underlayRight]}>
            <Animated.View
                style={[{ transform: [{ translateX: multiply(sub(1, percentOpen), -100) }] }]}
                >
                <TouchableOpacity onPressOut={() => console.log('update', item)}>
                    <MaterialCommunityIcons
                        name={'bell'}
                        size={30}
                        style={{ color: 'black' }} 
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
    

    const closeSwipe = (open, item) => {
        if (open) { 
            [...itemRefs.entries()].forEach(([key, ref]) => {
                if (key !== item.key && ref) ref.close();
            });
        }
    }

    const setReferenceItemSwipe = (ref, item) => {
        if (ref && !itemRefs.get(item.key)) {
            itemRefs.set(item.key, ref);
        }
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
            <View style={styles.item}>
                <CheckBox
                    value={false}
                    onChange={() => console.log('holis')}
                />
                <View style={styles.row}>
                    <TouchableOpacity onLongPress={drag} onPress={() => console.log('detailListaqui', item)}>
                        <Text style={styles.text}>{item.text}</Text>
                    </TouchableOpacity>    
                </View>
            </View>
        </SwipeableItem>
    )


    return (
        <View style={styles.container}>
            <SwipeableItem 
            key={1051}
            item={listData[0]}
            ref={(ref) => setReferenceItemSwipe(ref, listData[0])}
            onChange={({ open }) => closeSwipe(open, listData[0])}
            overSwipe={20}
            renderUnderlayLeft={renderUnderlayLeft}
            renderUnderlayRight={renderUnderlayRight}
            snapPointsLeft={[75]}
            snapPointsRight={[75]}
            >
            <View style={styles.item}>
                <CheckBox
                    value={false}
                    onChange={() => console.log('holis')}
                />
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => console.log('detailListaqui')}>
                        <Text style={styles.text}>holis</Text>
                    </TouchableOpacity>    
                </View>
            </View>
        </SwipeableItem>
            <DraggableFlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                onDragEnd={({ data }) => setListData(data)}
            />      
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#212121',
        flex: 1,
    },

    item: {
        height: 60,
        backgroundColor: 'gray',
        marginTop: 10,
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    row: {
        backgroundColor: 'black',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        
    },

    backRow: {
        flexDirection: 'row',
        borderRadius: 20,
        marginHorizontal: 10,
        marginTop: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    text: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 32,
    },

    underlayRight: {
        flex: 1,
        backgroundColor: 'yellow',
        justifyContent: 'flex-start',
    },
    
    underlayLeft: {
        flex: 1,
        backgroundColor: 'tomato',
        justifyContent: 'flex-end',
    },
});