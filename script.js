// Dimensions of the SVG
const margin = {top: 20, right: 20, bottom: 70, left: 40};
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


// Get the SVG
const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Raw data (e.g. with kilometers or kilograms)
// This data is not to be displayed (need processing first)
// We will change this data using the form
let orig_data = [
  {
    "serie": "moyenne",
    "porc": "1",
    "boeuf": "3",
    "train": "1540",
    "voiture": "11119",
    "bus": "1226",
    "2roues": "188",
    "avion": "209"
  },
  {
    "serie": "moi",
    "porc": "2",
    "boeuf": "1",
    "train": "500",
    "voiture": "20000",
    "bus": "0",
    "2roues": "0",
    "avion": "1000"
  }
];
orig_data.columns = Object.keys(orig_data[0]);


// Transform the data (raw value => kg of CO2 / year)
let data = processData(orig_data);


// We have 2 representations, so we retain the 2 sets of keys
const keysNotMerged = data.columns.slice(1);
const keysMerged = ['alimentaire', 'transport'];
let keys = keysNotMerged;


// X Domain, Scale and Axis
const xDomain = data.map( (d) => d.serie );
const x = d3.scaleBand()
  .rangeRound([0, width - 300])
  .paddingInner(0.05)
  .align(0.1)
  .domain(xDomain);
const xAxis = d3.axisBottom()
  .scale(x)
  .tickSize(0)
  .tickPadding(6);


// Colors
const z = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
  .domain(keys);


// Update the SVG when the form changes
const $fusionner = $("#fusionner");
$fusionner.on('change', () => update() );
keysNotMerged.forEach( (key) => handleSlider(key) );


// Draw the SVG
const bars = draw(data);


// Function called when the form is changed
function update () {
  let data;
  if ($fusionner.is(':checked')) {
    keys = keysMerged;
    data = processDataMerge(orig_data);
  } else {
    keys = keysNotMerged;
    data = processData(orig_data);
  }
  draw(data, bars);
}


// Convenience method for each slider of the form
function handleSlider(sliderName) {
  let $span = $(`#${sliderName}-valeur`);
  $span.text(orig_data[1][sliderName]);

  let $slider = $(`#${sliderName}`);
  $slider.val(orig_data[1][sliderName]);

  $slider.on('input', function () {
    let newValue = $(this).val();
    $span.text(newValue);
    orig_data[1][sliderName] = (+newValue);
    update();
  });
}


// Drawing process
function draw (data) {

  svg.selectAll('g').remove();
  svg.selectAll('line').remove();

  // Compute the Y Axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.total )])
    .rangeRound([height, 0])
    .nice();
  const yAxis = d3.axisLeft()
    .scale(y);

  // Create the layers
  const layers = d3.stack().keys(keys)(data);

  // Create new graphics
  const g = svg.append("g")
    .attr("transform", "translate(0, 0)")
    .selectAll("g")
    .data(layers);
  const bars = g.enter().append("g")
    .style("fill", (d) => z(d.key) )
    .selectAll("rect");

  bars
    .data( (d) => d )
    .enter().append("rect")
      .attr("x", (d) => x(d.data.serie) )
      .attr("y", (d) => y(d[1]) )
      .attr("height", (d) => (y(d[0]) - y(d[1])) )
      .attr("width", x.bandwidth())
      .on("mouseover", () => { tooltip.style("display", null); })
      .on("mouseout", () => { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        let key = d3.select(this.parentNode).datum().key;
        let xPosition = d3.mouse(this)[0] + 30;
        let yPosition = d3.mouse(this)[1] - 30;
        tooltip.attr("transform", `translate(${xPosition}, ${yPosition})`);
        let txt = `${key} : ${(d[1] - d[0]).toFixed(1)} kg CO2 / an`;
        tooltip.select("text").text(txt);
      });

  // FIXME: label dans les rect

  // Draw the X Axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  // Draw the Y Axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  // Threshold (objective of 1700kg of CO2 / year)
  svg.append('line')
    .attr('class', 'threshold')
    .attr('x1', x(xDomain[0]))
    .attr('y1', y(1700))
    .attr('x2', width - 300)
    .attr('y2', y(1700));

  const tooltip = drawTooltip();

  drawLegend(keys);

  return bars;
}


// Create the placeholder for the tooltip, hidden initially
function drawTooltip () {
  const tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .style("pointer-events", "none");

  return tooltip;
}


// Draw the legend (color + name of the category)
function drawLegend (keys) {
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', "translate(850, 0)");

  legend.selectAll('line')
    .data(['Objectif (1700kg/an)'])
    .enter()
    .append('line')
    .attr('class', 'threshold-legend')
    .attr('x1', 0)
    .attr('x2', 12)
    .attr('y1', 6)
    .attr('y2', 6);

  legend.selectAll('rect')
    .data(keys)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => (i+1) * 18 )
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', (d, i) => z(i) );

  legend.selectAll('text')
    .data(['Objectif (1700kg/an)', ...keys])
    .enter()
    .append('text')
    .text( (d) => d )
    .attr('x', 18)
    .attr('y', (d, i) => (i * 18) + 6 )
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle');
}


/*  function update (data, bars) {

  // Compute the Y Axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.total; })])
    .rangeRound([height, 0])
    .nice();

  bars
    .data(function (d) { return d; })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .transition()
    // .ease(d3.easeLinear)
    .duration(600)
}*/


// Returns the equivalent in kg of CO2 / year for a given raw value
function mapRawToCO2(value, column) {
  const fcts = {
    'train': (val) => val * 0.028,
    'voiture': (val) => val * 0.131,
    'bus': (val) => val * 0.130,
    '2roues': (val) => val * 0.117,
    'avion': (val) => val * 0.131,

    'porc': (val) => val * 52 * 3.54,
    'boeuf': (val) => val * 52 * 30.8,
  };
  return fcts[column](value);
}


// Process one serie (i.e. one bar in the chart) of the dataset
function processDataSerie(d, columns) {
  let t = 0;
  let d2 = { ...d };
  for (let j = 1; j < columns.length; ++j) {
    let value = +d2[columns[j]];
    value = mapRawToCO2(value, columns[j]);
    d2[columns[j]] = value;
    t += value;
  }
  d2.total = t;
  return d2;
}


// Process the full dataset
function processData (data) {
  let data2 = [];
  data2.columns = data.columns;
  for (let i = 0; i < data.length; ++i) {
    data2[i] = processDataSerie(data[i], data.columns);
  }
  return data2;
}


// Process one serie of the dataset and apply merging (i.e. subcategories => category)
function processDataMergeSerie (d, columns) {
  let t = 0;
  let d2 = {serie: d.serie};
  for (let key in columns) {
    let columns2 = columns[key];
    let acc = 0;
    for (let col2 in columns2) {
      col2 = columns2[col2];
      acc += mapRawToCO2(d[col2], col2);
    }
    d2[key] = acc;
    t += acc;
  }
  d2.total = t;
  return d2;
}


// Process the full dataset and apply merging
function processDataMerge (data) {
  let columns = {
    'alimentaire': ['porc', 'boeuf'],
    'transport': ['train', 'voiture', 'bus', '2roues', 'avion'],
  };

  let data2 = [];
  data2.columns = ['alimentaire', 'transport'];
  for (let i = 0; i < data.length; ++i) {
    data2[i] = processDataMergeSerie(data[i], columns);
  }
  return data2;
}
