<template>
  <div v-if="clipBox">
    <div class="middlebox">
      <label class="label-container">长度(米) :</label>
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:73%"
        type="range"
        v-model="clipLength"
      />
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:25%; height:25px"
        type="number"
        v-model="clipLength"
      />
    </div>
    <div class="middlebox">
      <label class="label-container">宽度(米) :</label>
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:73%"
        type="range"
        v-model="clipWidth"
      />
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:25%; height:25px"
        type="number"
        v-model="clipWidth"
      />
    </div>
    <div class="middlebox">
      <label class="label-container">高度(米) :</label>
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:73%"
        type="range"
        v-model="clipHeight"
      />
      <input
        class="min-solider"
        min="0"
        step="1"
        style="width:25%; height:25px"
        type="number"
        v-model="clipHeight"
      />
    </div>
    <div class="middlebox">
      <label class="label-container">旋转(度)</label>
      <input
        class="min-solider"
        max="180"
        min="-180"
        step="1"
        style="width:73%"
        type="range"
        v-model="clipRotate"
      />
      <input
        class="min-solider"
        max="180"
        min="-180"
        step="1"
        style="width:25%; height:25px"
        type="number"
        v-model="clipRotate"
      />
    </div>
    <!--    <div class="middlebox">-->
    <!--      <label class="label-container">X轴移动(米) :</label>-->
    <!--      <input class="middle-input" type="number" v-model="moveX"  />-->
    <!--    </div>-->
    <!--    <div class="middlebox">-->
    <!--      <label class="label-container">Y轴移动(米) :</label>-->
    <!--      <input class="middle-input" type="number" v-model="moveY"  />-->
    <!--    </div>-->
    <!--    <div class="middlebox">-->
    <!--      <label class="label-container">Z轴移动(米) :</label>-->
    <!--      <input class="middle-input" type="number"  v-model="moveZ"  />-->
    <!--    </div>-->
    <div class="middlebox">
      <label class="label-container">裁剪模式:</label>
      <select class="select-container middle-input" id="fillOptions" v-model="ClipModelSelected">
        <option :value="Options.id" v-for="Options in ClipModels">{{Options.name}}</option>
      </select>
    </div>
    <div class="boxchild">
      <button @click="BoxClip" class="tbtn tbn1" type="button">裁剪</button>
      <button @click="clearBoxClip" class="tbtn" type="button">清除</button>
    </div>
  </div>
</template>

<script>
// import eventBus from "../../eventBus";

