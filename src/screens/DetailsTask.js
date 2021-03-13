import React, { Component } from 'react';
import { Container, Header, Content, Card, CardItem, Text, Icon, Right, List, ListItem, Input } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export default class DetailsTask extends Component {
    render() {
        var items = ['Simon Mignolet', 'Nathaniel Clyne'];

        return (
            <Container>
                <Header />
                <Content>
                    <Card>

                        <CardItem style={{ justifyContent: 'space-between' }} >

                            <MaterialCommunityIcons name="bookmark-plus-outline" size={26} />

                            <Text>Agregar paso </Text>
                            <List dataArray={items} renderRow={(data) =>
                                <ListItem>
                                    <Text>{data}</Text>
                                </ListItem>
                            } />
                            <Right>
                                <Icon style name="arrow-forward" />
                            </Right>
                        </CardItem>
                    </Card>
                    <Card>


                        <CardItem style={{ justifyContent: 'space-between' }}>
                            <MaterialCommunityIcons name="whistle" size={26} />
                            <Text>Recordame</Text>

                            <Right>
                                <Icon name="arrow-forward" />
                            </Right>

                        </CardItem>

                    </Card>
                    <Card>


                        <CardItem style={{ justifyContent: 'space-between' }}>
                            <MaterialCommunityIcons name="paperclip" size={26} />
                            <Text>Agregar Archivo</Text>
                            <List dataArray={items} renderRow={(data) =>
                                <ListItem>
                                    <Text>{data}</Text>
                                </ListItem>
                            } />
                            <Right>
                                <Icon style={{

                                }} name="arrow-forward" />
                            </Right>

                        </CardItem>

                    </Card>
                    <Card>


                        <CardItem style={{ justifyContent: 'space-between' }}>
                            <MaterialCommunityIcons name="calendar-today" size={26} />
                            <Text>Agregar Fecha de vencimiento</Text>
                            <Right>
                                <Icon name="arrow-forward" />
                            </Right>

                        </CardItem>

                    </Card>
                    <Card>
                        <CardItem style={{ justifyContent: 'space-between' }}>
                            <MaterialCommunityIcons name="undo-variant" size={26} />
                            <Text>Repetir</Text>
                            <Right>
                                <Icon style={{

                                }} name="arrow-forward" />
                            </Right>

                        </CardItem>

                    </Card>
                    <Card>

                        <CardItem style={{ justifyContent: 'space-between' }} >


                            <Text>Agregar Nota </Text>

                        </CardItem>
                    </Card>
                    <Card>

                        <CardItem style={{
                            justifyContent: 'space-between',


                        }}>
                            <MaterialCommunityIcons name="file" size={26} />

                            <Text > create note march 5</Text>



                            <Right>
                                <MaterialCommunityIcons name="delete" size={26} />
                            </Right>

                        </CardItem>

                    </Card>

                </Content>
            </Container>

        );
    }
}

