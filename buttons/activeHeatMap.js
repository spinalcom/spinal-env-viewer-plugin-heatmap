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

const RELATION_NAME = "hasHeatMap";

// import {
//   toasted
// } from "../toats";

const constants = ContextGeographicService.constants;


class ActiveMapConf extends SpinalContextApp {
  constructor() {
    super(
      "active heatmap",
      "This button active a heatmap", {
        icon: "remove_red_eye",
        icon_type: "in",
        backgroundColor: "#FF0000",
        fontColor: "#FFFFFF"
      }
    );
  }

  isShown(option) {
    return hasHeatMap(option.selectedNode.id.get()).then(el => {
      if (option.context.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE &&
        el.length > 0)
        return true;
      return -1;

    })
  }

  async action(option) {

    let name = (await hasHeatMap(option.selectedNode.id.get()))[0].name.get()

    option.selectedNode.element.load().then(element => {
      let endpoints = [];

      for (let i = 0; i < element.connected.length; i++) {
        endpoints.push(getElementEndpoint(element.connected[i].get(),
          name));
      }

      Promise.all(endpoints).then(el => {
        el.forEach(endpoint => {

          SpinalGraphService.getChildren(endpoint.parentId, [
            constants.EQUIPMENT_RELATION
          ]).then(equipment => {
            colorElement(equipment, endpoint.endpoint);
          })
        })
      })

    })


  }



}

function getElementEndpoint(id, name) {
  return SpinalGraphService.getChildren(id, [dashboardVariables.ENDPOINT_RELATION_NAME])
    .then(el => {
      let res = {
        parentId: id
      };

      res["endpoint"] = el.find(async el => (await el.element.load()).name.get() ==
        name)

      return res;
    })
}

function hasHeatMap(id) {
  return SpinalGraphService.getChildren(id, [RELATION_NAME]).then(el => {
    return el;
  })
}

function colorElement(elementInfo, endpointInfo) {
  console.log(endpointInfo);
  let itemToColor = [];
  for (let i = 0; i < elementInfo.length; i++) {
    const element = elementInfo[i];

    itemToColor.push(element.dbid.get());

  }
  window.v.select(itemToColor);
}

export default ActiveMapConf;