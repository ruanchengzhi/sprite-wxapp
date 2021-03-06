// const app = getApp()
const spritejs = require('../../lib/sprite-wxapp');

const {Scene, Sprite} = spritejs;

Page({
  data: {
    layers: ['fglayer'],
  },
  onReady() {
    const scene = new Scene();
    const width = scene.resolution[0],
      height = scene.resolution[1];

    console.log(scene.viewport, scene.resolution);

    const layer = scene.layer('fglayer');
    console.log(layer.outputContext.ellipse);
    layer.append(new Sprite({
      pos: [0, 0],
      size: [100, 100],
      bgcolor: 'red',
      fillColor: '#29AB63',
      borderRadius: 0.2,
    }));
    console.log(layer.context);
    const s = new Sprite();
    s.attr({
      anchor: 0.5,
      pos: [width / 2, height / 2],
      size: [100, 100],
      bgcolor: 'red',
    });
    layer.append(s);
  },
});