let tinygradient = require("tinygradient");

let color = {
  getGradientColor(min, average, max) {
    let colorLength = average ? 10 : 2;
    let colors = average ? [min.color, average.color, max.color] : [min.color,
      max.color
    ];

    let gradient = tinygradient(colors);

    return gradient.rgb(colorLength);
  },
  getColor(value, minValue, maxValue, gradientColor) {
    if (typeof minValue === "boolean" && typeof maxValue === "boolean")
      return value ? gradientColor[1].toHex() : gradientColor[0].toHex();

    let index = Math.floor(((value - minValue) * 10) / (maxValue -
      minValue)) - 1;

    if (index < 0) index = 0;

    return gradientColor[index].toHex();
  }
}

export {
  color
}