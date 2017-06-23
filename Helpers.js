radius = 10
const polarToCartesian = (radius, theta) => {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
};



