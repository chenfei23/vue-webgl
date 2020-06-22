# <center>@supermap/vue-iclient3d-webgl</center>

# 简介
- 官网：http://support.supermap.com.cn:8090/webglTest/examples/component/examples/examples.html#layer
- 源码：


# 安装

``` bash
npm install @supermap/vue-iclient3d-webgl
```

# 开发
#### 方法一：在 vue 工程中的main.js 中写入以下内容：


``` bash
import Vue from 'vue';
import VueiClientWebgl from '@supermap/vue-iclient3d-webgl';
import App from './App.vue';
 
Vue.use(VueiClientWebgl);
 
new Vue({
  el: '#app',
  render: h => h(App)
});
```
在 vue 工程中的App.vue 中标签引入组件：
``` bash
<template>
  <div id="app">
    <sm-viewer>
    <sm-scene-measure></sm-scene-measure>
    </sm-viewer>
  </div>
</template>
```

#### 方法二：在 html 中通过标签引入：

``` bash

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>cdn引入测试</title>

  <!-- //引入Cesium依赖 -->
  <link href="./node_modules/@supermap/iclient3d-webgl/Cesium/Widgets/widgets.css" rel="stylesheet">
  <script src="./node_modules/@supermap/iclient3d-webgl/Cesium/Cesium.js"></script>
  
  <!-- //引入Vue.js -->
  <script src="https://unpkg.com/vue/dist/vue.js"></script>

  <!-- //引入组件的库 -->
  <script src="./node_modules/@supermap/vue-iclient3d-webgl/dist/vue-iclient3d-webgl.min.js"></script>

  <link href="./node_modules/@supermap/vue-iclient3d-webgl/static/css/geoFont/iconfont.css" rel="stylesheet">

  <!-- //引入view-design控件库 -->
  <!-- import stylesheet -->
  <link rel="stylesheet" href="//unpkg.com/view-design/dist/styles/iview.css">
  <!-- import iView -->
  <script src="//unpkg.com/view-design/dist/iview.min.js"></script>


  <style>
    html,
    body,
    #app {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

  </style>
</head>

<body>
  <div id="app">
    <sm-viewer>
      <sm-measure></sm-measure>
    </sm-viewer>
  </div>

  <script>
    new Vue({
      el: '#app',
      methods: {}
    })
  </script>
</body>


</html>

  
```

# 示例
 http://support.supermap.com.cn:8090/webglTest/examples/component/examples/examples.html#layer

