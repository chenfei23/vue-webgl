<template>
  <div id="shadowquery-panel" class="sm-shadowquery-panel">
    <div
      class="sm-shadowquery-toggle-btn"
      @click="toggleVisibility"
      :class="{'sm-shadowquery-toggle-btn-only': !show}"
    >
      <span class="iconfont iconVue-shadowquery"></span>
    </div>
    <div class="sm-shadowquery-content" :class="{'sm-shadowquery-content-hidden' : !show}">
      <div class="sm-shadowquery-panel-header">
        <span>阴影分析</span>
      </div>
      <div class="sm-function-module-content">
        <div class="sm-function-module-sub-section">
          <div class="sm-point"></div>
          <label class="sm-function-module-sub-section-setting">参数设置</label>
        </div>

        <div class="sm-function-module-sub-section">
          <div class="sm-half">
            <label class="sm-function-module-sub-section-caption" style>开始时间</label>
            <select id="startTime" class="sm-shadowquery-select" v-model="startTime">
              <option value="0">0:00</option>
              <option value="2">2:00</option>
              <option value="4">4:00</option>
              <option value="6">6:00</option>
              <option value="8">8:00</option>
              <option value="10">10:00</option>
              <option value="12">12:00</option>
              <option value="14">14:00</option>
              <option value="16">16:00</option>
              <option value="18">18:00</option>
              <option value="20">20:00</option>
              <option value="22">22:00</option>
            </select>
          </div>

          <div class="sm-half">
            <label class="sm-shadowquery-label-right">结束时间</label>
            <select id="endTime" class="sm-shadowquery-select" v-model="endTime">
              <option value="0">0:00</option>
              <option value="2">2:00</option>
              <option value="4">4:00</option>
              <option value="6">6:00</option>
              <option value="8">8:00</option>
              <option value="10">10:00</option>
              <option value="12">12:00</option>
              <option value="14">14:00</option>
              <option value="16">16:00</option>
              <option value="18">18:00</option>
              <option value="20">20:00</option>
              <option value="22">22:00</option>
            </select>
          </div>
        </div>

        <div class="sm-function-module-sub-section">
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">时间间隔</label>
              <input v-model="timeInterval" type="number" class="sm-input-long" />
            </div>
            <div class="sm-half">
              <label class="sm-shadowquery-label-right">间距(米)</label>
              <input v-model="spacing" type="number" class="sm-input-long" />
            </div>
          </div>
        </div>

        <div class="sm-function-module-sub-section">
          <div>
            <div class="sm-half">
              <label class="sm-function-module-sub-section-caption">底部高程(米)</label>
              <input v-model="bottomHeight" type="number" class="sm-input-long" />
            </div>
            <div class="sm-half">
              <label class="sm-shadowquery-label-right">拉伸高度(米)</label>
              <input v-model="extrudeHeight" type="number" class="sm-input-long" />
            </div>
          </div>
        </div>

        <div>
          <input type="checkbox" id="sunlight" checked v-model="sunlight" />
          <label class="sm-function-module-sub-section-caption">日照效果</label>
        </div>

        <div>
          <button
            type="button"
            class="sm-shadowquery-btn sm-function-module-btn-highlight"
            id="clear"
            @click="clear"
          >清除</button>
          <button type="button" class="sm-shadowquery-btn" id="analysis" v-on:click="analysis">分析</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

let shadowQuery;

