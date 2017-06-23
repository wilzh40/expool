/**
 * Clock
 *
 * Event handler that dispatches
 * `{ type: 'TICK', dt: <seconds since last tick> }`
 * per animation frame. Doesn't actually render anything.
 */

import React from 'react'
import {connect} from "react-redux"
class Clock extends React.Component {
  componentDidMount() {
    this._requestTick();
  }

  componentWillUnmount() {
    if (this._tickRequestID) {
      cancelAnimationFrame(this._tickRequestID);
    }
  }

  _requestTick() {
    if (!this._lastTickTime) {
      this._lastTickTime = Date.now();
    }
    this._tickRequestID = requestAnimationFrame(this._tick.bind(this));
  }

  _tick() {
    this._tickRequestID = undefined;
    const currTime = Date.now();
    this.tick(Math.min(0.05, 0.001 * (currTime - this._lastTickTime)));
    this._lastTickTime = currTime;
    this._requestTick();
  }

  tick(dt) {
    this.props.dispatch({ type: 'TICK', dt });
  }

  render() {
    return null;
  }
}
export default connect()(Clock)
