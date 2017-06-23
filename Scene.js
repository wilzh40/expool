import React from 'react';
import { View } from 'react-native';
import Immutable from 'immutable';

import { connect } from 'react-redux';

import Styles from './Styles';

import { Composites, Query, Bodies, Body, Engine, World } from 'matter-js';

/*
 * mergeDeep but clobber arrays.
 */
const merge = (a, b) => (Immutable.Map.isMap(a) ? a.mergeWith(merge, b) : b);

/*
 * Return a reducer that runs the reducer `reductions[action]`, defaulting to
 * `reductions.DEFAULT` if not found.
 */
const defaultReducer = reductions => (state, action, ...rest) =>
  (reductions[action.type] || reductions.DEFAULT)(state, action, ...rest);

/*
 * Physics
 */

const engine = Engine.create();
engine.world.gravity.y = 0.05
engine.world.gravity.x = 0

const [sw, sh] = [Styles.screenW, Styles.screenH];
const walls = [
  { x: 0.5 * sw, y: 0.95 * sh, w: sw, h: 0.1 * sh },
  { x: 0.5 * sw, y: 0.05 * sh, w: sw, h: 0.1 * sh },
  { x: 0.05 * sw, y: 0.5 * sh, w: 0.1 * sw, h: 1 * sh },
  { x: 0.95 * sw, y: 0.5 * sh, w: 0.1 * sw, h: 1 * sh },
];

walls_phys = walls.map((wall) =>
  Bodies.rectangle(wall.x, wall.y, wall.w, wall.h, { isStatic: true })
);

walls_phys.map(wall => World.add(engine.world, wall));

const SCALE = 1;
const sp = {
  x: 250 / SCALE,
  y: 192 / SCALE,
};
const cueStart = {
  x: sw*0.5  / SCALE,
  y: sh*0.7 / SCALE,
};
const ballRadius = 15;
const eightBallLocs = [
  { id: 0, x: cueStart.x, y: cueStart.y },
  { id: 1, x: sp.x, y: sp.y },
  { id: 2, x: sp.x - 2 * ballRadius, y: sp.y - ballRadius },
  { id: 3, x: sp.x - 4 * ballRadius, y: sp.y + 2 * ballRadius },
  { id: 4, x: sp.x - 6 * ballRadius, y: sp.y - 3 * ballRadius },
  { id: 5, x: sp.x - 8 * ballRadius, y: sp.y + 4 * ballRadius },
  { id: 6, x: sp.x - 8 * ballRadius, y: sp.y - 2 * ballRadius },
  { id: 7, x: sp.x - 6 * ballRadius, y: sp.y + ballRadius },
  { id: 8, x: sp.x - 4 * ballRadius, y: sp.y },
  { id: 9, x: sp.x - 2 * ballRadius, y: sp.y + ballRadius },
  { id: 10, x: sp.x - 4 * ballRadius, y: sp.y - 2 * ballRadius },
  { id: 11, x: sp.x - 6 * ballRadius, y: sp.y + 3 * ballRadius },
  { id: 12, x: sp.x - 8 * ballRadius, y: sp.y - 4 * ballRadius },
  { id: 13, x: sp.x - 8 * ballRadius, y: sp.y + 2 * ballRadius },
  { id: 14, x: sp.x - 6 * ballRadius, y: sp.y - ballRadius },
  { id: 15, x: sp.x - 8 * ballRadius, y: sp.y },
];


const stack = Composites.pyramid(sw/2,sh/2,3,3,0,0, ({ x, y }) =>
  Bodies.circle(x, y, ballRadius, { restitution: 0.6, friction: 0.1 })
);
eightBall_phys = eightBallLocs.map(({ id, x, y }) =>
  Bodies.circle(x, y, ballRadius, { restitution: 0.6, friction: 0.1 })
);
// eightBall_phys.forEach(ball => World.add(engine.world, ball));
World.add(engine.world, eightBall_phys)
const balls = eightBall_phys

const physicsReduce = defaultReducer({
  START(state) {
    return merge(state, {
      physics: {
        balls: balls.map(({ position, angle }) => ({ position, angle })),
      },
    });
  },

  TICK(state, { dt }) {
    const lastDt = state.get('physics').get('lastDt');

    Engine.update(engine, 1000 * dt, lastDt ? dt / lastDt : 1);
    return merge(state, {
      physics: {
        lastDt: dt,
        balls: balls.map(({ position, angle }) => ({ position, angle })),
      },
    });
  },

  TOUCH(state, { pressed, x0, y0 }) {
    if (pressed) {
      const point = { x: x0, y: y0 };
      const toucheds = Query.point(engine.world.bodies, point);
      console.log('toucheds', toucheds);
      toucheds.forEach(touched => {
        Body.applyForce(touched, point, { x: 0, y: -0.05 * touched.mass });
      });
      if (toucheds.length === 0) {
        addBox(x0, y0);
      }
    }
    return state;
  },

  DEFAULT(state) {
    return state;
  },
});

/**
 * Boxes
 */

const Balls = connect(state => ({
  balls: state.get('physics').get('balls'),
}))(({ balls }) =>
  <View style={Styles.container}>
    {balls.map((ball, index) => {
      const x = ball.get('position').get('x');
      const y = ball.get('position').get('y');
      return (
        <View
          key={`ball-${index}`}
          style={{
            position: 'absolute',
            left: x - ballRadius,
            top: y - ballRadius,
            borderRadius: '50%',
            width: 2*ballRadius,
            height: 2*ballRadius,
            backgroundColor: 'red'
          }}
        />
      );
    })}
  </View>
);


/**
 * Ground
 */

const Ground = () =>
  <View
    style={{
      position: 'absolute',
      left: 0,
      top: 0.9 * Styles.screenH,
      width: Styles.ScreenW,
      height: 0.1 * Styles.screenH,
      backgroundColor: 'blue',
    }}
  />;

/**
 * Fluxpy
 */

const reducers = [physicsReduce];

export const sceneReduce = (state = Immutable.fromJS({}), action, dispatch) => {
  state = state.merge({ parent: state });
  return reducers.reduce(
    (state, reducer) => reducer(state, action, dispatch),
    state
  );
};

export const Scene = () =>
  <View
    key="scene-container"
    style={[Styles.container, { backgroundColor: '#FFF' }]}>
    <Ground />
    <Balls />
  </View>;
