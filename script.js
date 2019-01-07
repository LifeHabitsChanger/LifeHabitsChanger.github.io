// Dimensions of the SVG
const margin = {top: 20, right: 20, bottom: 70, left: 40};
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


// Get the SVG
const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("text-align", "center")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("text-align", "center");


// Raw data (e.g. with kilometers or kilograms)
// This data is not to be displayed (need processing first)
// We will change this data using the form
let orig_data = [
  {
    "serie": "Moyenne français",
    "Boeuf, agneau": "0.75",
    "Poulet, poisson, porc": "0.35",
    "Produits laitiers": "0.4",
    "Céréales, pain": "0.3",
    "Légumes": "0.15",
    "Fruits": "0.2",
    "Huile, margarine": "0.2",
    "En-cas, sucre": "0.05",
    "Boisson": "0.2",
    "Train": "1540",
    "Voiture": "11119",
    "Bus": "1226",
    "2roues": "188",
    "Avion": "209",
    "Chauffage": "1.09",
    "Électroménager": "1.09",
    "ChauffageEau": "1.09"
  },
  {
    "serie": "Moi",
    "Boeuf, agneau": "0.75",
    "Poulet, poisson, porc": "0.35",
    "Produits laitiers": "0.4",
    "Céréales, pain": "0.3",
    "Légumes": "0.15",
    "Fruits": "0.2",
    "Huile, margarine": "0.2",
    "En-cas, sucre": "0.05",
    "Boisson": "0.2",
    "Train": "1540",
    "Voiture": "11119",
    "Bus": "1226",
    "2roues": "188",
    "Avion": "209",
    "Chauffage": "1.09",
    "Électroménager": "1.09",
    "ChauffageEau": "1.09"
  }];

orig_data.columns = Object.keys(orig_data[0]);


// Transform the data (raw value => kg of CO2 / year)
let data = processData(orig_data);


// We have 2 representations, so we retain the 2 sets of keys
const keysNotMerged = data.columns.slice(1);
const keysMerged = ['Alimentaire', 'Transport', 'Energie'];
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


// Si l'on change l'ordre du dataset, il faut changer ici aussi
const z = d3.scaleOrdinal()
    .range(["#8B0000", // Boeuf, agneau
            "#DD3333", // Poulet, poisson, porc
            "#B22222", // Produits laitiers
            "#CC143C", // Céréales, pain
            "#CD5C5C", // Légumes
            "#F08080", // Fruits
            "#E9967A", // Huile, margarine
            "#FA8072", // En-cas, sucre
            "#FFA07A", // Boisson

            "#6495ED", // Train
            "#4169E1", // Voiture
            "#B0E0E6", // Bus
            "#4682B4", // 2roues
            "#87CEEB", // Avion

            "#6B8E23", // Chauffage
            "#9ACD32", // Eau chaude 
            "#008000", // Electromenager

            "#CD5C5C", // Alimentaire
            "#4169E1", // Transports
            "#3CB371"  // Energie
           ])
    .domain([...keysNotMerged, ...keysMerged]);



// Update the SVG when the form changes
const $fusionner = $("#fusionner");
$fusionner.on('change', () => update() );
keysNotMerged.forEach( (key) => handleSlider(key) );

handleSlider("nbHabitant");
handleSlider("surface");


// Liste déroulante pour l'alimentaire
const $alim = $("#alimentaire");
$alim.on('change', (val) => handleAlimentaire(val) );

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

// Gère la liste déroulante pour l'alimentaire
function handleAlimentaire(val)
{
  switch($alim.val()){
    case "Beaucoup de viande":
      orig_data[1]["Boeuf, agneau"] = 1.5;
      orig_data[1]["Poulet, poisson, porc"] = 0.4;
      orig_data[1]["Produits laitiers"] = 0.5;
      orig_data[1]["Céréales, pain"] = 0.2;
      orig_data[1]["Légumes"] = 0.1;
      orig_data[1]["Fruits"] = 0.1;
      orig_data[1]["Huile, margarine"] = 0.25;
      orig_data[1]["En-cas, sucre"] = 0.05;
      orig_data[1]["Boisson"] = 0.2;
      break;
    case "Moyen":
      orig_data[1]["Boeuf, agneau"] = 0.75;
      orig_data[1]["Poulet, poisson, porc"] = 0.35;
      orig_data[1]["Produits laitiers"] = 0.4;
      orig_data[1]["Céréales, pain"] = 0.3;
      orig_data[1]["Légumes"] = 0.15;
      orig_data[1]["Fruits"] = 0.2;
      orig_data[1]["Huile, margarine"] = 0.2;
      orig_data[1]["En-cas, sucre"] = 0.05;
      orig_data[1]["Boisson"] = 0.2;
      break;
    case "Sans boeuf":
      orig_data[1]["Boeuf, agneau"] = 0;
      orig_data[1]["Poulet, poisson, porc"] = 0.5;
      orig_data[1]["Produits laitiers"] = 0.4;
      orig_data[1]["Céréales, pain"] = 0.3;
      orig_data[1]["Légumes"] = 0.15;
      orig_data[1]["Fruits"] = 0.2;
      orig_data[1]["Huile, margarine"] = 0.2;
      orig_data[1]["En-cas, sucre"] = 0.05;
      orig_data[1]["Boisson"] = 0.2;
      break;
    case "Végétarien":
      orig_data[1]["Boeuf, agneau"] = 0;
      orig_data[1]["Poulet, poisson, porc"] = 0;
      orig_data[1]["Produits laitiers"] = 0.3;
      orig_data[1]["Céréales, pain"] = 0.5;
      orig_data[1]["Légumes"] = 0.25;
      orig_data[1]["Fruits"] = 0.3;
      orig_data[1]["Huile, margarine"] = 0.1;
      orig_data[1]["En-cas, sucre"] = 0.05;
      orig_data[1]["Boisson"] = 0.2;
      break;
    case "Végan":
      orig_data[1]["Boeuf, agneau"] = 0;
      orig_data[1]["Poulet, poisson, porc"] = 0;
      orig_data[1]["Produits laitiers"] = 0;
      orig_data[1]["Céréales, pain"] = 0.55;
      orig_data[1]["Légumes"] = 0.25;
      orig_data[1]["Fruits"] = 0.3;
      orig_data[1]["Huile, margarine"] = 0.15;
      orig_data[1]["En-cas, sucre"] = 0.05;
      orig_data[1]["Boisson"] = 0.2;
      break;
  }
  update()
}

