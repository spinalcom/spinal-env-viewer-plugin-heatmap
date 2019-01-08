import {
  color
} from "./colors";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";
import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";


const RELATION_NAME = "hasHeatMap";

import Vue from 'vue';


export default {
  eventBus: new Vue(),
  getElementEndpoint(id, name) {
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
  },

  hasHeatMap(id) {
    return SpinalGraphService.getChildren(id, [RELATION_NAME]).then(el => {
      return el;
    });
  },

  async colorElement(equipments, endpointInfo, argHeatmap) {
    let heatMap = await argHeatmap.element.load();
    let endpoint = await endpointInfo.element.load();
    endpoint.currentValue.bind(() => {
      let color = this.getElementColor(endpoint.currentValue.get(),
        heatMap);
      console.log("color", color)
      let itemToColor = [];
      for (let i = 0; i < equipments.length; i++) {
        const element = equipments[i];
        itemToColor.push(element.dbid.get());
      }
      window.v.setColorMaterial(itemToColor, `#${color}`, endpoint.id.get());
    });
  },

  getElementColor(elementValue, heatMap) {
    let min = heatMap.min.get();
    let max = heatMap.max.get();
    let average = heatMap.average ? heatMap.average.get() : null;

    let gradient = color.getGradientColor(min, average, max);

    return color.getColor(elementValue, min.value, max.value, gradient);
  }
}