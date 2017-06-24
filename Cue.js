import React, { Component } from 'react';
import { connect } from 'react-redux';
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

  constructor(props) {
    super(props);
  }
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
    const [x, y] = [this.props.cueBall.get('x'), this.props.cueBall.get('y')];

    return (
      <View style={styles.container}>
        <View>
          <Text>
            Magnitude of last move: {this.state.magnitude} Angle of last move:{' '}
            {this.state.angle}
          </Text>
        </View>
        <View {...this.panResponder.panHandlers}>
          <Svg
            height={Dimensions.get('window').height}
            width={Dimensions.get('window').width}>
            <Svg.Line
              x1={x}
              y1={y}
              x2={(this.state.startX - this.state.endX) / 1.5 + x}
              y2={(this.state.startY - this.state.endY) / 1.5 + y}
              stroke="black"
              strokeWidth="5"
              strokeOpacity={this.state.showCue}
            />
          </Svg>
        </View>
      </View>
    );
  }

  handleStartShouldSetPanResponder = (e, gestureState) => {
    return true;
  };

  handlePanResponderStart = (e, gentureState) => {
    this.setState({
      startX: gentureState.x0,
      startY: gentureState.y0,
      showCue: 0.85,
    });
  };

  handlePanResponderMove = (e, gestureState) => {
    this.setState({
      offsetTop: gestureState.dy,
      offsetLeft: gestureState.dx,
      endX: gestureState.moveX,
      endY: gestureState.moveY,
    });
  };

  handlePanResponderEnd = (e, gestureState) => {
    var magnitude = Math.sqrt(
      Math.pow(this.state.endX - this.state.startX, 2) +
        Math.pow(this.state.endY - this.state.startY, 2)
    );
    var angle = Math.atan2(
      this.state.endY - this.state.startY,
      this.state.endX - this.state.startX
    );
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
