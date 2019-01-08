import {
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import HeatMapConf from "./buttons/configheatmap";
import ActiveMapConf from "./buttons/activeHeatMap";

import vue from "vue";
import configHeatMapDialog from "./vue/configHeatMap.vue";
import legendsHeatmap from "./vue/heatMapLegends.vue";

// const HeaderBarName = "GraphManagerTopBar";
const sidebarName = "GraphManagerSideBar";
const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");



spinalContextMenuService.registerApp(sidebarName, new HeatMapConf());
spinalContextMenuService.registerApp(sidebarName, new ActiveMapConf());


const dialogs = [{
  name: "configHeatMapDialog",
  vueMountComponent: vue.extend(configHeatMapDialog),
  parentContainer: document.body
}];


for (let index = 0; index < dialogs.length; index++) {
  SpinalMountExtention.mount(dialogs[index]);
}


//mount legendsComponent
let legendsHeatmapComponent = vue.extend(legendsHeatmap);
let app = new legendsHeatmapComponent();

app.$mount();
document.getElementsByTagName("body")[0].appendChild(app.$el);