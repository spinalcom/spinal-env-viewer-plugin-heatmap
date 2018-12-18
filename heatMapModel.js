const spinalCore = require("spinal-core-connectorjs");


class HeatMap extends window.Model {
  constructor(name, colorsParams) {
    super();
    this.add_attr({
      name: name,
      params: colorsParams
    })

  }
}

export default HeatMap;
spinalCore.register_models([HeatMap]);