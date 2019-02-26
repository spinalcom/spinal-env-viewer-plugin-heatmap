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

        <div class="md-layout md-gutter">

          <div class="md-layout-item"
               :class="!isBoolean() ? 'md-size-33' : 'md-size-50'"
               v-if="min">
            <span class="md-caption">{{min.name}}</span>
            <md-field md-inline>
              <md-input type="number"
                        :disabled="min.disabled"
                        @change="calculateAverage"
                        v-model="min.value"></md-input>
            </md-field>
            <span class="md-caption">Color</span>
            <div class="colorContainer">
              <div class="current-color"
                   :style="'background-color: ' + min.color"
                   @click="togglePicker(min)"></div>
              <chrome-picker v-model="min.color"
                             v-if="min.display"
                             @input="updateMinColor" />
            </div>
          </div>

          <div class="md-layout-item md-size-33"
               v-if="!isBoolean() && average">
            <span class="md-caption">{{average.name}}</span>
            <md-field md-inline>
              <md-input type="number"
                        :disabled="average.disabled"
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

          <div class="md-layout-item"
               :class="!isBoolean() ? 'md-size-33' : 'md-size-50'"
               v-if="max">
            <span class="md-caption">{{max.name}}</span>
            <md-field md-inline>
              <md-input type="number"
                        :disabled="max.disabled"
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
          </div>

        </div>

        <div class="colorGradient">
          <div v-for="(g,index) in gradient"
               :key="index"
               v-tooltip="getColorValue(index)"
               :style="'background-color: #' + g.toHex()">
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
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
// import HeatMap from "spinal-env-viewer-heatmap-service/build/heatMapModel.js";
import { dashboardVariables } from "spinal-env-viewer-dashboard-standard-service";
import { Chrome } from "vue-color";
import { color } from "../colors";
import { heatmapService } from "spinal-env-viewer-heatmap-service";

// let tinygradient = require("tinygradient");

// const RELATION_NAME = "hasHeatMap";

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
      min: null,
      average: null,
      max: null,
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
    removed(option) {
      if (option) {
        heatmapService.createHeatMap(
          this.nodeSelected.id.get(),
          this.selected.name,
          this.min.name,
          this.min.value,
          this.min.color,
          this.max.name,
          this.max.value,
          this.max.color,
          this.average ? this.average.name : null,
          this.average ? this.average.value : null,
          this.average ? this.average.color : null
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
      this.gradient = color.getGradientColor(this.min, this.average, this.max);
    },
    updateMaxColor(val) {
      this.max.color = val.hex;
      this.gradient = color.getGradientColor(this.min, this.average, this.max);
    },
    updateAverageColor(val) {
      this.average.color = val.hex;
      this.gradient = color.getGradientColor(this.min, this.average, this.max);
    },
    calculateAverage() {
      let max = parseInt(this.max.value);
      let min = parseInt(this.min.value);

      if (!isNaN(max) && !isNaN(min) && this.average)
        this.average.value = (max + min) / 2;
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
    getColorValue(index) {
      let max = parseInt(this.max.value);
      let min = parseInt(this.min.value);

      if (!isNaN(max) && !isNaN(min)) {
        let begin = ((max - min) * index) / 10;
        let end = ((max - min) * (index + 1)) / 10;

        return `${begin + min} - ${end + min}`;
      }

      return index ? "True" : "False";
    },
    selectedChanged(index) {
      this.selected = this.choices[index];
      this.getColor();
      this.gradient = color.getGradientColor(this.min, this.average, this.max);
    },
    getColor() {
      this.min = {
        name: !this.isBoolean() ? "min" : "False",
        value: !this.isBoolean() ? 0 : false,
        color: "#a20404",
        display: false,
        disabled: this.isBoolean()
      };

      if (!this.isBoolean()) {
        this.average = {
          name: "average",
          value: 15,
          color: "#ffff00",
          display: false,
          disabled: true
        };
      } else {
        this.average = null;
      }

      this.max = {
        name: !this.isBoolean() ? "max" : "True",
        value: !this.isBoolean() ? 30 : true,
        color: "#2ed924",
        display: false,
        disabled: this.isBoolean()
      };
    },
    isBoolean() {
      return this.selected && this.selected.dataType == "Boolean";
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

.colorContainer .current-color:hover {
  cursor: pointer;
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

.colorGradient div:hover {
  cursor: pointer;
}

.colorGradient div:after {
  content: attr(title);
  position: absolute;
  bottom: -15px;
  font-family: monospace;
  font-size: 12px;
}
</style>
