import { StyleSheet } from 'react-native';

export const listDetailStyles = StyleSheet.create({
    item: {
        height: 75,
        backgroundColor: 'white',
        marginTop: 10,
        padding: 20,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backRow: {
        marginVertical: 4,
        flexDirection: 'row',
        borderRadius: 20,
        marginHorizontal: 16,
        marginTop: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    text: {
        fontWeight: 'bold',
        color: 'black',
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

    screen: {
        marginTop: 24,
        flex: 1,
        backgroundColor: '#212121',
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
         alignItems: "center",
         marginTop: 22
    },

    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
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
    },
});