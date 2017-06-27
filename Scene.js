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
 * Physics Definitions
 */

const engine = Engine.create();
// engine.enableSleeping = true
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

const [sw, sh] = [Styles.screenW, Styles.screenH];

// Percentages
wallThickness = 30;
holeRadius = 20;
const walls = [
  { x: 0.5 * sw, y: 0.95 * sh, w: sw, h: wallThickness },
  { x: 0.5 * sw, y: 0.05 * sh, w: sw, h: wallThickness },
  { x: 0.05 * sw, y: 0.5 * sh, w: wallThickness, h: sh },
  { x: 0.95 * sw, y: 0.5 * sh, w: wallThickness, h: sh },
];

walls_phys = walls.map(wall =>
  Bodies.rectangle(wall.x, wall.y, wall.w, wall.h, { isStatic: true })
);
walls_phys.map(wall => World.add(engine.world, wall));

const holes = [
  //left
  { x: 0.1 * sw, y: 0.90 * sh },
  { x: 0.1 * sw, y: 0.45 * sh },
  { x: 0.1 * sw, y: 0.10 * sh },
  //right
  { x: 0.9 * sw, y: 0.90 * sh },
  { x: 0.9 * sw, y: 0.45 * sh },
  { x: 0.9 * sw, y: 0.1 * sh },
];

hole_bounds = holes.map(hole => {
  const holebody = Bodies.circle(hole.x, hole.y, 0.5 * holeRadius, {
    isStatic: true,
  });
  return holebody.bounds;
});

const SCALE = 1;
const sp = {
  x: 250 / SCALE,
  y: 192 / SCALE,
};
const cueStart = {
  x: sw * 0.5 / SCALE,
  y: sh * 0.7 / SCALE,
};
const ballRadius = 15;
const eightBallLocs = [
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

const cueBall = Bodies.circle(cueStart.x, cueStart.y, ballRadius, {
  restitution: 0.8,
  friction: 0.3,
});
World.add(engine.world, cueBall);

// const stack = Composites.pyramid(sw/2,sh/2,3,3,0,0, ({ x, y }) =>
//   Bodies.circle(x, y, ballRadius, { restitution: 0.6, friction: 0.1 })
// );
eightBall_phys = eightBallLocs.map(({ id, x, y }) =>
  Bodies.circle(x, y, ballRadius, { restitution: 0.8, friction: 0.4 })
);
// eightBall_phys.forEach(ball => World.add(engine.world, ball));
World.add(engine.world, eightBall_phys);
let balls = eightBall_phys;

const _ballsSleeping = () => {
  const objects = balls + [cueBall]
  const allSleeping = balls.every(
    ({ speed, angularSpeed }) =>
      speed * speed + angularSpeed * angularSpeed < 0.01
  );
  return allSleeping
}
const _detectCollisions = () => {
    let sunkenBalls = [];
    hole_bounds.forEach(bound => {
      const intersections = Query.region(balls, bound);
      sunkenBalls = sunkenBalls.concat(intersections);
    });

    // Remove from world
    if (sunkenBalls.length > 0) {
      console.log('sunk!');
      sunkenBalls.forEach(b => World.remove(engine.world, b));
    }
    balls = balls.filter(
      ({ id }) => sunkenBalls.map(b => b.id).indexOf(id) === -1
    );
}

const physicsReduce = defaultReducer({
  START(state) {
    return merge(state, {
      canShoot: true,
      physics: {
        balls: balls.map(({ position, angle }) => ({ position, angle })),
        cue: { position: cueBall.position },
      },
    });
  },

  TICK(state, { dt }) {
    const lastDt = state.get('physics').get('lastDt');

    Engine.update(engine, 1000 * dt, lastDt ? dt / lastDt : 1);
    // Check if balls are sleeping
    
    const allSleeping = _ballsSleeping()


    // Collision detecting with balls and holes
    _detectCollisions() 

    return merge(state, {
      canShoot: allSleeping,
      physics: {
        lastDt: dt,
        balls: balls.map(({ position, angle }) => ({ position, angle })),
        cue: { position: cueBall.position },
      },
    });
  },
  SHOOT(state, { magnitude, angle }) {
    // TODO add shit
    if (state.get('canShoot')) {
      const scale = 0.0005;
      const force = {
        x: magnitude * scale * Math.cos(angle),
        y: magnitude * scale * Math.sin(angle),
      };
      Body.applyForce(cueBall, cueBall.position, force);
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
            borderRadius: 50,
            width: 2 * ballRadius,
            height: 2 * ballRadius,
            backgroundColor: 'lightgrey',
          }}
        />
      );
    })}
  </View>
);
const Cue = connect(state => ({
  cue: state.get('physics').get('cue'),
  canShoot: state.get('canShoot')
}))(({ cue, canShoot }) =>
  <View
    style={{
      position: 'absolute',
      left: cue.get('position').get('x') - ballRadius,
      top: cue.get('position').get('y') - ballRadius,
      borderRadius: 50,
      width: 2 * ballRadius,
      height: 2 * ballRadius,
      backgroundColor: 'black',
      borderWidth: 3,
      borderColor: canShoot ? 'white' : 'grey'
    }}
  />
);

const Holes = () =>
  <View style={Styles.container}>
    {holes.map((hole, index) => {
      const x = hole.x;
      const y = hole.y;
      return (
        <View
          key={`hole-${index}`}
          style={{
            position: 'absolute',
            left: x - holeRadius,
            top: y - holeRadius,
            borderRadius: 50,
            width: 2 * holeRadius,
            height: 2 * holeRadius,
            backgroundColor: '#222',
          }}
        />
      );
    })}
  </View>;

marginW = 0.05 * sw;
marginH = 0.05 * sh;
const PlayingArea = () =>
  <View
    style={{
      flex: 1,
      position: 'absolute',
      backgroundColor: 'white',
      marginLeft: marginW,
      marginRight: marginW,
      marginTop: marginH,
      marginBottom: marginH,
    }}
  />;

const Walls = () =>
  <View style={Styles.container}>
    {walls.map((wall, index) => {
      const x = wall.x;
      const y = wall.y;
      return (
        <View
          key={`wall-${index}`}
          style={{
            position: 'absolute',
            left: wall.x,
            top: wall.y,
            width: wall.w,
            height: wall.h,
            position: 'absolute',
            backgroundColor: 'white',
          }}
        />
      );
    })}
  </View>;
/**
     * Ground
     */

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
    style={[Styles.container, { backgroundColor: '#111' }]}>
    <View
      style={{
        flex: 1,
        position: 'absolute',
        backgroundColor: 'lightgrey',
        margin: 20
      }}/>
      <Cue />
      <Holes />
      <Balls />
  </View>;
