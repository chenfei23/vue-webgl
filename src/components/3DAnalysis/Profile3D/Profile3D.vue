<template>
  <div id="profile3d-panel" class="sm-profile3d-panel">
    <div
      class="sm-profile3d-toggle-btn"
      @click="toggleVisibility"
      :class="{'sm-profile3d-toggle-btn-only': !show}"
    >
      <span class="iconfont iconVue-Profile"></span>
    </div>
    <div class="sm-profile3d-content" :class="{'sm-profile3d-content-hidden' : !show}">
      <div class="sm-profile3d-panel-header">
        <span>剖面分析</span>
      </div>
      <div class="sm-function-module-content">
        <div class="sm-point"></div>
        <label class="sm-function-module-sub-section-setting">起点信息</label>
        <div class="sm-function-module-sub-section">
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">经度(°)</label>
              <input
                v-model="startlongitude"
                type="text"
                id="profile3d-observation-place-x"
                class="sm-input-right"
              />
            </div>
            <div class="sm-half">
              <label class="sm-profile3d-label-right">纬度(°)</label>
              <input
                v-model="startlatitude"
                type="text"
                id="profile3d-observation-place-y"
                class="sm-input-right"
              />
            </div>
          </div>
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">高程(m)</label>
              <input
                v-model="startheight"
                type="text"
                id="profile3d-observation-place-z"
                class="sm-input-right"
              />
            </div>
          </div>
        </div>

        <div class="sm-point"></div>
        <label class="sm-function-module-sub-section-setting">终点信息</label>
        <div class="sm-function-module-sub-section">
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">经度(°)</label>
              <input v-model="endlongitude" type="text" class="sm-input-right" />
            </div>
            <div class="sm-half">
              <label class="sm-profile3d-label-right">纬度(°)</label>
              <input v-model="endlatitude" type="text" class="sm-input-right" />
            </div>
          </div>
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">高程(m)</label>
              <input v-model="endheight" type="text" class="sm-input-right" />
            </div>
          </div>
        </div>

        <div>
          <input type="checkbox" id="profileLine" checked v-model="profileLine" />
          <label class="function-module-sub-section-caption">查看剖面信息</label>
        </div>

        <div id="proForm" v-show="profileLine">
          <label class="function-module-sub-section-caption">剖面信息</label>
          <div id="chart">
            <canvas id="pro" height="0" width="0"></canvas>
          </div>
        </div>

        <div>
          <button
            type="button"
            class="sm-profile3d-btn sm-function-module-btn-highlight"
            id="clear"
            @click="clear"
          >清除</button>
          <button type="button" class="sm-profile3d-btn" id="analysis" v-on:click="analysis">分析</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let myChart;

export default {
  name: "sm-scene-profile3d",
  props: {},
  data() {
    return {
      show: true,
      profurl: "",
      viewPosition: {},
      resultObject: null,

      handlerLine: null,

      startlongitude: 0,
      startlatitude: 0,
      startheight: 0,
      endlongitude: 0,
      endlatitude: 0,
      endheight: 0,
      profileLine: false,
      crossProfile: null
    };
  },
  components: {},
  mounted() {},
  methods: {
    init() {
      this.viewPosition = [];

      if (this.handlerLine) {
        this.handlerLine.clear();
      }
      this.handlerLine = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Line);
      let handlerLine = this.handlerLine;

      let that = this;

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
      handlerLine.movingEvt.addEventListener(function(windowPosition) {});

      handlerLine.drawEvt.addEventListener(function(result) {
        that.resultObject = result.object;

        var linePosition = result.object ? result.object.positions : result;
        var startPoint = linePosition[0];
        var endPoint = linePosition[linePosition.length - 1];

        //起止点相关信息
        var scartographic = Cesium.Cartographic.fromCartesian(startPoint);
        var slongitude = Cesium.Math.toDegrees(scartographic.longitude);
        var slatitude = Cesium.Math.toDegrees(scartographic.latitude);
        var sheight = scartographic.height;

        var ecartographic = Cesium.Cartographic.fromCartesian(endPoint);
        var elongitude = Cesium.Math.toDegrees(ecartographic.longitude);
        var elatitude = Cesium.Math.toDegrees(ecartographic.latitude);
        var eheight = ecartographic.height;

        // var profileStartPosition = slongitude.toFixed(4) + ', ' + slatitude.toFixed(4) + ', ' + sheight.toFixed(2);
        // var profileEndPosition = elongitude.toFixed(4) + ', ' + elatitude.toFixed(4) + ', ' + eheight.toFixed(2);

        that.startlongitude = slongitude.toFixed(6);
        that.startlatitude = slatitude.toFixed(6);
        that.startheight = sheight.toFixed(6);

        that.endlongitude = elongitude.toFixed(6);
        that.endlatitude = elatitude.toFixed(6);
        that.endheight = eheight.toFixed(6);

        // 剖面分析的起止点
        that.crossProfile.startPoint = [slongitude, slatitude, sheight];
        that.crossProfile.endPoint = [elongitude, elatitude, eheight];
        that.crossProfile.extendHeight = 40;
        that.crossProfile.build(); //三维剖面分析

        //分析完毕的回调函数
        that.crossProfile.getBuffer(function(buffer) {
          let crossProfile = that.crossProfile;
          var canvas = document.getElementById("pro");
          canvas.height = crossProfile._textureHeight;
          canvas.width = crossProfile._textureWidth;
          var ctx = canvas.getContext("2d");
          var imgData = ctx.createImageData(
            crossProfile._textureWidth,
            crossProfile._textureHeight
          );
          imgData.data.set(buffer);
          //在canvas上绘制图片
          ctx.putImageData(imgData, 0, 0);
          document.getElementById("pro").style.width = "300px";
          document.getElementById("pro").style.height = "150px";

          that.profileLine = true;
        });
      });
    },
    analysis() {
      this.init();

      if (!this.crossProfile) {
        this.crossProfile = new Cesium.Profile(viewer.scene);
      }
      this.handlerLine.clear();
      this.handlerLine.deactivate();
      this.handlerLine.activate();

      let that = this;

      let screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
        scene.canvas
      );
      screenSpaceEventHandler.setInputAction(function(e) {
        let handlerLine = that.handlerLine;
        if (handlerLine.polyline._actualPositions.length == 2) {
          var result = {};
          result.object = handlerLine.polyline;
          handlerLine.drawEvt.raiseEvent(result);
          handlerLine.deactivate();
          screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
          );
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    getBuffer() {},
    clear() {
      viewer.entities.removeAll();
      if (this.handlerLine) {
        this.handlerLine.clear();
      }

      this.startlongitude = 0;
      this.startlatitude = 0;
      this.startheight = 0;
      this.endlongitude = 0;
      this.endlatitude = 0;
      this.endheight = 0;

      this.profileLine = false;
      this.viewPosition = [];
    },
    closetoolbar() {
      this.show = false;
    },
    destory() {
      this.clear();
      if (this.crossProfile) {
        this.crossProfile.destroy();
        this.crossProfile = undefined;
      }
    },
    toggleVisibility() {
      this.show = !this.show;
    }
  },
  watch: {
    profileLine: function(newValue) {
      if (!newValue || !this.crossProfile) {
        return; // 没有分析结果，无法提取天际线轮廓
      }
      // 剖面数据
      let that = this;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "Profile3D";
</style>
