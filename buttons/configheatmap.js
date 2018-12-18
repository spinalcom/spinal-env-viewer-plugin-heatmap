import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";
import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

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
    if (option.context.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE &&
      option
      .context.id.get() !== option.selectedNode
      .id
      .get())
      return Promise.resolve(true);
    return Promise.resolve(-1);
  }

  action(option) {
    spinalPanelManagerService.openPanel('configHeatMapDialog', option.selectedNode);
  }
}

export default HeatMapConf;