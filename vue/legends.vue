<template>
  <div class="legends">

    <md-menu class="icon"
             md-size="small"
             :mdCloseOnClick="true"
             v-if="heatMapTypeSelected">

      <md-button class="btn-trigger"
                 md-menu-trigger
                 :title="heatMapTypeSelected.name.get()">

        <md-icon class="menu_icon legendIcon"
                 v-if="getIcon(heatMapTypeSelected.name.get())">
          {{getIcon(heatMapTypeSelected.name.get())}}
        </md-icon>

        <md-icon class="menu_icon legendIcon"
                 v-if="!getIcon(heatMapTypeSelected.name.get())"
                 :md-src="getSvg(heatMapTypeSelected.name.get())"></md-icon>

        <md-icon class="menu_icon legendIcon"
                 :md-src="getSvg('arrow_down')"></md-icon>

      </md-button>

      <md-menu-content>
        <md-menu-item v-for="(heatmap,index) in heatMaps"
                      :key="index"
                      @click="changeHeatmap(heatmap)">

          <md-icon class="legendIcon"
                   v-if="getIcon(heatmap.name.get())">{{getIcon(heatmap.name.get())}}</md-icon>

          <md-icon v-if="!getIcon(heatmap.name.get())"
                   :md-src="getSvg(heatmap.name.get())"></md-icon>
          {{heatmap.name.get()}}
        </md-menu-item>
        <!-- <md-menu-item>
          <md-button @click="changeHeatmap('Power')">
            <md-icon class="legendIcon">add</md-icon>
            &nbsp;
            <span>Power</span>
          </md-button>

        </md-menu-item>
        <md-menu-item>
          <md-button @click="changeHeatmap('Alarm')">
            <md-icon class="legendIcon">add</md-icon>
            &nbsp;
            <span>Alarm</span>
          </md-button>

        </md-menu-item> -->
      </md-menu-content>
    </md-menu>
    <!-- </div> -->

    <div class="colors">

      <div class="boxContainer"
           v-for="(g,index) in this.data"
           :key="index">
        <div class="boxColor"
             :style="'background-color: #' + g.color"></div>
        <div class="boxValue"
             v-tooltip="g.value + ''">{{g.value}}</div>
      </div>

    </div>

    <div class="name"
         v-tooltip="heatMapParentNode.name.get()">{{heatMapParentNode.name.get()}}</div>
  </div>
</template>

<script>
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { color } from "../colors";
import utilities from "../utilities";
import { dashboardVariables } from "spinal-env-viewer-dashboard-standard-service";
import bimobjService from "spinal-env-viewer-plugin-bimobjectservice";
import { heatmapService } from "spinal-env-viewer-heatmap-service";
import endpointTypes from "../endpointTypes";

// eslint-disable-next-line no-unused-vars
const temperature = require("../assets/temperature.svg");
// eslint-disable-next-line no-unused-vars
const hygrometry = require("../assets/hygrometry.svg");
// eslint-disable-next-line no-unused-vars
const arrow_down = require("../assets/arrow_down.svg");

