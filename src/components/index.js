import viewer from "./Viewer/index.js";
import Measure from "./3DAnalysis/Measure/index.js";
import Profile3D from "./3DAnalysis/Profile3D/index.js";
import ShadowQuery from "./3DAnalysis/ShadowQuery/index.js";
import SightLine from "./3DAnalysis/SightLine/index.js";
import SkyLine from "./3DAnalysis/SkyLine/index.js";
import ViewShed from "./3DAnalysis/ViewShed/index.js";
import OnLineAnalysis from "./3DAnalysis/OnLineAnalysis/index.js";
import backLineAnalysis from "./3DAnalysis/backLineAnalysis/index.js";
import limitHeightAnalysis from "./3DAnalysis/limitHeightAnalysis/index.js";




import GeologicBodyClip from "./GeologicBodyAnalysis/GeologicBodyClip/index.js";

import "../common/scss/globe.scss";

// import ClipBox from "./Clip/ClipBox/index.js";
// import ClipCross from "./Clip/ClipCross/index.js";
// import ClipPlane from "./Clip/ClipPlane/index.js";
// import ClipPolygon from "./Clip/ClipPolygon/index.js";


// import DigTerrain from "./TerrainAnalysis/DigTerrain/index.js";
// import IsoLine from "./TerrainAnalysis/IsoLine/index.js";
// import ModifyTerrain from "./TerrainAnalysis/ModifyTerrain/index.js";
// import TerrainSlopeAnalysis from "./TerrainAnalysis/TerrainSlopeAnalysis/index.js";



const components = [
  viewer,

  Measure,
  Profile3D,
  ShadowQuery,
  SightLine,
  SkyLine,
  ViewShed,
  OnLineAnalysis,
  backLineAnalysis,
  limitHeightAnalysis,

  GeologicBodyClip,

  // ClipBox,
  // ClipCross,
  // ClipPlane,
  // ClipPolygon,

  // DigTerrain,
  // IsoLine,
  // ModifyTerrain,
  // TerrainSlopeAnalysis
]



const install = function (Vue, opts = {}) {
  if (install.installed) return;
  components.forEach(component => {
    Vue.component(component.name, component);
  });
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  components
}
