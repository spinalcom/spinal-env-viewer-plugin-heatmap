import {
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");

import vue from "vue";

import HeatMapConf from "./buttons/configheatmap";
import ActiveMapConf from "./buttons/activeHeatMap";

import configHeatMapDialog from "./vue/configHeatMap.vue";

const HeaderBarName = "GraphManagerTopBar";
const sidebarName = "GraphManagerSideBar";


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