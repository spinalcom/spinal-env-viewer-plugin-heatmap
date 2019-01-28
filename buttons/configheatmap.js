import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";
import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

// import {
//   toasted
// } from "../toats";

// const constants = ContextGeographicService.constants;


class HeatMapConf extends SpinalContextApp {
  constructor() {
    super(
      "config heatmap",
      "This button configs a heatmap", {
        icon: "color_lens",
        icon_type: "in",
        backgroundColor: "#FF0000",
        fontColor: "#FFFFFF"
      }
    );
  }

  isShown(option) {
    return SpinalGraphService.getRealNode(option.selectedNode.id.get()).getParents()
      .then(
        parents => {
          if (option.context.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE &&
            this.isOptionContextChild(parents, option.context))
            return true;
          return -1;
        })
  }

  action(option) {
    spinalPanelManagerService.openPanel('configHeatMapDialog', option.selectedNode);
  }

  isOptionContextChild(parentList, context) {
    for (let index = 0; index < parentList.length; index++) {
      const element = parentList[index].info;
      if (element.id.get() === context.id.get()) return true;
    }
    return false;
  }

}

export default HeatMapConf;