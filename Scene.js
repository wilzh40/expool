import React from 'react';
import { View } from 'react-native';
import Immutable from 'immutable';

import { connect } from 'react-redux';

import Styles from './Styles';

import Matter from 'matter-js';
const { Bodies, Body, Engine, World } = Matter;

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

const [sw, sh] = [Styles.screenW, Styles.screenH];
const walls = [
  { x: 0.5 * sw, y: 0.95 * sh, w: sw, h: 0.1 * sh },
  { x: 0.5 * sw, y: 0.05 * sh, w: sw, h: 0.1 * sh },
  { x: 0.05 * sw, y: 0.5 * sh, w: 0.1 * sw, h: 1 * sh },
  { x: 0.95 * sw, y: 0.5 * sh, w: 0.1 * sw, h: 1 * sh },
];

walls_phys = walls.map(({x,y,w,h}) => Bodies.rectangle(x,y,w,h,{isStatic: true}))
walls_phys.forEach(ground => World.add(engine.world, ground))

const boxProps = [];
const boxes = [];

const addBox = (x, y) => {
  const size = 30 + 5 * Math.random();
  boxProps.push({
    size,
    color: `rgb(${255 * Math.random()}, ${255 * Math.random()}, ${255 *
      Math.random()})`,
  });
  const box = Bodies.rectangle(x, y, size, size);
  boxes.push(box);
  World.add(engine.world, box);
};

for (let i = 0; i < 120; ++i) {
  addBox(
    0.5 * Styles.screenW + (i % 5 - 2) * 40 + 5 * Math.random() - 2.5,
    0.9 * Styles.screenH + 10 - Math.floor(i / 3) * 80
  );
}

const physicsReduce = defaultReducer({
  START(state) {
    return merge(state, {
      physics: {
        boxes: boxes.map(({ position, angle }) => ({ position, angle })),
      },
    });
  },

  TICK(state, { dt }) {
    const lastDt = state.get('physics').get('lastDt');

    Engine.update(engine, 1000 * dt, lastDt ? dt / lastDt : 1);
    return merge(state, {
      physics: {
        lastDt: dt,
        boxes: boxes.map(({ position, angle }) => ({ position, angle })),
      },
    });
  },

  TOUCH(state, { pressed, x0, y0 }) {
    if (pressed) {
      const point = { x: x0, y: y0 };
      const toucheds = Matter.Query.point(engine.world.bodies, point);
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

const SCALE = 1
const sp = {
  x: 192 / SCALE,
  y: 192 / SCALE
};
const cueStart = {
  x: 508 / SCALE,
  y: 192 / SCALE
};
const ballRadius = 1;
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

const Boxes = connect(state => ({
  boxes: state.get('physics').get('boxes'),
}))(({ boxes }) =>
  <View style={Styles.container}>
    {boxes.map((box, index) => {
      const x = box.get('position').get('x');
      const y = box.get('position').get('y');
      const angle = box.get('angle');
      return (
        <View
          key={`box-${index}`}
          style={{
            position: 'absolute',
            transform: [{ rotate: `${180 / Math.PI * angle}deg` }],
            left: x - 0.5 * boxProps[index].size,
            top: y - 0.5 * boxProps[index].size,
            width: boxProps[index].size,
            height: boxProps[index].size,
            backgroundColor: boxProps[index].color,
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
    style={[Styles.container, { backgroundColor: '#000' }]}>
    <Ground />
    <Boxes />
  </View>;
