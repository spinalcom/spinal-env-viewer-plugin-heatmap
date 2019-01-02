import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import ContextGeographicService from "spinal-env-viewer-context-geographic-service";
import bimobjService from 'spinal-env-viewer-plugin-bimobjectservice';


const RELATION_NAME = "hasHeatMap";

const constants = ContextGeographicService.constants;

import {
  color
} from "../colors";

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
    return hasHeatMap(option.selectedNode.id.get()).then(el => {
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
    let endpoints = [];
    let heatmap = (await hasHeatMap(option.selectedNode.id.get()))[0];

    let itemsConnected = await SpinalGraphService.getChildren(
      option.selectedNode.id.get(),
      [dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION]
    );

    for (let i = 0; i < itemsConnected.length; i++) {
      endpoints.push(
        getElementEndpoint(itemsConnected[i].id.get(), heatmap.name.get())
      );
    }

    Promise.all(endpoints).then(el => {
      el.forEach(endpoint => {
        SpinalGraphService.getChildren(endpoint.parentId, [
          bimobjService.constants.REFERENCE_OBJECT_RELATION_NAME //must be replaced by REFERENCE_RELATION
        ]).then(equipment => {
          colorElement(equipment, endpoint.endpoint, heatmap);
        });
      });
    });
  }
}

export default ActiveMapConf;

function getElementEndpoint(id, name) {
  return SpinalGraphService.getChildren(id, [
    dashboardVariables.ENDPOINT_RELATION_NAME
  ]).then(el => {
    let res = {
      parentId: id
    };

    res["endpoint"] = el.find(
      async el => (await el.element.load()).name.get() == name
    );

    return res;
  });
}

function hasHeatMap(id) {
  return SpinalGraphService.getChildren(id, [RELATION_NAME]).then(el => {
    return el;
  });
}

async function colorElement(equipments, endpointInfo, argHeatmap) {
  let heatMap = await argHeatmap.element.load();
  let endpoint = await endpointInfo.element.load();
  endpoint.currentValue.bind(() => {
    let color = getElementColor(endpoint.currentValue.get(), heatMap);
    console.log("color", color)
    let itemToColor = [];
    for (let i = 0; i < equipments.length; i++) {
      const element = equipments[i];
      itemToColor.push(element.dbid.get());
    }
    window.v.setColorMaterial(itemToColor, `#${color}`, endpoint.id.get());
  });
}

function getElementColor(elementValue, heatMap) {
  let min = heatMap.min.get();
  let max = heatMap.max.get();
  let average = heatMap.average ? heatMap.average.get() : null;

  let gradient = color.getGradientColor(min, average, max);

  return color.getColor(elementValue, min.value, max.value, gradient);
}