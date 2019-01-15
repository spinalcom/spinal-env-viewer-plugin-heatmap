import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

// import {
//   SpinalGraphService
// } from "spinal-env-viewer-graph-service";

// import bimobjService from 'spinal-env-viewer-plugin-bimobjectservice';

import utilities from "../utilities";

let heatMaps = new Map();

class ActiveMapConf extends SpinalContextApp {
  constructor() {

    super("active heatmap", "This button active a heatmap", {
      icon: "remove_red_eye",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    });
  }

  isShown(option) {
    typeof heatMaps.get(option.selectedNode.id.get()) === "undefined" ? this.buttonCfg
      .fontColor = "#FFFFFF" : this.buttonCfg.fontColor = "#FF0000";


    return utilities.hasHeatMap(option.selectedNode.id.get()).then(el => {
      if (
        option.context.type.get() ==
        dashboardVariables.DASHBOARD_CONTEXT_TYPE &&
        el.length > 0
      )
        return true;
      return -1;
    });
  }

  action(option) {
    // this.fontColor = "#FF0000"
    let activeIt;

    if (typeof heatMaps.get(option.selectedNode.id.get()) === "undefined") {
      this.fontColor = "#FF0000";
      heatMaps.set(option.selectedNode.id.get(), option.selectedNode.id.get());
      activeIt = true;
    } else {
      this.fontColor = "#FFFFFF";
      heatMaps.delete(option.selectedNode.id.get());
      activeIt = false;
    }
    utilities.eventBus.$emit('add-legends', {
      active: activeIt,
      node: option.selectedNode
    });


  }
}

export default ActiveMapConf;