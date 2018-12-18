<template>

  <md-dialog :md-active.sync="showDialog"
             class="dialogContent"
             @md-closed="closeDialog(false)">
    <md-dialog-title>Config Heatmap</md-dialog-title>
    <md-dialog-content>
      <div v-if="choices.length">
        <div>
          <md-field>
            <md-select @md-selected="selectedChanged"
                       placeholder="Select element">
              <md-option v-for="(d,index) in choices"
                         :key="index"
                         :value="index">{{d.name}}</md-option>
            </md-select>
          </md-field>
        </div>
        <div v-if="configs.length> 0">

          <div class="md-layout md-gutter">

            <div :class="'md-layout-item md-size-' + Math.floor(100/configs.length)"
                 v-for="(conf,index) in configs"
                 :key="index">
              <span class="md-caption">{{conf.name}}</span>
              <md-field md-inline>
                <md-input type="number"
                          v-model="conf.value"
                          @change="calculateAverage"></md-input>
              </md-field>

              <span class="md-caption">Color</span>

              <div class="colorContainer">
                <div class="current-color"
                     :style="'background-color: ' + conf.color"
                     @click="togglePicker(conf)"></div>
                <chrome-picker v-model="conf.color"
                               v-if="conf.display"
                               @input="updateColor" />
              </div>
            </div>

            <!-- <div class="md-layout-item md-size-33"
                 v-if="selected.dataType.get() != 'boolean'">
              <span class="md-caption">Average</span>
              <md-field md-inline>
                <md-input type="number"
                          disabled="disabled"
                          v-model="average.value"></md-input>
              </md-field>

              <span class="md-caption">Color</span>

              <div class="colorContainer">
                <div class="current-color"
                     :style="'background-color: ' + average.color"
                     @click="togglePicker(average)"></div>
                <chrome-picker v-model="average.color"
                               v-if="average.display"
                               @input="updateAverageColor" />
              </div>
            </div>

            <div class="md-layout-item md-size-33">

              <span class="md-caption">Max</span>
              <md-field md-inline>
                <md-input type="number"
                          @change="calculateAverage"
                          v-model="max.value"></md-input>
              </md-field>
              <span class="md-caption">Color</span>

              <div class="colorContainer">
                <div class="current-color"
                     :style="'background-color: ' + max.color"
                     @click="togglePicker(max)"></div>
                <chrome-picker v-model="max.color"
                               v-if="max.display"
                               @input="updateMaxColor" />
              </div>
            </div> -->

          </div>

          <div class="colorGradient">
            <div v-for="(g,index) in gradient"
                 :key="index"
                 v-tooltip="getText(index)"
                 :style="'background-color: #' + g.toHex()">
              {{getText(index)}}</div>
          </div>
        </div>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="
               md-primary"
                 @click="closeDialog(false)">Close</md-button>
      <md-button class="md-primary"
                 @click="closeDialog(true)"
                 v-tooltip="'test'">Save</md-button>
    </md-dialog-actions>
  </md-dialog>

</template>

<script>
import {
  SPINAL_RELATION_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";
import HeatMap from "../heatMapModel";
import { dashboardVariables } from "spinal-env-viewer-dashboard-standard-service";
import { Chrome } from "vue-color";

let tinygradient = require("tinygradient");

const RELATION_NAME = "hasHeatMap";

export default {
  name: "configHeatMapDialog",
  components: { "chrome-picker": Chrome },
  props: ["onFinised"],
  data() {
    return {
      nodeSelected: null,
      showDialog: true,
      choices: [],
      selected: "",
      configs: [],
      gradient: []
    };
  },
  methods: {
    opened(option) {
      this.nodeSelected = option;
      option.element.load().then(el => {
        this.choices = el.sensor.get();
      });
    },
    async removed(option) {
      if (option) {
        let a = await SpinalGraphService.getChildren(
          this.nodeSelected.id.get(),
          [RELATION_NAME]
        );
        if (a.length > 0) return;

        let heatMap = new HeatMap(this.selected.name, this.configs);

        let heatMapNode = SpinalGraphService.createNode(
          {
            name: this.selected.name
          },
          heatMap
        );

        SpinalGraphService.addChild(
          this.nodeSelected.id.get(),
          heatMapNode,
          RELATION_NAME,
          SPINAL_RELATION_TYPE
        );
      }
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised(closeResult);
      }
    },
    togglePicker(val) {
      val.display = !val.display;
    },

    /** update */
    updateMinColor(val) {
      this.min.color = val.hex;
      this.gradient = this.getGradientColor();
    },
    updateMaxColor(val) {
      this.max.color = val.hex;
      this.gradient = this.getGradientColor();
    },
    updateAverageColor(val) {
      this.average.color = val.hex;
      this.gradient = this.getGradientColor();
    },
    /** End */
    updateColor(conf) {
      console.log(conf);
    },
    getGradientColor() {
      let colors = [];

      for (let i = 0; i < this.configs.length; i++) {
        colors.push(this.configs[i].color);
      }

      console.log(colors);

      let gradient = tinygradient(colors);
      console.log(gradient);

      return gradient.rgb(10);
    },
    calculateAverage() {
      let max = parseInt(this.max.value);
      let min = parseInt(this.min.value);

      console.log(max, min);

      if (!isNaN(max) && !isNaN(min)) this.average.value = (max + min) / 2;
    },
    getSelectLst(id) {
      return SpinalGraphService.getChildren(id, [
        dashboardVariables.ENDPOINT_RELATION_NAME
      ]).then(listModel => {
        let res = [];
        listModel.forEach(async model => {
          let element = await model.element.load();
          res.push(element);
        });

        return res;
      });
    },
    formIsValid() {
      return (
        this.selected.length > 0 &&
        (!isNaN(parseInt(this.max.value)) &&
          !isNaN(parseInt(this.min.value)) &&
          !isNaN(parseInt(this.average.value)))
      );
    },
    getText(index) {
      // let percent = (index + 1) * 10;
      // return (percent * this.average.value) / 50;
      return index;
    },
    selectedChanged(index) {
      this.selected = this.choices[index];
      this.getColor();
      this.gradient = this.getGradientColor();
    },
    getColor() {
      this.configs = [];

      this.configs.push({
        name: "min",
        value: 0,
        color: "#a20404",
        display: false
      });

      if (this.selected && this.selected.dataType !== "boolean") {
        this.configs.push({
          name: "average",
          value: 15,
          color: "#ffff00",
          display: false
        });
      }

      this.configs.push({
        name: "max",
        value: 30,
        color: "#2ed924",
        display: false
      });
    }
  }
};
</script>

<style>
.dialogContent {
  width: 500px !important;
  height: 700px !important;
}

.colorContainer {
  width: 100%;
  height: 30px;
}

.colorContainer .current-color {
  width: 100%;
  height: 80%;
}

.colorGradient {
  width: 100%;
  height: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  margin-top: 100px;
}

.colorGradient div {
  flex-grow: 1;
  position: relative;
  text-align: center;
  color: black;
}
.colorGradient div:after {
  content: attr(title);
  position: absolute;
  bottom: -15px;
  font-family: monospace;
  font-size: 12px;
}
</style>
