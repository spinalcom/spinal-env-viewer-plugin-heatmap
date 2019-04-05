import {
  color
} from "./colors";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";
import {
  dashboardVariables
} from "spinal-env-viewer-dashboard-standard-service";

// import {
//   toasted
// } from './toats';

const RELATION_NAME = "hasHeatMap";

import Vue from "vue";

export default {
  eventBus: new Vue(),
  getEndpointNodeElement(id) {
    return SpinalGraphService.getChildren(id, [
      dashboardVariables.ENDPOINT_RELATION_NAME
    ]).then(el => {
      let promises = [];
      for (let index = 0; index < el.length; index++) {
        promises.push(el[index].element.load());
      }
      return promises;
    });
  },
  async getElementEndpoint(id, name) {
    let promises = await this.getEndpointNodeElement(id);
    return Promise.all(promises).then(endpoints => {
      let res = {
        parentId: id
      };

      res["endpoint"] = endpoints.find(el => el.type.get() === name);

      return res;
    });
  },

  hasHeatMap(id) {
    return SpinalGraphService.getChildren(id, [RELATION_NAME]).then(el => {
      return el;
    });
  },

  colorElement(nodeName, equipments, endpointValue, heatMap) {

    if (equipments.length > 0) {
      let color = this.getElementColor(endpointValue, heatMap);

      let rgbColor = this.convertHexColorToRGB(`#${color}`);

      let realColor = rgbColor ?
        // eslint-disable-next-line no-undef
        new THREE.Vector4(
          rgbColor.r / 255,
          rgbColor.g / 255,
          rgbColor.b / 255,
          0.7
        ) :
        // eslint-disable-next-line no-undef
        new THREE.Vector4(1, 0, 0, 0);

      equipments.forEach(element => {
        window.v.setThemingColor(element, realColor);
      });
    } else {
      // toasted.error(
      //   `${nodeName} has no reference`)
    }



  },
  restoreColor(equipments) {
    equipments.forEach(element => {
      // eslint-disable-next-line no-undef
      window.v.setThemingColor(element, new THREE.Vector4(0, 0, 0, 0));
    });
  },

  getElementColor(elementValue, heatMap) {
    let min = heatMap.min.get();
    let max = heatMap.max.get();
    let average = heatMap.average ? heatMap.average.get() : null;

    let gradient = color.getGradientColor(min, average, max);

    return color.getColor(elementValue, min.value, max.value, gradient);
  },
  convertHexColorToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } :
      null;
  }
};