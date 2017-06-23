import React from 'react';
import { Engine, Render, World, Bodies } from 'matter-js'
import { StyleSheet, Text, View } from 'react-native';
import { Constants, Accelerometer, Svg } from 'expo';

import io from 'socket.io-client'
const url = 'https://341d6202.ngrok.io'
const socket = io(url, {
  tranports: ['webSocket']
})

const io = require('socket.io-client');
const url = 'https://7de78ffe.ngrok.io';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      accelerometerData: {
        x: 50,
        y: 50,
        z: 0,
      },
      pos: {
        x: 50,
        y: 50
      }
    };
    // Connect to the server
  }

  componentWillUnmount() {
    this._unsubscribeFromAccelerometer();
  }

  componentDidMount() {
    socket.on('connect', () => {
      // do something
    });
    
    this._subscribeToAccelerometer();
  }

  _accelerometerToPos({x,y,z}) {

  }
  _subscribeToAccelerometer = () => {
    this._acceleroMeterSubscription = Accelerometer.addListener(
      accelerometerData => {
        this.setState({ accelerometerData })
        socket.emit('pos', accelerometerData)
      }
    );
  };

  _unsubscribeFromAccelerometer = () => {
    this._acceleroMeterSubscription && this._acceleroMeterSubscription.remove();
    this._acceleroMeterSubscription = null;
  };

  render() {
    console.log(this.state.accelerometerData)
    const circle = (
      <Svg height={250} width={250}>
      <Svg.Circle
        x={-this.state.accelerometerData.x*100 + 50}
        y={-this.state.accelerometerData.y*100 + 50}
        r={10}
        strokeWidth={2.5}
        stroke="#e74c3c"
        fill="#f1c40f"
      />
    </Svg>
    );

    return (
      <View style={styles.container}>
        {circle}
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
