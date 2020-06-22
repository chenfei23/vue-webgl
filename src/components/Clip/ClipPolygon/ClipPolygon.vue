<template>
  <div v-if="clipPolygon" class="com">
    <div class="middlebox">
      <label class="label-container">裁剪模式:</label>
      <select class="select-container middle-input" id="fillOptions" v-model="ClipModelSelected">
        <option :value="Options.id" v-for="Options in ClipModels">{{Options.name}}</option>
      </select>
    </div>
    <div class="boxchild ">
      <button @click="clipPolygonStart" class="tbtn tbn1" type="button">裁剪</button>
      <button @click="clearClipPolygon" class="tbtn " type="button">清除</button>
    </div>
  </div>
</template>

<script>
  import eventBus from "../../eventBus";
  import common from "../../common"
  export default {
    name: "SmClipPolygon",
    data() {
      return {
        clipPolygon: false,
        layers:null,
        ClipModels: [
          {
            id: '0',
            name: '裁剪内部'
          },
          {
            id: '1',
            name: '裁剪外部'
          },

        ],
        ClipModelSelected: null,
        clipModeOption:null,
        position:[]
      }
    },
    methods: {
      // 多边形裁剪
      clipPolygonStart() {
        this.position =[]
        for(let layer of this.layers){
          layer.selectEnabled = false;
          // 设置被裁剪对象的颜色
          layer.clipLineColor = new Cesium.Color(1, 1, 1, 0);
        }
        common.handlerDrawing(this).then(res => {
          this.position.push(res.positions)
          let handlerPolygon = this.handlerPolygon
          for(let layer of this.layers){
            layer.setModifyRegions(this.position, this.clipModeOption);
          }
          handlerPolygon.polygon.show = false;
          handlerPolygon.polyline.show = false;
          handlerPolygon.deactivate();
        }, (err) => {
          console.log(err)
        });
        this.handlerPolygon.activate();
        if (!scene.pickPositionSupported) {
          alert('不支持深度纹理,无法绘制多边形，裁剪功能无法使用！');
        }
      },

      clearClipPolygon() {
        if(this.position.length ==0){return}
        this.position =[]
        this.handlerPolygon.clear();
        for(let layer of this.layers){
          layer.clearModifyRegions();
        }
        this.handlerPolygon.deactivate();
        document.body.classList.remove("drawCur");
        this.tooltip.setVisible(false);
        if(this.handlerPolygon.polyline){this.handlerPolygon.polyline.show = false;}
      },

      init() {
        this.ClipModelSelected = this.ClipModels[0].id;
        this.clipModeOption = Cesium.ModifyRegionMode.CLIP_INSIDE
        this.layers = scene.layers.layerQueue;
      },
    },
    mounted() {
      eventBus.$on("init", (e)=> {
        this.init();
        common.initHandler(this);
      })
    },
    beforeMount() {
      eventBus.$emit("sendPname", {
        type: "clip",
        name: "多边形裁剪",
        value: this.clipPolygon
      });
      eventBus.$on("sendCname", (e) => {
        if (e == "多边形裁剪") {
          this.clipPolygon = true;
        } else {
          this.clipPolygon = false
        }
      });
    },
    watch:{
      ClipModelSelected(val){
        switch (val){
          case '0':
            this.clipModeOption = Cesium.ModifyRegionMode.CLIP_INSIDE;
            break;
          case '1':
            this.clipModeOption = Cesium.ModifyRegionMode.CLIP_OUTSIDE;
            break;
        }
        for(let layer of this.layers){
          layer.setModifyRegions(this.position, this.clipModeOption);
        }
      },
    }
  }
</script>
<style scoped>
  .com{
  }

</style>


