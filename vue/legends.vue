<template>
  <div class="legends">
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

const RELATION_NAME = "hasHeatMap";

export default {
  name: "legendComponent",
  props: ["heatMapParentNode"],
  data() {
    return {
      data: []
    };
  },
  mounted() {
    this.getColorsAndValue();
  },
  methods: {
    getColorsAndValue() {
      SpinalGraphService.getChildren(this.heatMapParentNode.id.get(), [
        RELATION_NAME
      ]).then(async el => {
        let heatMap = await el[0].element.load();

        if (heatMap) {
          let max = heatMap.max.get();
          let min = heatMap.min.get();
          let average = heatMap.average ? heatMap.average.get() : undefined;

          let colors = color.getGradientColor(min, average, max);

          for (let index = colors.length - 1; index >= 0; index--) {
            let element = {};

            element["color"] = colors[index].toHex();
            element["value"] = this.getValue(index, max.value, min.value);

            this.data.push(element);
          }
        }
      });
    },
    getValue(index, max, min) {
      if (isNaN(parseInt(min)) && isNaN(parseInt(max)))
        return index ? "True" : "False";

      return min + ((max - min) * index) / 10;
    }
  }
};
</script>

<style>
.legends {
  width: 50px;
  height: 90%;
  color: black;
  display: inline-block;
  margin-right: 20px;
}

.legends .colors {
  width: calc(70%);
  height: calc(90%);
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
  font-size: 10px;
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
</style>