// Convenience method for each slider of the form
function handleSlider(sliderName) {
  let $span = $(`#${sliderName}-valeur`);
  $span.text(orig_data[1][sliderName]);

  let $slider = $(`#${sliderName}`);

  if (sliderName === "nbHabitant") {
    $slider.val(2.31);
  } else if (sliderName === "surface") {
    $slider.val(91);
  } else {
    $slider.val(orig_data[1][sliderName]);
  }

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

  // Threshold (objective of 4200 of CO2 / year)
  svg.append('line')
    .attr('class', 'threshold')
    .attr('x1', x(xDomain[0]))
    .attr('y1', y(4200))
    .attr('x2', width - 300)
    .attr('y2', y(4200));

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
  keys = [...keys].reverse();
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', "translate(850, 0)");

  legend.selectAll('line')
    .data(['Objectif COP21 (4200 kg CO2/an)'])
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
    .attr('fill', (d) => z(d) );

  legend.selectAll('text')
    .data(['Objectif (4200 kg CO2/an)', ...keys])
    .enter()
    .append('text')
    .text( (d) => d )
    .attr('x', 18)
    .attr('y', (d, i) => (i * 18) + 6 )
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle');
}


// Returns the equivalent in kg of CO2 / year for a given raw value
function mapRawToCO2(value, i, column) {

  let kwHtoCO2 = 0.44;
  let surfaceValeur = (i === 0)? 91 : $(`#surface`).val();
  let nbHab = (i === 0)? 2.31 :$(`#nbHabitant-valeur`).text();

  const fcts = {
    'Train': (val) => val * 0.028,
    'Voiture': (val) => val * 0.131,
    'Bus': (val) => val * 0.130,
    '2roues': (val) => val * 0.117,
    'Avion': (val) => val * 0.131,
    "Boeuf, agneau": (val) => val * 1000,
    "Poulet, poisson, porc": (val) => val * 1000,
    "Produits laitiers": (val) => val * 1000,
    "Céréales, pain": (val) => val * 1000,
    "Légumes": (val) => val * 1000,
    "Fruits": (val) => val * 1000,
    "Huile, margarine": (val) => val * 1000,
    "En-cas, sucre": (val) => val * 1000,
    "Boisson": (val) => val * 1000,
    "Chauffage": (val) => (val * 110 * surfaceValeur * kwHtoCO2) / nbHab ,
    "Électroménager": (val) => (val * 1100 * kwHtoCO2)/ nbHab ,
    "ChauffageEau": (val) => val * 800 * kwHtoCO2
  };
  
  return fcts[column](value);
}


// Process one serie (i.e. one bar in the chart) of the dataset
function processDataSerie(d, i, columns) {
  let t = 0;
  let d2 = { ...d };
  for (let j = 1; j < columns.length; ++j) {
    let value = +d2[columns[j]];
    value = mapRawToCO2(value, i, columns[j]);
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
    data2[i] = processDataSerie(data[i], i, data.columns);
  }
  return data2;
}


// Process one serie of the dataset and apply merging (i.e. subcategories => category)
function processDataMergeSerie (d, i, columns) {
  let t = 0;
  let d2 = {serie: d.serie};
  for (let key in columns) {
    let columns2 = columns[key];
    let acc = 0;
    for (let col2 in columns2) {
      col2 = columns2[col2];
      acc += mapRawToCO2(d[col2], i, col2);
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
    'Alimentaire': ['Boeuf, agneau', 'Poulet, poisson, porc', "Produits laitiers", "En-cas, sucre", 'Céréales, pain', 'Légumes', 'Fruits', 'Huile, margarine', 'Boisson'],
    'Transport': ["Train", "Voiture", "Bus", "2roues", "Avion"],
    'Energie': ["Chauffage", "Électroménager", "ChauffageEau"],
  };

  let data2 = [];
  data2.columns = ['Alimentaire', 'Transport', 'Energie'];
  for (let i = 0; i < data.length; ++i) {
    data2[i] = processDataMergeSerie(data[i], i, columns);
  }
  return data2;
}
