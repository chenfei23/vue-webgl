<template>
  <div id="sightline-panel" class="sm-sightline-panel">
    <div
      class="sm-sightline-toggle-btn"
      @click="toggleVisibility"
      :class="{'sm-sightline-toggle-btn-only': !show}"
    >
      <span class="iconfont iconVue-sightline"></span>
    </div>
    <div class="sm-sightline-content" :class="{'sm-sightline-content-hidden' : !show}">
      <div class="sm-sightline-panel-header">
        <span>通视分析</span>
      </div>
      <div class="sm-function-module-content">
        <div class="sm-point"></div>
        <label class="sm-function-module-sub-section-setting">观察者信息</label>
        <div class="sm-function-module-sub-section">
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">经度(°)</label>
              <input
                v-model="viewlongitude"
                type="text"
                id="sightline-observation-place-x"
                class="sm-input-right"
              />
            </div>
            <div class="sm-half">
              <label class="sm-sightline-label-right">纬度(°)</label>
              <input
                v-model="viewlatitude"
                type="text"
                id="sightline-observation-place-y"
                class="sm-input-right"
              />
            </div>
          </div>
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">高程(m)</label>
              <input
                v-model="viewheight"
                type="text"
                id="sightline-observation-place-z"
                class="sm-input-right"
              />
            </div>
          </div>
        </div>

        <div class="sm-point"></div>
        <label class="sm-function-module-sub-section-setting">参数设置</label>
        <div class="sm-function-module-sub-section">
          <div>
            <label class="sm-function-module-sub-section-caption">可见区域颜色</label>
            <ColorPicker id="visibleColor" class="sm-colorpicker" v-model="visibleColor" alpha />
          </div>
          <div>
            <label class="sm-function-module-sub-section-caption">不可视颜色</label>
            <ColorPicker id="hiddenColor" class="sm-colorpicker" v-model="hiddenColor" alpha />
          </div>
          <div>
            <label class="sm-function-module-sub-section-caption">障碍物高亮颜色</label>
            <ColorPicker
              id="highlightBarrierColor"
              class="sm-colorpicker"
              v-model="highlightBarrierColor"
              alpha
            />
          </div>

          <div>
            <input type="checkbox" id="highlightBarrier" checked v-model="highlightBarrier" />
            <label class="sm-function-module-sub-section-caption">高亮显示障碍物</label>
          </div>
        </div>

        <div>
          <button
            type="button"
            class="sm-sightline-btn function-module-btn-highlight"
            id="clear"
            @click="clear"
          >清除</button>
          <button type="button" class="sm-sightline-btn" id="analysis" v-on:click="analysis">分析</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>

let sightline;