export default {
  name: "sm-scene-shadowquery",
  data() {
    return {
      show: true,

      handlerPolygon: null,
      positions: [],
      points: [],

      timeInterval: 60,
      spacing: 10,

      selDate: new Date(),
      startTime: "10",
      endTime: "14",

      bottomHeight: 20,
      extrudeHeight: 20,
      sunlight: false
    };
  },
  components: {},
  mounted() {
   
  },
  methods: {
    init() {
      if (viewer.shadows == false) {
        viewer.shadows = true; //开启场景阴影
      }
      var scene = viewer.scene;
      var layers = scene.layers.layerQueue;

      for (var i = 0; i < layers.length; i++) {
        layers[i].shadowType = 2;
        layers[i].refresh();
      }
      //创建阴影查询对象
      if (!shadowQuery) {
        shadowQuery = new Cesium.ShadowQueryPoints(scene);
        shadowQuery.build();
      }

      let that = this;

      this.setCurrentTime();

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

      handlerPolygon.drawEvt.addEventListener(function(result) {
        let positions = that.positions;
        let points = that.points;

        points.length = 0;
        var polygon = result.object;
        if (!polygon) {
          return;
        }
        polygon.show = false;
        handlerPolygon.polyline.show = false;
        positions = [].concat(polygon.positions);
        positions = Cesium.arrayRemoveDuplicates(
          positions,
          Cesium.Cartesian3.equalsEpsilon
        );
        //遍历多边形，取出所有点
        for (var i = 0, len = positions.length; i < len; i++) {
          //转化为经纬度，并加入至临时数组
          var cartographic = Cesium.Cartographic.fromCartesian(
            polygon.positions[i]
          );
          var longitude = Cesium.Math.toDegrees(cartographic.longitude);
          var latitude = Cesium.Math.toDegrees(cartographic.latitude);
          points.push(longitude);
          points.push(latitude);
        }
        //设置分析对象的开始结束时间
        var dateValue = that.selDate;
        var st = new Date(dateValue);
        st.setHours(Number(that.startTime));
        shadowQuery.startTime = Cesium.JulianDate.fromDate(st);

        var et = new Date(dateValue);
        et.setHours(Number(that.endTime));
        shadowQuery.endTime = Cesium.JulianDate.fromDate(et);

        //设置当前时间
        that.setCurrentTime();

        shadowQuery.spacing = that.spacing;
        shadowQuery.timeInterval = that.timeInterval;

        //设置分析区域、底部高程和拉伸高度
        var bh = Number(that.bottomHeight);
        var eh = Number(that.extrudeHeight);
        shadowQuery.qureyRegion({
          position: points,
          bottom: bh,
          extend: eh
        });
        shadowQuery.build();
      });
    },
    setCurrentTime() {
      var et = this.selDate;
      et.setHours(Number(this.endTime));
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(et);
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;
    },
    analysis() {
      this.init();
      this.handlerPolygon.deactivate();
      this.handlerPolygon.activate();
    },
    clear() {
      if (this.handlerPolygon) {
        this.handlerPolygon.deactivate();
      }

      viewer.entities.removeAll();

      let layers = scene.layers.layerQueue;
      for (var i = 0; i < layers.length; i++) {
        layers[i].shadowType = 0;
      }
      if (shadowQuery) {
        shadowQuery.qureyRegion({
          position: [0, 0],
          bottom: 0,
          extend: 0
        });
      }

      this.positions = [];
      this.points = [];
      this.selDate = new Date();
      this.startTime = "10";
      this.endTime = "14";

      this.timeInterval = 60;
      this.spacing = 10;
      this.bottomHeight = 20;
      this.extrudeHeight = 20;
      this.sunlight = false;
    },
    closetoolbar() {
      this.show = false;
    },
    destory() {
      this.clear();
      if (shadowQuery) {
        shadowQuery.destory();
        shadowQuery = undefined;
      }
    },
    toggleVisibility() {
      this.show = !this.show;
    }
  },
  watch: {
    selDate: function(newValue) {},
    startTime: function(newValue) {
      var st = this.selDate;
      st.setHours(Number(newValue));
      shadowQuery.startTime = Cesium.JulianDate.fromDate(st);
    },
    endTime: function(newValue) {
      var et = this.selDate;
      et.setHours(Number(newValue));
      shadowQuery.endTime = Cesium.JulianDate.fromDate(et);
    },
    timeInterval: function(newValue) {
      shadowQuery.timeInterval = Number(newValue);
      // var bh = Number(this.bottomHeight);
      // var eh = Number(this.extrudeHeight);
      // shadowQuery.qureyRegion({
      //   position: this.points,
      //   bottom: bh,
      //   extend: eh
      // });
      shadowQuery.build();
    },
    spacing: function(newValue) {
      shadowQuery.spacing = Number(newValue);
      // var bh = Number(this.bottomHeight);
      // var eh = Number(this.extrudeHeight);
      // shadowQuery.qureyRegion({
      //   position: this.points,
      //   bottom: bh,
      //   extend: eh
      // });
      shadowQuery.build();
    },
    bottomHeight: function(newValue) {
      var bh = Number(newValue);
      var eh = Number(this.extrudeHeight);
      shadowQuery.qureyRegion({
        position: this.points,
        bottom: bh,
        extend: eh
      });
      shadowQuery.build();
    },
    extrudeHeight: function(newValue) {
      var bh = Number(this.bottomHeight);
      var eh = Number(newValue);
      shadowQuery.qureyRegion({
        position: this.points,
        bottom: bh,
        extend: eh
      });
      shadowQuery.build();
    },
    sunlight: function(newValue) {
      if (newValue) {
        var dateVal = this.selDate;
        var startTime = new Date(dateVal);
        var endTime = new Date(dateVal);
        var shour = Number(this.startTime);
        var ehour = Number(this.endTime);

        let layers = scene.layers.layerQueue;
        for (var i = 0; i < layers.length; i++) {
          layers[i].shadowType = 0;
        }

        if (shour > ehour) {
          return;
        }

        var nTimer = 0.0;
        var nIntervId = setInterval(function() {
          if (shour < ehour) {
            startTime.setHours(shour);
            startTime.setMinutes(nTimer);
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(startTime);
            nTimer += 10.0;
            if (nTimer > 60.0) {
              shour += 1.0;
              nTimer = 0.0;
            }
          } else {
            clearInterval(nIntervId);
          }
        }, 20);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "shadowquery";
</style>
