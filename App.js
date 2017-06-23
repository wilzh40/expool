import React from 'react';
import { Engine, Render, World, Bodies } from 'matter-js'
import { StyleSheet, Text, View } from 'react-native';

const io = require('socket.io-client');
const url = 'https://7de78ffe.ngrok.io';

export default class App extends React.Component {

  componentDidMount() {
    // INSTRUCTION:
    // or replace with your local ngrok url, eg: https://brent123.ngrok.io
    // start ngrok with ngrok http 3000 --subdomain=brent123
    // where the subdomain is whatever subdomain you want
    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      // do something
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up main.js to start working on your app!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