export default {
  name: "sm-scene-sightline",
  data() {
    return {
      show: true,
      viewPosition: {},

      HandlerFlag: true,
      clickFlag: 0,
      screenSpaceEventHandler: null,
      sightLineHandler: null,
      pointHandler: null,

      viewlongitude: 0,
      viewlatitude: 0,
      viewheight: 0,
      visibleColor: "rgb(0, 200, 0)",
      hiddenColor: "rgb(200, 0, 0)",
      highlightBarrierColor: "rgba(255, 186, 1, 1)",
      highlightBarrier: false
    };
  },
  components: {},
  mounted() {
    
  },
  methods: {
    init() {
      var scene = viewer.scene;
      for (var layer of scene.layers.layerQueue) {
        layer.removeAllObjsColor();
      }
      if (!sightline) {
        sightline = new Cesium.Sightline(scene);
        sightline.build();
      }
      this.clickFlag += 1;
      sightline.removeAllTargetPoint();
      sightline.visibleColor = Cesium.Color.fromCssColorString(
        this.visibleColor
      );
      sightline.hiddenColor = Cesium.Color.fromCssColorString(this.hiddenColor);

      viewer.entities.removeAll();

      this.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
        scene.canvas
      );
      let screenSpaceEventHandler = this.ScreenSpaceEventHandler;

      this.sightLineHandler = new Cesium.DrawHandler(
        viewer,
        Cesium.DrawMode.Line
      );
      let sightLineHandler = this.sightLineHandler;
      sightLineHandler.activeEvt.addEventListener(function(isActive) {
        if (isActive == true) {
          viewer.enableCursorStyle = false;
          viewer._element.style.cursor = "";
          document.body.classList.add("drawCur");
        } else {
          viewer.enableCursorStyle = true;
          document.body.classList.remove("drawCur");
        }
      });

      sightLineHandler.movingEvt.addEventListener(function(windowPosition) {
        sightLineHandler.polyline && (sightLineHandler.polyline.show = false);
      });

      let that = this;

      //画线绘制完成事件
      sightLineHandler.drawEvt.addEventListener(function(result) {
        var line = result.object;
        var endPoint = line._positions[line._positions.length - 1];
        var ecartographic = Cesium.Cartographic.fromCartesian(endPoint);
        var elongitude = Cesium.Math.toDegrees(ecartographic.longitude);
        var elatitude = Cesium.Math.toDegrees(ecartographic.latitude);
        var eheight = ecartographic.height;
        var targetPoint = [elongitude, elatitude, eheight];
        sightline.addTargetPoint({
          position: targetPoint,
          name: "point" + new Date()
        });
        that.HandlerFlag = false; //移除监听
      });

      this.pointHandler = new Cesium.PointHandler(viewer);
      let pointHandler = this.pointHandler;

      //鼠标点击第一下，调用drawEvt；再点击，调用screenSpaceEventHandler.setInputAction
      pointHandler.drawEvt.addEventListener(function(result) {
        var point = result.object;
        point.show = false;

        that.viewPosition = point;
        var position = point.position;
        var cartographic = Cesium.Cartographic.fromCartesian(position);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height;

        viewer.entities.add({
          position: position,
          point: {
            pixelSize: 10,
            color: Cesium.Color.WHITE
          }
        });

        that.viewlongitude = longitude.toFixed(6);
        that.viewlatitude = latitude.toFixed(6);
        that.viewheight = height.toFixed(6);

        sightline.viewPosition = [longitude, latitude, height];

        //可以添加多个目标点
        that.screenSpaceEventHandler.setInputAction(function(evt) {
          if (that.HandlerFlag) {
            that.sightLineHandler.polyline &&
              (that.sightLineHandler.polyline.show = false);
            var pick = viewer.scene.pickPosition(evt.position);
            var ecartographic = Cesium.Cartographic.fromCartesian(pick);
            var elongitude = Cesium.Math.toDegrees(ecartographic.longitude);
            var elatitude = Cesium.Math.toDegrees(ecartographic.latitude);
            var eheight = ecartographic.height;
            sightline.addTargetPoint({
              position: [elongitude, elatitude, eheight],
              name: "point" + new Date()
            });
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      });
    },

    analysis() {
      this.init();

      this.pointHandler.activate();
      this.sightLineHandler.activate();
    },
    clear() {
      //初始化参数
      this.viewlongitude = 0;
      this.viewlatitude = 0;
      this.viewheight = 0;

      this.visibleColor = "rgb(0, 200, 0)";
      this.hiddenColor = "rgb(200, 0, 0)";
      this.highlightBarrierColor = "rgba(255, 186, 1, 1)";
      this.highlightBarrier = false;

      this.HandlerFlag = true;

      if (this.sightLineHandler) {
        this.sightLineHandler.deactivate();
      }
      if (this.pointHandler) {
        // pointHandler.clear();
        this.pointHandler.deactivate();
      }

      viewer.entities.removeAll();
      sightline && sightline.removeAllTargetPoint();
      for (var layer of scene.layers.layerQueue) {
        layer.removeAllObjsColor();
      }
    },
    closetoolbar() {
      this.show = false;
    },
    destory() {
      this.clear();
      if (sightline) {
        sightline.destroy();
        sightline = undefined;
      }
    },
    toggleVisibility() {
      this.show = !this.show;
    }
  },
  watch: {
    visibleColor: function(newValue) {
      let color = Cesium.Color.fromCssColorString(newValue);
      if (sightline) {
        sightline.visibleColor = color;
      }
    },
    hiddenColor: function(newValue) {
      let color = Cesium.Color.fromCssColorString(newValue);
      if (sightline) {
        sightline.hiddenColor = color;
      }
    },
    highlightBarrierColor: function(newValue) {
      this.highlightBarrierColor = newValue;

      for (var layer of scene.layers.layerQueue) {
        layer.removeAllObjsColor();
      }
      if (sightline && this.highlightBarrier) {
        let color = Cesium.Color.fromCssColorString(this.highlightBarrierColor);
        try {
          let ObjectIds = sightline.getObjectIds();
          for (let index in ObjectIds) {
            let layer = viewer.scene.layers.findByIndex(Number(index) - 3); // 底层索引从3开始
            let ids = sightline.getObjectIds()[index];
            layer.setObjsColor(ids, color);
          }
        } catch (error) {}
      }
    },
    highlightBarrier: function(newValue) {
      if (sightline && newValue) {
        let color = Cesium.Color.fromCssColorString(this.highlightBarrierColor);
        try {
          let ObjectIds = sightline.getObjectIds();
          for (let index in ObjectIds) {
            let layer = viewer.scene.layers.findByIndex(Number(index) - 3); // 底层索引从3开始
            let ids = sightline.getObjectIds()[index];
            layer.setObjsColor(ids, color);
          }
        } catch (error) {}
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "SightLine";
</style>
