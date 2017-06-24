import React, { Component } from 'react';
import {connect} from 'react-redux'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Dimensions,
} from 'react-native';
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
  };

  panResponder = {};

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderStart: this.handlePanResponderStart,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd,
    });
  }

  render() {
    const [ballX, ballY] = [this.props.cueBall.get('x'), this.props.cueBall.get('y')]
    return (
      <View style={styles.container}>
        <View {...this.panResponder.panHandlers}>
          <Svg
            height={Dimensions.get('window').height}
            width={Dimensions.get('window').width}>
            <Svg.Line
              x1={ballX}
              y1={ballY - 30}
              x2={(this.state.startX - this.state.endX) / 1.5 + ballX}
              y2={(this.state.startY - this.state.endY) / 1.5 + ballY}
              stroke="white"
              strokeWidth="5"
              strokeOpacity={this.state.showCue}
              strokeDasharray={[5.2, 5.2]}
            />
          </Svg>
        </View>
      </View>
    );
  }

  handleStartShouldSetPanResponder = (e, gestureState) => {
    return true;
  };

  handlePanResponderStart = (e, gestureState) => {
    this.setState({
      startX: gestureState.x0,
      startY: gestureState.y0,
      endX: gestureState.x0,
      endY: gestureState.y0,
      showCue: 0.15,
    });
  };

  handlePanResponderMove = (e, gestureState) => {
    this.setState({
      offsetTop: gestureState.dy,
      offsetLeft: gestureState.dx,
      endX: gestureState.moveX,
      endY: gestureState.moveY,
    });
    var magValue = 0.15 + (Math.sqrt(Math.pow(this.state.endX - this.state.startX, 2) + Math.pow(this.state.endY - this.state.startY, 2)) / 700) * 0.7;
    if (magValue < 0.9) {
      this.setState({ showCue: magValue })
    } else {
      this.setState({ showCue: 0.9 })
    }
  };

  handlePanResponderEnd = (e, gestureState) => {
    var magnitude = (Math.sqrt(
      Math.pow(this.state.endX - this.state.startX, 2) +
        Math.pow(this.state.endY - this.state.startY, 2)
    )) / 5;
    var angle = Math.atan2(
      this.state.endY - this.state.startY,
      this.state.endX - this.state.startX
    ) + 3.14;
    this.setState({
      magnitude,
      angle,
      showCue: 0,
    });
    this.props.dispatch({
      type: 'SHOOT',
      magnitude,
      angle,
    });
  };
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
  },
});
export default connect(state => {
  return { cueBall: state.get('physics').get('cue').get('position') };
})(Cue);
