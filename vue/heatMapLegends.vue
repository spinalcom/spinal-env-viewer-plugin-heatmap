<template>
  <div class="md-scrollbar legendsContainer"
       v-if="legends.length > 0">
    <div class="legend-title md-title">HeatMap Legends</div>
    <legend-component v-for="(legend,index) in legends"
                      :key="index"
                      :heat-map-parent-node="legend"></legend-component>
  </div>
</template>


<script>
import legendComponent from "./legends.vue";
import utilities from "../utilities";

export default {
  name: "legendsHeatmap",
  components: { legendComponent },
  data() {
    return {
      legends: []
    };
  },
  mounted() {
    utilities.eventBus.$on("add-legends", node => {
      console.log("event called");
      for (let i = 0; i < this.legends.length; i++) {
        const element = this.legends[i];
        if (element.id.get() == node.id.get()) return;
      }

      this.legends.push(node);
    });
  },
  methods: {},
  destroyed() {
    console.log("destroyed");
  }
};
</script>

<style>
.legendsContainer {
  width: calc(20%);
  height: calc(40%);
  border: 1px solid red;
  overflow-x: auto;
  position: absolute;
  right: 20px;
  top: calc(20%);
  padding: 10px;
}

.legend-title {
  color: black;
  text-align: center;
  margin-bottom: 10px;
}
</style>
