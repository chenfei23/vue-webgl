<template>
  <div id="cesiumContainer" ref="viewer">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "sm-viewer",
  props: {
    cameraposition: {
      type: Object
    },
    terrainprovider: {
      type: Object
    },
    imageryproviders: {
      type: Object
    },
    sceneurl: {
      type: String
    },
    s3mscps: {
      type: Array
    }
  },
  data() {
    return {};
  },
  methods: {
    init() {
      if (window.viewer) {
        return;
      }
      let viewer = new Cesium.Viewer(this.$refs.viewer, {
        selectionIndicator: false,
        infoBox: false
      });
      let that = this;
      let scene = viewer.scene;
      viewer.scene.debugShowFramesPerSecond = true;
      window.viewer = viewer;
      window.scene = scene;
      let widget = viewer.cesiumWidget;

      // //扩展globe的viewer属性，方便其他组件调用
      // this.$set(this.$globe, "viewer", viewer);
      // this.$set(this.$globe, "scene", viewer.scene);

      //bingmap
      viewer.imageryLayers.addImageryProvider(
        new Cesium.BingMapsImageryProvider({
          url: "https://dev.virtualearth.net",
          mapStyle: Cesium.BingMapsStyle.AERIAL,
          key: URL_CONFIG.BING_MAP_KEY
        })
      );

      //定位
      if (this.$props.cameraposition) {
        scene.camera.setView(this.$props.cameraposition);
      }

      //打开场景
      let promiseArray = [];
      try {
        if (this.$props.sceneurl) {
          promiseArray.push(scene.open(this.sceneurl));
        } else if (this.$props.s3mscps) {
          //加载scps
          let scps = this.$props.s3mscps;
          scps.forEach(element => {
            promiseArray.push(
              scene.addS3MTilesLayerByScp(element.url, element.options)
            );
          });

          // for (let i = 0; i < scps.urls.length; i++) {
          //   promiseArray.push(
          //     scene.addS3MTilesLayerByScp(scps[i].url, scps[i].options)
          //   );
          // }
        }
        Cesium.when.all(
          promiseArray,
          function(layers) {
            that.$emit("loaded", true); //触发父组件中的自定义事件
            window.layers = scene.layers;
          },
          function(e) {
            if (widget._showRenderLoopErrors) {
              let title =
                "加载SCP失败，请检查网络连接状态或者url地址是否正确？";
              widget.showErrorPanel(title, undefined, e);
            }
          }
        );
      } catch (e) {
        if (widget._showRenderLoopErrors) {
          let title = "渲染时发生错误，已停止渲染。";
          widget.showErrorPanel(title, undefined, e);
        }
      }

      // if (this.$props.sceneurl) {
      //   var promise = viewer.scene.open(this.$props.sceneurl);

      //   Cesium.when(promise, function(layers) {
      //     window.layers = scene.layers;
      //     that.$emit("loaded", true); //触发父组件中的自定义事件
      //   });
      // }

      //加载影像
      if (this.$props.imageryproviders) {
        if (this.$props.imageryproviders instanceof Array) {
          this.$props.imageryproviders.forEach(element => {
            viewer.imageryLayers.addImageryProvider(
              new Cesium.SuperMapImageryProvider(element)
            );
          });
        } else {
          var imagerylayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.SuperMapImageryProvider(this.$props.imageryproviders)
          );
          viewer.flyTo(imagerylayer);
        }
      }
    }
  },
  watch: {},

  mounted() {
    this.init();
  }
};
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