export default {
  name: "legendComponent",
  props: ["heatMapParentNode"],
  data() {
    return {
      data: [],
      bindProcessMap: new Map(),
      heatMapTypeSelected: null,
      heatMaps: []
    };
  },
  mounted() {
    this.getNodeHeatMap().then(el => {
      console.log("el", el);
      this.heatMaps = el;
    });
    this.changeThisHeatMapType("Temperature").then(() => {
      this.colorHeatMap();
    });
  },
  methods: {
    getColorsAndValue() {
      // SpinalGraphService.getChildren(this.heatMapParentNode.id.get(), [
      //   RELATION_NAME
      // ]).then(async el => {
      // let heatMap = heatMapType ? await this.get : await el[0].element.load();

      if (this.heatMapTypeSelected) {
        let max = this.heatMapTypeSelected.max.get();
        let min = this.heatMapTypeSelected.min.get();
        let average = this.heatMapTypeSelected.average
          ? this.heatMapTypeSelected.average.get()
          : undefined;

        let colors = color.getGradientColor(min, average, max);

        this.data = [];

        for (let index = colors.length - 1; index >= 0; index--) {
          let element = {};

          element["color"] = colors[index].toHex();
          element["value"] = this.getValue(index, max.value, min.value);

          this.data.push(element);
        }
      }
      // });
    },
    getValue(index, max, min) {
      if (isNaN(parseInt(min)) && isNaN(parseInt(max)))
        return index ? "True" : "False";

      return min + ((max - min) * index) / 10;
    },
    getEndpointsToBind() {
      return SpinalGraphService.getChildren(this.heatMapParentNode.id.get(), [
        dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION
      ]).then(itemsConnected => {
        let endpoints = [];

        for (let i = 0; i < itemsConnected.length; i++) {
          endpoints.push(
            utilities.getElementEndpoint(
              itemsConnected[i].id.get(),
              this.heatMapTypeSelected.name.get()
            )
          );
        }
        return endpoints;
      });
    },
    colorHeatMap() {
      this.getEndpointsToBind().then(endpoints => {
        Promise.all(endpoints).then(el => {
          el.forEach(res => {
            // res.endpoint.element.load().then(endpoint => {
            let bindProcess = res.endpoint.currentValue.bind(async () => {
              utilities.colorElement(
                await this.getEquipmentsDbId(res.parentId),
                res.endpoint.currentValue.get(),
                this.heatMapTypeSelected
              );
            });

            this.bindProcessMap.set(res.endpoint, bindProcess);
            // });
          });
        });
      });
    },
    getEquipmentsDbId(nodeId) {
      return SpinalGraphService.getChildren(nodeId, [
        bimobjService.constants.REFERENCE_OBJECT_RELATION_NAME
      ]).then(equipments => {
        let itemToColor = [];
        for (let i = 0; i < equipments.length; i++) {
          const element = equipments[i];
          itemToColor.push(element.dbid.get());
        }
        return itemToColor;
      });
    },
    changeThisHeatMapType(heatmap) {
      if (typeof heatmap === "string") {
        return heatmapService
          .getHeatMap(this.heatMapParentNode.id.get(), heatmap)
          .then(async el => {
            if (el) this.heatMapTypeSelected = await el.element.load();
            return;
          });
      } else {
        this.heatMapTypeSelected = heatmap;
        return Promise.resolve(false);
      }
    },
    restoreColor(hide = false) {
      this.bindProcessMap.forEach((value, key) => {
        key.currentValue.unbind(value);
        this.bindProcessMap.delete(key);
      });
      if (hide) {
        this.hideColor();
      }
      return Promise.resolve(true);
    },
    changeHeatmap(heatMapType) {
      if (this.heatMapTypeSelected.name.get() !== heatMapType.name.get()) {
        this.restoreColor().then(() => {
          this.changeThisHeatMapType(heatMapType).then(() => {
            this.colorHeatMap();
          });
        });
      }
      // this.changeThisHeatMapType(heatMapType, () => {
      //   this.colorHeatMap();
      // });
    },
    hideColor() {
      return SpinalGraphService.getChildren(this.heatMapParentNode.id.get(), [
        dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION
      ]).then(itemsConnected => {
        let promises = [];
        itemsConnected.forEach(el => {
          promises.push(this.getEquipmentsDbId(el.id.get()));
        });
        Promise.all(promises).then(equipmentsList => {
          equipmentsList.forEach(equipments => {
            utilities.restoreColor(equipments);
          });
        });
      });
    },
    getNodeHeatMap() {
      return heatmapService
        .getHeatMap(this.heatMapParentNode.id.get())
        .then(async heatMaps => {
          let promises = [];
          heatMaps.forEach(el => {
            promises.push(el.element.load());
          });
          let heaMapsElement = await Promise.all(promises);
          return heaMapsElement;
        });
    },
    getIcon(type) {
      let icon = endpointTypes.find(el => el.type === type).icon;

      return icon.trim().length > 0 ? icon : undefined;
    },
    getSvg(type) {
      return eval(type.toLowerCase());
    }
  },
  watch: {
    heatMapTypeSelected: function() {
      this.getColorsAndValue();
    }
  }
};
</script>

<style>
.legends {
  width: 50px;
  height: 98%;
  color: white;
  display: inline-block;
  margin-right: 20px;
  font-weight: bold;
}

.legends:last-child {
  margin-right: 0px;
}

.legends .icon {
  width: calc(100%);
  height: calc(10%);
  border-bottom: 1px dashed gray;
  /* color: #000000; */
}

.legends .icon .btn-trigger {
  min-width: calc(100%) !important;
  width: calc(100%) !important;
}

.legends .icon .legendIcon {
  min-width: 20px !important;
  width: 20px;
}

.legends .colors {
  width: calc(70%);
  height: calc(80%);
  margin: auto;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.legends .colors .boxContainer {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  position: relative;
}

.legends .colors .boxContainer .boxColor {
  width: calc(20%);
  background-color: red;
}

.legends .colors .boxContainer .boxValue {
  width: calc(80%);
  align-self: flex-end;
  max-height: 30px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
  padding-left: 4px;
  position: absolute;
  bottom: -10px;
  left: 5px;
}

.legends .name {
  width: calc(100%);
  height: calc(10%);
  /* text-align: center; */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* border-top: 1px solid gray; */
  padding-top: 5px;
}

.legends .icon .menu_icon {
  /* color: #000000 !important; */
  width: 20px;
  display: inline-block;
}
</style>
