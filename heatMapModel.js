const spinalCore = require("spinal-core-connectorjs");


class HeatMap extends window.Model {
  constructor(name, minName, minValue, minColor, maxName, maxValue, maxColor,
    averageName = null, averageValue = null,
    averageColor = null) {
    super();
    this.add_attr({
      name: name,
      min: {
        name: minName,
        value: minValue,
        color: minColor
      },
      average: (averageName && averageValue && averageColor) ? {
        name: averageName,
        value: averageValue,
        color: averageColor
      } : null,
      max: {
        name: maxName,
        value: maxValue,
        color: maxColor
      }
    })

  }
}

export default HeatMap;
spinalCore.register_models([HeatMap]);