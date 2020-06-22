<template>
  <div id="app">
    <sm-viewer :cameraposition="cameraPosition" :s3mscps="scps" @loaded="viewerLoaded">
      <!-- <div>
        <sm-scene-measure ref="measure"></sm-scene-measure>
      </div>-->

      <!-- <div class="sm-ctrl-top-left">
        <sm-scene-backlineanalysis :spatial-analysis-url="spatialAnalysisUrl" :query-url="queryUrl"></sm-scene-backlineanalysis>
      </div>-->

      <div class="sm-ctrl-top-left">
        <sm-scene-limitheightanalysis></sm-scene-limitheightanalysis>
      </div>

      <!-- <div class="sm-ctrl-top-left">
        <sm-scene-measure ref="measure" :loaded="loaded"></sm-scene-measure>
      </div>-->

      <!-- <div class="sm-ctrl-top-left">
        <sm-scene-viewshed  :scene-url="sceneURL" ref="viewshed"></sm-scene-viewshed>
      </div>
      <div class="sm-ctrl-top-left">
        <sm-scene-shadowquery ref="shadowquery"></sm-scene-shadowquery>
      </div>
      <div class="sm-ctrl-top-left">
        <sm-scene-profile3d ref="profile3d"></sm-scene-profile3d>
      </div>
      <div class="sm-ctrl-top-left">
        <sm-scene-skyline ref="skyline"></sm-scene-skyline>
      </div>
      <div class="sm-ctrl-top-left">
        <sm-scene-sightline ref="sightline"></sm-scene-sightline>
      </div>-->
    </sm-viewer>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      loaded: false,
      queryUrl:
        "http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/datasets/%E5%A2%99%40%E4%B9%9D%E5%8F%B7%E6%A5%BC%E6%8B%89%E4%BD%8E/spatialquery3d.json",
      spatialAnalysisUrl:
        "http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/geometry/3d/buffer.json",
      // "http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/geometry/3d/viewshedbody.json",
      sceneURL:
        "http://192.168.17.103:8090/iserver/services/3D-terrain_imagery_dalian/rest/realspace",
      // "http://www.supermapol.com/realspace/services/3D-zhufeng_new/rest/realspace",
      // "http://www.supermapol.com/realspace/services/3D-cbd/rest/realspace",
      profileUrl:
        "http://www.supermapol.com/realspace/services/spatialanalyst-sample/restjsr/spatialanalyst/datasets/JingjinTerrain@Jingjin/terraincalculation/profile.jsonp?returnContent=true",

      ImageryProviders: [
        // {
        //   url:
        //     "https://www.supermapol.com/proxy/iserver/services/map_China/rest/maps/China_Dark"
        // },
        // {
        //   url:
        //     "http://www.supermapol.com/realspace/services/map-jingjin/rest/maps/%E4%BA%AC%E6%B4%A5%E5%9C%B0%E5%8C%BA%E5%9C%B0%E5%9B%BE"
        // },
        // {
        //   url:
        //     "http://www.supermapol.com/realspace/services/map-jingjin/rest/maps/%E4%BA%AC%E6%B4%A5%E5%9C%B0%E5%8C%BA%E5%9C%B0%E8%B2%8C%E5%88%86%E5%B8%83%E5%9B%BE"
        // }
      ],
      modelUrls: [
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer1/features/1.json",
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer2/features/1.json",
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer3/features/1.json",
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer4/features/1.json",
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer5/features/1.json",
        "http://192.168.17.103:8090/iserver/services/data-dizhitidata/rest/data/datasources/地质体/datasets/Layer6/features/1.json"
      ],
      cameraPosition: {
        destination: Cesium.Cartesian3.fromDegrees(
          115.00022575830863,
          39.009956534844858,
          500
        ),
        orientation: {
          heading: 1.705646,
          pitch: -0.499956,
          roll: 0.0
        }
      },
      scps: [
        {
          url: URL_CONFIG.SCENE_GTC_UNIT9,
          options: {
            name: "九号楼@九号楼"
          }
        },
        {
          url: URL_CONFIG.SCENE_GTC_UNIT9,
          options: {
            name: "九号楼@九号楼1"
          }
        },
        {
          url: URL_CONFIG.SCENE_GTC_BUILDIBG,
          options: {
            name: "original"
          }
        },
        {
          url: URL_CONFIG.SCENE_GTC_UINSIDE,
          options: {
            name: "origina白膜控制"
          }
        },
        {
          url: URL_CONFIG.SCENE_GTC_GROUND,
          options: {
            name: "ground"
          }
        },
        {
          url: URL_CONFIG.SCENE_GTC_HILL,
          options: {
            name: "hill"
          }
        }
      ]
    };
  },

  methods: {
    viewerLoaded(loaded) {
      this.loaded = loaded;
    },
    clearAll() {
      // this.$refs.measure.destory();
      // this.$refs.sightline.destory();
      // this.$refs.viewshed.destory();
      // this.$refs.shadowquery.destory();
      // this.$refs.profile3d.destory();
      // this.$refs.skyline.destory();
    }
  },
  mounted() {
    // console.log(this.axios);
  }
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  color: #eee;
}
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
