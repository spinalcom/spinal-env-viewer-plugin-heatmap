<template>
  <md-content class="md-scrollbar legendsContainer"
              v-if="legends.length > 0">
    <!-- <div class="legend-title md-title">HeatMap Legends</div> -->
    <legend-component v-for="(legend,index) in legends"
                      :key="index"
                      :heat-map-parent-node="legend"
                      :ref="legend.id.get()"></legend-component>
  </md-content>
</template>


<script>
import legendComponent from "./legends.vue";
import utilities from "../utilities";
// import HeatMap from "../heatMapModel";
import bimobjService from "spinal-env-viewer-plugin-bimobjectservice";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { dashboardVariables } from "spinal-env-viewer-dashboard-standard-service";

export default {
  name: "legendsHeatmap",
  components: { legendComponent },
  data() {
    return {
      legends: []
    };
  },
  mounted() {
    utilities.eventBus.$on("add-legends", res => {
      if (res.active) {
        this.legends.push(res.node);
        // this.activeHeatMap(res.node.id.get());
      } else {
        this.$refs[res.node.id.get()][0].restoreColor(true);
        for (let i = 0; i < this.legends.length; i++) {
          const element = this.legends[i];
          if (element.id.get() == res.node.id.get()) {
            this.legends.splice(i, 1);
          }
        }
      }
    });
  },
  methods: {
    getAllEndpoints(dashboardId) {
      return utilities.hasHeatMap(dashboardId).then(heatmap => {
        let endpoints = [];
        return SpinalGraphService.getChildren(dashboardId, [
          dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION
        ]).then(itemsConnected => {
          for (let i = 0; i < itemsConnected.length; i++) {
            endpoints.push(
              utilities.getElementEndpoint(
                itemsConnected[i].id.get(),
                heatmap[0].name.get()
              )
            );
          }
          return { endpoints: endpoints, heatmap: heatmap[0] };
        });
      });
    },
    activeHeatMap(dashboardId) {
      this.getAllEndpoints(dashboardId).then(res => {
        Promise.all(res.endpoints).then(el => {
          el.forEach(endpoint => {
            SpinalGraphService.getChildren(endpoint.parentId, [
              bimobjService.constants.REFERENCE_OBJECT_RELATION_NAME
            ]).then(equipment => {
              utilities.colorElement(equipment, endpoint.endpoint, res.heatmap);
            });
          });
        });
      });
    }
  },
  destroyed() {
    console.log("destroyed");
  }
};
</script>

<style>
.legendsContainer {
  /* min-width: 100px !important; */
  /* max-width: calc(20%); */
  max-width: 200px;
  height: calc(40%);
  background: #393939 !important;
  border: 1px solid black;
  overflow-x: auto;
  position: absolute;
  right: 0px;
  top: calc(20%);
  padding: 10px;
}

/* .legend-title {
  color: black;
  text-align: center;
  margin-bottom: 10px;
} */
</style>
