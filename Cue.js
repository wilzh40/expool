import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, PanResponder, Dimensions } from 'react-native';
import { Svg } from 'expo';

class Cue extends React.Component {

  state = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      magnitide: 0,
      angle: 0,
      showCue: 0,
    }

    panResponder = {}

    componentWillMount() {
      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
        onPanResponderStart: this.handlePanResponderStart,
        onPanResponderMove: this.handlePanResponderMove,
        onPanResponderRelease: this.handlePanResponderEnd,
        onPanResponderTerminate: this.handlePanResponderEnd,
      })
    }

    render() {

      return (
        <View style={styles.container}>
          <View
            {...this.panResponder.panHandlers}
          >
            <Svg
              height={Dimensions.get('window').height}
              width={Dimensions.get('window').width}
            >
              <Svg.Line
                  x1="150"
                  y1="300"
                  x2={(this.state.startX - this.state.endX) / 1.5 + 150}
                  y2={(this.state.startY - this.state.endY) / 1.5 + 300}
                  stroke="black"
                  strokeWidth="5"
                  strokeOpacity={this.state.showCue}
                  strokeDasharray={[5.2,5.2]}
              />
            </Svg>
          </View>
        </View>
      )
    }

    handleStartShouldSetPanResponder = (e, gestureState) => {
      return true
    }

    handlePanResponderStart = (e, gestureState) => {
      this.setState({
        startX: gestureState.x0,
        startY: gestureState.y0,
        endX: gestureState.x0,
        endY: gestureState.y0,
        showCue: .15
      })
    }

    handlePanResponderMove = (e, gestureState) => {
      this.setState({
        offsetTop: gestureState.dy,
        offsetLeft: gestureState.dx,
        endX: gestureState.moveX,
        endY: gestureState.moveY,
      });
      if ((.15 + ((gestureState.dy + gestureState.dy) / 700) * .7) < .90) {
        this.setState({ showCue: .15 + ((gestureState.dy + gestureState.dy) / 700) * .7 });
      } else {
        this.setState({ showCue: .90 });
      }
    }

    handlePanResponderEnd = (e, gestureState) => {
      var magnitude = Math.sqrt(Math.pow(this.state.endX - this.state.startX, 2) +
                        Math.pow(this.state.endY - this.state.startY, 2));
      var angle = Math.atan2(this.state.endY - this.state.startY, this.state.endX - this.state.startX);
      this.setState({
        magnitude,
        angle,
        showCue: 0
      })
    }
  }

  const styles = StyleSheet.create({
    container: {
      paddingTop: 30,
      flex: 1,
    },
    square: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: 12,
    }
  })
