# spritejs 微信小程序版

这是 [spritejs](https://github.com/spritejs/spritejs) 的微信小程序版

目前支持 spritejs v 1.16.0 的大部分功能，具体可以参考[帮助文档](https://github.com/spritejs/spritejs/tree/master/docs#%E6%95%B4%E4%BD%93%E7%BB%93%E6%9E%84)

## 特性

- Sprite属性更新自动（分批）重绘
- 以rpx为默认单位
- 动画支持web animation api
- 支持事件机制

## 快速使用

[下载](https://s3.ssl.qhres.com/!bb02c2e7/sprite-wxapp.js)

将文件保存到小程序对应的目录（比如lib目录下），然后使用：

```js
const spritejs = requrie('../../lib/sprite-wxapp')
```

加载整个代码库

```js
//index.js
//获取应用实例
const app = getApp()
const spritejs = require('../../lib/spritejs')

Page({
  data: {
    layers: ['fglayer'],
  },
  onTouchStart: function(event) {
    const {x, y} = event.touches[0]
    const [layerX, layerY] = this.scene.toLocalPos(x, y)
    // 派发 touchstart 事件
    this.scene.layer('fglayer').dispatchEvent('touchstart', {originEvent: event, layerX, layerY})
  },
  onReady: function() { 
    const scene = new spritejs.Scene(1)
    this.scene = scene
    
    // 预加载资源
    scene.preload(['../../assets/img/birds.png', require('../../assets/img/birds.json.js')])
    
    const bird = new spritejs.Sprite('bird1.png')
    bird.attr({
      anchor: [0.5, 0.5],
      pos: [100, 200],
    })

    // 添加 ontouch 事件
    bird.on('touchstart', evt => {
      console.log(evt)
    })

    // 纹理动画
    let i = 0
    setInterval(() => {
      bird.textures = [`bird${i++%3+1}.png`]
    }, 100)

    // 添加文字
    const text = new spritejs.Label('Hello\n World!')
    text.attr({
      //anchor: [0.5, 0.5],
      font: '44px Arial',
      border: [2, 'red'],
    })

    const posFrom = [0, 0]
    const posTo = [100, 0]

    // 播放一个移位动画
    text.animate([
      {pos: posFrom},
      {pos: posTo},
    ], {
      duration: 2000
    })

    // 将两个精灵添加到 layer
    layer.append(bird, text)
  },
})
```

## 小程序版与原版限制/差异

1. Scene 的参数差异

不同于web/node版，小程序版的Scene构造函数只支持一个参数vwRate，默认vwRate=1.0，此时Scene中的精灵默认单位为rpx，即画布上元素大小为1时，实际呈现效果为1rpx。rpx是微信小程序特有的单位，具体描述参考[文档](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxss.html)。

```js
const scene = new Scene(2.0) //设置为2rpx，相当于屏幕宽度对应canvas宽度为325
```

当Scene的vwRate参数为其他非0数值时，实际精灵的默认单位为vwRate * 1rpx，例如设置vwRate=2.0，那么精灵的默认单位则为2rpx。

2. 事件处理的差异

小程序版不提供Scene.prototype.delegateEvent来自动代理事件，微信小程序事件直接调用layer.dispatchEvent分发到相应的层。因为微信小程序的机制限制，目前只有将事件绑定在canvas对象上的touch\*事件才可以获取事件相对于canvas元素的坐标，而tap、longtap等事件拿不到相对于canvas坐标。当然如果canvas是全屏展示，我们也可以拿clientX、clientY代替。

```html
<!--index.wxml-->
<view class="container" id="container">
  <block wx:for="{{layers}}" wx:key="{{item}}">
    <canvas canvas-id="{{item}}" bindtouchstart="touched"></canvas>
  </block>
</view>
```

```js
//index.js
//获取应用实例
const app = getApp()
const spritejs = require('../../lib/spritejs')

Page({
  data: {
    layers: ['fglayer'],
  },
  touched: function(event) {
    const {x, y} = event.touches[0]
    const [layerX, layerY] = this.scene.toLocalPos(x, y)
    // 传递 layerX、layerY，以使得 layer 中的 sprite 能够捕获到事件
    this.scene.layer('fglayer').dispatchEvent('tap', {originEvent: event, layerX, layerY})
  },
  onReady: function() { 
    const scene = new spritejs.Scene(1)
    this.scene = scene

    const layer = scene.layer('fglayer')
    
    ...
  },
})
```

3. layer的canvas元素需要预先创建

微信不支持动态创建元素，因此canvas要先在模板里创建好，并赋给对应的canvas-id。

4. Sprite图片支持的限制

目前不支持远程url的加载，只支持本地图片素材，另外web/node版的Sprite可以预加载图片并获得图片宽高，所以sprite可以默认自适应宽高，而微信小程序版除非使用texturepacker打包图片，否则不能获得默认的宽高，必须指定宽高才可以将sprite对象显示出来。

```js
// 微信小程序版的 scene.preload 是同步的
scene.preload(['../../assets/img/birds.png', require('../../assets/img/birds.json.js')])

const sprite1 = new Sprite('bird1.png') 
sprite1.attr({
  pos: [0, 0],
})
// 从frames中加载的图片有默认大小，可以正常显示
scene.layer().append(sprite1)

const sprite2 = new Sprite('../../assets/img/rambda.png')
sprite2.attr({
  pos: [50, 50],
  size: [100, 100], // 非frames的图片必须指定宽高
})

scene.layer().append(sprite2)
```

5. 目前不支持的特性

高级的Path、Axis和Group类型暂时不支持。

滤镜filter暂时不支持。

微信版不支持sprite的缓存。

6. 小程序canvas的bug

在某些真机上（比如iphone7），context.clip有bug，会让context.restore失效，因此只能先禁用clip，这会导致圆角的元素中间有texture时产生错误的结果。
