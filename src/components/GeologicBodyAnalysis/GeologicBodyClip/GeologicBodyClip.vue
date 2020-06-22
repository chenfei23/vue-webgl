<template>
  <div id="GeologicBodyClip-panel" class="sm-GeologicBodyClip-panel">
    <div
      class="sm-GeologicBodyClip-toggle-btn"
      @click="toggleVisibility"
      :class="{'sm-GeologicBodyClip-toggle-btn-only': !show}"
    >
      <span class="iconfont iconVue-shadowquery"></span>
    </div>
    <div
      class="sm-GeologicBodyClip-content"
      :class="{'sm-GeologicBodyClip-content-hidden' : !show}"
    >
      <div class="sm-GeologicBodyClip-panel-header">
        <span>地质体裁剪</span>
      </div>
      <div class="sm-function-module-content">
        <div class="sm-function-module-sub-section">
          <div class="sm-point"></div>
          <label class="sm-function-module-sub-section-setting">参数设置</label>
        </div>

        <div class="sm-function-module-sub-section">
          <div>
            <label class="sm-function-module-sub-section-caption">开挖深度(米):</label>
            <input
              v-model="depth"
              type="number"
              class="sm-GeologicBodyClip-input"
              style="margin-left:8px"
            />
          </div>
          <div>
            <label class="sm-function-module-sub-section-caption">Z方向拉伸高度</label>
            <input v-model="stretchHeight" type="number" class="sm-GeologicBodyClip-input" />
          </div>
        </div>

        <div>
          <button type="button" class="sm-GeologicBodyClip-btn" id="addhole" v-on:click="addhole">钻孔</button>
          <button type="button" class="sm-GeologicBodyClip-btn" id="profile" v-on:click="profile">剖切</button>
          <button type="button" class="sm-GeologicBodyClip-btn" id="clip" v-on:click="clip">裁剪</button>
          <button type="button" class="sm-GeologicBodyClip-btn" id="dlg" v-on:click="dlg">开挖</button>
          <button type="button" class="sm-GeologicBodyClip-btn" id="clear" @click="clear">清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "sm-scene-geologicbodyclip",
  props: {
    modelurls: {
      type: Array,
      required: true,
      default: []
    }
  },
  data() {
    return {
      show: true,
      clipMode: Cesium.ClippingType.KeepInside,
      solidModelsProfile: null,
      tooltip: null,

      modelUrls: null,
      handlerPolygon: null,
      handlerPoint: null,
      handlerLine: null,
      pointsArray: [],
      stretchHeight: 1,
      depth: 500
    };
  },
  components: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let that = this;

      if (window.viewer) {
        // scene.logarithmicDepthBuffer = true;
        // scene.camera.frustum.near = 0.1;
        scene.globe.show = false;

        this.tooltip = createTooltip(document.body);
        this.solidModelsProfile = new Cesium.SolidModelsProfile(scene);

        this.showModel();

        this.handlerPolygon = new Cesium.DrawHandler(
          viewer,
          Cesium.DrawMode.Polygon,
          0
        );
        let handlerPolygon = this.handlerPolygon;
        handlerPolygon.activeEvt.addEventListener(function(isActive) {
          if (isActive == true) {
            viewer.enableCursorStyle = false;
            viewer._element.style.cursor = "";
            document.body.classList.add("drawCur");
          } else {
            viewer.enableCursorStyle = true;
            document.body.classList.remove("drawCur");
          }
        });

        handlerPolygon.movingEvt.addEventListener(function(windowPosition) {
          if (handlerPolygon.isDrawing) {
            that.tooltip.showAt(
              windowPosition,
              "<p>绘制多边形，</p><p>右键结束绘制.</p>"
            );
          } else {
            that.tooltip.showAt(windowPosition, "<p>点击绘制第一个点</p>");
          }
        });

        handlerPolygon.drawEvt.addEventListener(function(result) {
          var point3dsArray = [];
          var polygon = result.object;
          var positions = [].concat(polygon.positions);
          var point3ds = new Cesium.Point3Ds();

          for (var i = 0; i < positions.length; i++) {
            var cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            var pntx = Cesium.Math.toDegrees(cartographic.longitude);
            var pnty = Cesium.Math.toDegrees(cartographic.latitude);
            var pntz = cartographic.height + 1000;
            var pnt = new Cesium.Point3D(pntx, pnty, pntz);

            point3ds.add(pnt);
          }
          point3dsArray.push(point3ds);
          var geometry = new Cesium.GeoRegion3D(point3dsArray);
          if (
            that.solidModelsProfile.clippingType ==
            Cesium.ModifyRegionMode.CLIP_OUTSIDE
          ) {
            geometry.extrudedHeight = -that.depth;
          } else {
            geometry.extrudedHeight = -7000;
          }

          geometry.isLatLon = false;
          that.solidModelsProfile.setClipGeometry(geometry);
          //封底
          var geometry2 = new Cesium.GeoRegion3D(point3dsArray);
          geometry2.isLatLon = false;
          if (
            that.solidModelsProfile.clippingType ==
            Cesium.ModifyRegionMode.CLIP_OUTSIDE
          ) {
            geometry2.bottomAltitude = geometry.extrudedHeight;
            that.solidModelsProfile.addProfileGeometry(geometry2);
          }

          for (var i = 0; i < positions.length; i++) {
            var singleA = [];
            singleA.push(positions[i]);

            if (i == positions.length - 1) {
              singleA.push(positions[0]);
            } else {
              singleA.push(positions[i + 1]);
            }
            that.solidModelsProfile.addProfileGeometry(singleA);
            that.solidModelsProfile.build();
          }

          that.handlerPolygon.clear();
          that.handlerPolygon.deactivate();
          that.tooltip.setVisible(false);
        });

        this.handlerPoint = new Cesium.DrawHandler(
          viewer,
          Cesium.DrawMode.Point
        );
        let handlerPoint = this.handlerPoint;
        handlerPoint.activeEvt.addEventListener(function(isActive) {
          if (isActive == true) {
            viewer.enableCursorStyle = false;
            viewer._element.style.cursor = "";
            document.body.classList.add("drawCur");
          } else {
            viewer.enableCursorStyle = true;
            document.body.classList.remove("drawCur");
          }
        });
        handlerPoint.movingEvt.addEventListener(function(windowPosition) {
          that.tooltip.showAt(
            windowPosition,
            "<p>点击绘制多个点，右键结束</p>"
          );
        });

        handlerPoint.drawEvt.addEventListener(function(result) {
          var point = Cesium.Cartesian3.clone(result.object.position);
          that.pointsArray.push(point);

          that.handlerPoint.activate(); //再激活，画多个钻孔
        });

        //画点，右键结束
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction(function(movement) {
          that.tooltip.setVisible(false);
          that.handlerPoint.deactivate();

          for (var i = 0; i < that.pointsArray.length; i++) {
            var point = that.pointsArray[i];
            var cartographic = Cesium.Cartographic.fromCartesian(point);
            var pntx = Cesium.Math.toDegrees(cartographic.longitude);
            var pnty = Cesium.Math.toDegrees(cartographic.latitude);
            var pntz = cartographic.height - 1000;

            var geoCylinder = new Cesium.GeoCylinder(400.0, 400.0, 4000.0);
            geoCylinder.geoPosition = new Cesium.Point3D(pntx, pnty, pntz);
            that.solidModelsProfile.addProfileGeometry(geoCylinder);
          }
          that.solidModelsProfile.build();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        //画线，用于剖切地质体
        this.handlerLine = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Line);
        let handlerLine = this.handlerLine;
        handlerLine.activeEvt.addEventListener(function(isActive) {
          if (isActive == true) {
            viewer.enableCursorStyle = false;
            viewer._element.style.cursor = "";
            document.body.classList.add("drawCur");
          } else {
            viewer.enableCursorStyle = true;
            document.body.classList.remove("drawCur");
          }
        });

        handlerLine.movingEvt.addEventListener(function(windowPosition) {
          if (handlerLine.isDrawing) {
            that.tooltip.showAt(
              windowPosition,
              "<p>一次绘制两个点作为一个剖面</p>"
            );
          } else {
            that.tooltip.showAt(windowPosition, "<p>点击绘制第一个点</p>");
          }
        });

        handlerLine.drawEvt.addEventListener(function(result) {
          that.tooltip.setVisible(false);
          for (var i = 0; i < result.object.positions.length - 1; i++) {
            var point1 = result.object.positions[i];
            var point2 = result.object.positions[i + 1];

            var pointArray = [];
            pointArray.push(point1);
            pointArray.push(point2);

            that.solidModelsProfile.addProfileGeometry(pointArray);
            that.solidModelsProfile.build();
          }
        });
      } else {
        setTimeout(() => {
          that.init();
        }, 2000);
      }
    },

    showModel() {
      let modelUrls = this.modelUrls;
      var models = [];
      // 也可以不设置纹理，设置颜色
      models.push({
        model: modelUrls[0],
        color: new Cesium.Color(179 / 255, 179 / 255, 179 / 255, 1)
      });
      models.push({
        model: modelUrls[1],
        color: new Cesium.Color(94 / 255, 179 / 255, 59 / 255, 1)
      });
      models.push({
        model: modelUrls[2],
        color: new Cesium.Color(52 / 255, 94 / 255, 35 / 255, 1)
      });
      models.push({
        model: modelUrls[3],
        color: new Cesium.Color(115 / 255, 115 / 255, 115 / 255, 1)
      });
      models.push({
        model: modelUrls[4],
        color: new Cesium.Color(171 / 255, 85 / 255, 66 / 255, 1)
      });
      models.push({
        model: modelUrls[5],
        color: new Cesium.Color(68 / 255, 68 / 255, 68 / 255, 1)
      });

      this.solidModelsProfile.addModels(models);
    },
    clip() {
      this.solidModelsProfile.clippingType =
        Cesium.ModifyRegionMode.CLIP_INSIDE;
      this.handlerPolygon.activate();
    },
    dlg() {
      this.solidModelsProfile.clippingType =
        Cesium.ModifyRegionMode.CLIP_OUTSIDE;
      this.handlerPolygon.activate();
    },
    addhole() {
      this.handlerPoint.activate();
    },
    profile() {
      this.handlerLine.activate();
    },
    clear() {
      this.tooltip.setVisible(false);
      this.solidModelsProfile.clear();
      this.handlerPolygon.deactivate();
      this.handlerPolygon.clear();
      this.pointsArray = [];
      this.handlerPoint.deactivate();
      this.handlerPoint.clear();
      this.handlerLine.deactivate();
      this.handlerLine.clear();
      this.stretchHeight = 1;
      this.depth = 500;
      this.showModel();
    },
    closetoolbar() {
      this.show = false;
    },
    destory() {
      this.clear();
      if (this.solidModelsProfile) {
        this.solidModelsProfile.destory();
        this.solidModelsProfile = undefined;
      }
    },
    toggleVisibility() {
      this.show = !this.show;
    }
  },
  watch: {
    modelurls: {
      immediate: true,
      handler: function(newValue, oldValue) {
        if (newValue) {
          this.modelUrls = newValue;
        }
      }
    },
    depth: function(newValue) {},
    stretchHeight: function(newValue) {
      for (let url of this.modelUrls) {
        let instance = this.solidModelsProfile._s3mInstanceCollection._group[
          url
        ].instances._array[0];
        instance.updateScale(new Cesium.Cartesian3(1, 1, newValue));
      }
    }
  }
};
</script>


</script>
<style lang="scss" scoped>
@import "GeologicBodyClip";
</style>