export default {
  name: "sm-scene-clipbox",
  data() {
    return {
      screenSpaceEventHandler: null,
      layers: null,
      clipBox: false,
      clipLength: 10,
      clipWidth: 10,
      clipHeight: 10,
      clipRotate: 0,
      ClipModels: [
        {
          id: "0",
          name: "不带线框盒内裁剪"
        },
        {
          id: "1",
          name: "不带线框盒外裁剪"
        },
        {
          id: "2",
          name: "带线框盒内裁剪"
        },
        {
          id: "3",
          name: "带线框盒外裁剪"
        }
      ],
      ClipModelSelected: null,
      clipModeOption: null,
      tooltip: null,
      boxEntity: null,
      hasClipLine: false,
      moveY: 0,
      moveX: 0,
      moveZ: 0
    };
  },
  methods: {
    // Box裁剪
    BoxClip() {
      this.moveX = 0;
      this.moveY = 0;
      this.moveZ = 0;
      viewer.entities.removeAll();
      // 设置裁剪线颜色
      this.setAllLayersClipColor();
      this.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
        scene.canvas
      );
      this.screenSpaceEventHandler.setInputAction(evt => {
        this.tooltip.showAt(evt.endPosition, "<p>点击模型，添加裁剪盒子</p>");
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      this.screenSpaceEventHandler.setInputAction(evt => {
        let length = Number(this.clipLength);
        let width = Number(this.clipWidth);
        let height = Number(this.clipHeight);
        if (height <= 0 || width <= 0 || length <= 0) {
          return;
        }
        let rotate = parseFloat(this.clipRotate);
        let clipModeOption = this.clipModeOption;
        let position = scene.pickPosition(evt.position);
        let boxOption = {
          dimensions: new Cesium.Cartesian3(length, width, height),
          position: position,
          clipMode: clipModeOption,
          heading: rotate
        };
        let hpr = new Cesium.HeadingPitchRoll(rotate, 0, 0);
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr
        );
        this.boxEntity = viewer.entities.add({
          box: {
            dimensions: new Cesium.Cartesian3(length, width, height),
            material: Cesium.Color.fromRandom({
              alpha: 0.2
            })
          },
          position: position,
          orientation: orientation
        });
        this.setAllLayersClipOptions(boxOption);
        this.tooltip.setVisible(false);
        this.screenSpaceEventHandler.removeInputAction(
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );
        this.screenSpaceEventHandler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    clearBoxClip() {
      if (!this.boxEntity) {
        return;
      }
      this.screenSpaceEventHandler && this.screenSpaceEventHandler.destroy();
      this.tooltip.setVisible(false);
      viewer.entities.removeAll();
      this.boxEntity = null;
      for (let layer of this.layers) {
        layer.clearCustomClipBox();
      }
    },
    setAllLayersClipOptions(boxOptions) {
      for (let layer of this.layers) {
        this.hasClipLine
          ? (layer.clipLineColor = new Cesium.Color(1, 1, 1, 1))
          : (layer.clipLineColor = new Cesium.Color(1, 1, 1, 0));
        layer.setCustomClipBox(boxOptions);
      }
    },
    setAllLayersClipColor() {
      for (let i = 0, j = this.layers.length; i < j; i++) {
        this.layers[i].selectEnabled = false;
        this.layers[i].clipLineColor = new Cesium.Color(1, 1, 1, 0.5);
      }
    },
    setClipBox() {
      let newDim = this.boxEntity.box.dimensions.getValue();
      let position = this.boxEntity.position.getValue(0);
      let clipMode = this.clipModeOption;
      let heading = Cesium.Math.toRadians(parseFloat(this.clipRotate));
      let boxOptions = {
        dimensions: newDim,
        position: position,
        clipMode: clipMode,
        heading: heading
      };
      this.setAllLayersClipOptions(boxOptions);
    },
    init() {
      let that = this;
      if (window.viewer) {
        this.ClipModelSelected = this.ClipModels[0].id;
        this.clipModeOption = "clip_behind_all_plane";
        this.layers = scene.layers.layerQueue;
        this.tooltip = createTooltip(document.body);
      } else {
        setTimeout(() => {
          that.init();
        }, 500);
      }
    }
  },
  mounted() {
    this.init();
    // eventBus.$on("init", e => {
    //   this.init();
    // });
  },
  // beforeMount() {
  //   eventBus.$emit("sendPname", {
  //     type: "clip",
  //     name: "裁剪Box",
  //     value: this.clipBox
  //   });
  //   eventBus.$on("sendCname", e => {
  //     if (e == "裁剪Box") {
  //       this.clipBox = true;
  //     } else {
  //       this.clipBox = false;
  //     }
  //   });
  // },
  watch: {
    clipLength(val) {
      if (!this.boxEntity) {
        return;
      }
      let dim = this.boxEntity.box.dimensions.getValue();
      let newVal = Number(val);
      this.boxEntity.box.dimensions = new Cesium.Cartesian3(
        newVal,
        dim.y,
        dim.z
      );
      this.setClipBox();
    },
    clipWidth(val) {
      if (!this.boxEntity) {
        return;
      }
      let dim = this.boxEntity.box.dimensions.getValue();
      let newVal = Number(val);
      this.boxEntity.box.dimensions = new Cesium.Cartesian3(
        dim.x,
        newVal,
        dim.z
      );
      this.setClipBox();
    },
    clipHeight(val) {
      if (!this.boxEntity) {
        return;
      }
      let dim = this.boxEntity.box.dimensions.getValue();
      let newVal = Number(val);
      this.boxEntity.box.dimensions = new Cesium.Cartesian3(
        dim.x,
        dim.y,
        newVal
      );
      this.setClipBox();
    },
    clipRotate(val) {
      if (!this.boxEntity) {
        return;
      }
      let position = this.boxEntity.position.getValue(0);
      let newVal = Number(val);
      let rotate = Cesium.Math.toRadians(newVal);
      let hpr = new Cesium.HeadingPitchRoll(rotate, 0, 0);
      let orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      this.boxEntity.orientation = orientation;
      this.setClipBox();
    },
    ClipModelSelected(val) {
      if (!this.boxEntity) {
        return;
      }
      switch (val) {
        case "0":
          this.hasClipLine = true;
          this.clipModeOption = "clip_behind_all_plane";
          break;
        case "1":
          this.hasClipLine = true;
          this.clipModeOption = "clip_behind_any_plane";
          break;
        case "2":
          this.hasClipLine = false;
          this.clipModeOption = "clip_behind_all_plane";
          break;
        case "3":
          this.hasClipLine = false;
          this.clipModeOption = "clip_behind_any_plane";
          break;
      }
      this.setClipBox();
    }
  }
};
</script>


