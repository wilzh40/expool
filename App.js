import React from 'react';
import { Engine, Render, World, Bodies } from 'matter-js';
import { StyleSheet, Text, View } from 'react-native';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';
import { Constants, Accelerometer, Svg } from 'expo';

import { Scene, sceneReduce } from './Scene';
import Clock from './Clock';
import Cue from './Cue'
import Styles from './Styles';

import io from 'socket.io-client';
const url = 'https://341d6202.ngrok.io';
// const socket = io(url, {
//   tranports: ['webSocket']
// })


const Game = () =>
  <View style={Styles.container}>
    <Clock />
    <Scene />
    <Cue />
  </View>;

const dispatchQueue = [];
const mainReduce = (state, action) => {
  const actions = [action].concat(dispatchQueue);
  dispatchQueue.length = 0;
  const dispatch = action => actions.push(action);
  while (actions.length > 0) {
    state = sceneReduce(state, actions.shift(), dispatch);
  }
  return state;
};

const store = createStore(mainReduce, mainReduce(undefined, { type: 'START' }));

export default class Main extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Game />
      </Provider>
    );
  }
}
