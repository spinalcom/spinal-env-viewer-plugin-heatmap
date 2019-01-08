import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import bimobjService from 'spinal-env-viewer-plugin-bimobjectservice';

import utilities from "../utilities";


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

  async action(option) {
    utilities.eventBus.$emit('add-legends', option.selectedNode);

    let endpoints = [];
    let heatmap = (await utilities.hasHeatMap(option.selectedNode.id.get()))[
      0];

    let itemsConnected = await SpinalGraphService.getChildren(
      option.selectedNode.id.get(),
      [dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION]
    );

    for (let i = 0; i < itemsConnected.length; i++) {
      endpoints.push(
        utilities.getElementEndpoint(itemsConnected[i].id.get(), heatmap.name
          .get())
      );
    }

    Promise.all(endpoints).then(el => {
      el.forEach(endpoint => {
        SpinalGraphService.getChildren(endpoint.parentId, [
          bimobjService.constants.REFERENCE_OBJECT_RELATION_NAME
        ]).then(equipment => {
          utilities.colorElement(equipment, endpoint.endpoint,
            heatmap);
        });
      });
    });
  }
}

export default ActiveMapConf;