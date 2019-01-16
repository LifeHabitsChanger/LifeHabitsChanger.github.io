// Dimensions of the SVG
const margin = {top: 20, right: 20, bottom: 70, left: 100};
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


// Get the SVG
const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("text-align", "center")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("text-align", "center");

// Emplacement de "Moi" dans orig_data et extra_data
let moi = 4;

// Raw data (e.g. with kilometers or kilograms)
// This data is not to be displayed (need processing first)
// We will change this data using the form
let orig_data = [
  { // Francais moyen
    "serie": "Français moyen",
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
    "Moto": "188",
    "Avion": "209",
    "Chauffage": "1",
    "Électroménager": "1",
    "ChauffageEau": "1"
  },
  { // Francais fortuné
    "serie": "Fortuné",
    "Boeuf, agneau": "0.75",
    "Poulet, poisson, porc": "0.35",
    "Produits laitiers": "0.4",
    "Céréales, pain": "0.3",
    "Légumes": "0.15",
    "Fruits": "0.2",
    "Huile, margarine": "0.2",
    "En-cas, sucre": "0.05",
    "Boisson": "0.2",
    "Train": "0",
    "Voiture": "10000",
    "Bus": "0",
    "Moto": "0",
    "Avion": "15000",
    "Chauffage": "0.82",
    "Électroménager": "0.82",
    "ChauffageEau": "0.82"
  },
  { // Francais infortuné
    "serie": "Infortuné",
    "Boeuf, agneau": "0.75",
    "Poulet, poisson, porc": "0.35",
    "Produits laitiers": "0.4",
    "Céréales, pain": "0.3",
    "Légumes": "0.15",
    "Fruits": "0.2",
    "Huile, margarine": "0.2",
    "En-cas, sucre": "0.05",
    "Boisson": "0.2",
    "Train": "1000",
    "Voiture": "0",
    "Bus": "6000",
    "Moto": "3000",
    "Avion": "0",
    "Chauffage": "1.18",
    "Électroménager": "1.18",
    "ChauffageEau": "1.18"
  },
  { // Français écologiste
    "serie": "Écologiste",
    "Boeuf, agneau": "0",
    "Poulet, poisson, porc": "0",
    "Produits laitiers": "0.3",
    "Céréales, pain": "0.5",
    "Légumes": "0.25",
    "Fruits": "0.3",
    "Huile, margarine": "0.1",
    "En-cas, sucre": "0.05",
    "Boisson": "0.2",
    "Train": "10000",
    "Voiture": "1000",
    "Bus": "2000",
    "Moto": "0",
    "Avion": "0",
    "Chauffage": "0.73",
    "Électroménager": "0.73",
    "ChauffageEau": "0.73"
  },
  { // Moi
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
    "Moto": "188",
    "Avion": "209",
    "Chauffage": "1",
    "Électroménager": "1",
    "ChauffageEau": "1"
  }];

let extra_data = [
  {
    "serie": "Français moyen",
    "Surface": "91",
    "nbHabitant":"2.31",
    "mangerLocal":"false",
    "debrancherAppareils":"false",
    "douche":"false"
  },
  {
    "serie": "Fortuné",
    "Surface": "200",
    "nbHabitant":"2",
    "mangerLocal":"false",
    "debrancherAppareils":"false",
    "douche":"false"
  },
  {
    "serie": "Infortuné",
    "Surface": "46",
    "nbHabitant":"5",
    "mangerLocal":"false",
    "debrancherAppareils":"false",
    "douche":"true"
  },
  {
    "serie": "Écologiste",
    "Surface": "50",
    "nbHabitant":"2",
    "mangerLocal":"true",
    "debrancherAppareils":"true",
    "douche":"true"
  },
  {
    "serie": "Moi",
    "Surface": "91",
    "nbHabitant":"2.31",
    "mangerLocal":"false",
    "debrancherAppareils":"false",
    "douche":"false"
  },];

orig_data.columns = Object.keys(orig_data[0]);
extra_data.columns = Object.keys(extra_data[0]);

// Transform the data (raw value => kg of CO2 / year)
let data = processData(orig_data);


// We have 2 representations, so we retain the 2 sets of keys
const keysNotMerged = data.columns.slice(1);
const keysMerged = ['Alimentaire', 'Transport', 'Énergie'];
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
            "#4682B4", // Moto
            "#87CEEB", // Avion

            "#6B8E23", // Chauffage
            "#9ACD32", // Eau chaude
            "#008000", // Electromenager

            "#CD5C5C", // Alimentaire
            "#4169E1", // Transports
            "#3CB371"  // Énergie
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

// Gestion des checkbox
$("#mangerLocal").on('change', (val) => update() );
$("#debrancherAppareils").on('change', (val) => update() );
$("#douche").on('change', (val) => update() );

$("#stereotype").on('change', () => {
    let type = $("#stereotype").prop('selectedIndex');
    orig_data[moi] = { ...orig_data[type], serie: 'Moi' };
    extra_data[moi] = { ...extra_data[type], serie: 'Moi' };
    // Re-draw the graph
    update();

    // Update the form based on the new values
    let elts = ["Chauffage", "Électroménager", "ChauffageEau", "Train", "Voiture", "Bus", "Moto", "Avion"];
    elts.forEach( (sliderName) => {
        let $slider = $(`#${sliderName}`);
        $slider.val(orig_data[moi][sliderName]);
    });
    elts = ["nbHabitant", "Surface"];
    elts.forEach( (sliderName) => {
        let $slider = $(`#${sliderName}`);
        $slider.val(extra_data[moi][sliderName]);
    });
    elts = ["mangerLocal", "debrancherAppareils", "douche"];
    elts.forEach( (checkboxName) => {
        let $checkbox = $(`#${checkboxName}`);
        $checkbox.prop('checked', extra_data[moi][checkboxName]);
    });
    let chicken = orig_data[moi]["Poulet, poisson, porc"];
    let milk = orig_data[moi]["Produits laitiers"];
    if (chicken === 0.4 && milk === 0.5) {
        $alim.val(0).change();
    } else if (chicken === 0.35 && milk === 0.4) {
        $alim.val(1).change();
    } else if (chicken === 0.5 && milk === 0.4) {
        $alim.val(2).change();
    } else if (chicken === 0 && milk === 0.3) {
        $alim.val(3).change();
    } else if (chicken === 0 && milk === 0) {
        $alim.val(4).change();
    }
})

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
      orig_data[moi]["Boeuf, agneau"] = 1.5;
      orig_data[moi]["Poulet, poisson, porc"] = 0.4;
      orig_data[moi]["Produits laitiers"] = 0.5;
      orig_data[moi]["Céréales, pain"] = 0.2;
      orig_data[moi]["Légumes"] = 0.1;
      orig_data[moi]["Fruits"] = 0.1;
      orig_data[moi]["Huile, margarine"] = 0.25;
      orig_data[moi]["En-cas, sucre"] = 0.05;
      orig_data[moi]["Boisson"] = 0.2;
      break;
    case "Moyen":
      orig_data[moi]["Boeuf, agneau"] = 0.75;
      orig_data[moi]["Poulet, poisson, porc"] = 0.35;
      orig_data[moi]["Produits laitiers"] = 0.4;
      orig_data[moi]["Céréales, pain"] = 0.3;
      orig_data[moi]["Légumes"] = 0.15;
      orig_data[moi]["Fruits"] = 0.2;
      orig_data[moi]["Huile, margarine"] = 0.2;
      orig_data[moi]["En-cas, sucre"] = 0.05;
      orig_data[moi]["Boisson"] = 0.2;
      break;
    case "Sans boeuf":
      orig_data[moi]["Boeuf, agneau"] = 0;
      orig_data[moi]["Poulet, poisson, porc"] = 0.5;
      orig_data[moi]["Produits laitiers"] = 0.4;
      orig_data[moi]["Céréales, pain"] = 0.3;
      orig_data[moi]["Légumes"] = 0.15;
      orig_data[moi]["Fruits"] = 0.2;
      orig_data[moi]["Huile, margarine"] = 0.2;
      orig_data[moi]["En-cas, sucre"] = 0.05;
      orig_data[moi]["Boisson"] = 0.2;
      break;
    case "Végétarien":
      orig_data[moi]["Boeuf, agneau"] = 0;
      orig_data[moi]["Poulet, poisson, porc"] = 0;
      orig_data[moi]["Produits laitiers"] = 0.3;
      orig_data[moi]["Céréales, pain"] = 0.5;
      orig_data[moi]["Légumes"] = 0.25;
      orig_data[moi]["Fruits"] = 0.3;
      orig_data[moi]["Huile, margarine"] = 0.1;
      orig_data[moi]["En-cas, sucre"] = 0.05;
      orig_data[moi]["Boisson"] = 0.2;
      break;
    case "Végan":
      orig_data[moi]["Boeuf, agneau"] = 0;
      orig_data[moi]["Poulet, poisson, porc"] = 0;
      orig_data[moi]["Produits laitiers"] = 0;
      orig_data[moi]["Céréales, pain"] = 0.55;
      orig_data[moi]["Légumes"] = 0.25;
      orig_data[moi]["Fruits"] = 0.3;
      orig_data[moi]["Huile, margarine"] = 0.15;
      orig_data[moi]["En-cas, sucre"] = 0.05;
      orig_data[moi]["Boisson"] = 0.2;
      break;
  }
  update()
}

// Convenience method for each slider of the form
function handleSlider(sliderName) {
  let energyValToClass = {
    "0.73" : "A",
    "0.82" : "B",
    "0.91" : "C",
    "1" : "D",
    "1.09" : "E",
    "1.18" : "F",
    "1.27" : "G"
  };

  let $span = $(`#${sliderName}-valeur`);
  if (sliderName === "Chauffage" || sliderName === "Électroménager" || sliderName === "ChauffageEau") {
    $span.text(energyValToClass[orig_data[moi][sliderName] + ""]);
  } else {
    $span.text(orig_data[moi][sliderName]);
  }

  let $slider = $(`#${sliderName}`);

  if (sliderName === "nbHabitant") {
    $slider.val(2.31);
  } else if (sliderName === "surface") {
    $slider.val(91);
  } else {
    $slider.val(orig_data[moi][sliderName]);
  }

  $slider.on('input', function () {
    let newValue = $(this).val();
    if (sliderName === "Chauffage" || sliderName === "Électroménager" || sliderName === "ChauffageEau") {
      $span.text(energyValToClass[newValue + ""]);
    } else {
      $span.text(newValue);
    }
    orig_data[moi][sliderName] = (+newValue);
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

  // Draw the X Axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  // Draw the Y Axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Emission d'équivalent C02 (kg/an)");

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
  let y_values = [0, 36, 54, 72, 108, 126, 144, 162, 180, 216, 234, 252, 270, 288, 306, 324, 342, 360];
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 250}, 50)`);

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
    .attr('y', (d, i) => y_values[i+1] )
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', (d) => z(d) );

  legend.selectAll('text')
    .data(['Objectif COP21 (4200 kg CO2/an)', ...keys])
    .enter()
    .append('text')
    .text( (d) => d )
    .attr('x', 18)
    .attr('y', (d, i) => y_values[i] + 6 )
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle');
}


// Returns the equivalent in kg of CO2 / year for a given raw value
function mapRawToCO2(value, i, column) {


  let kwHtoCO2 = 0.44;
  let surfaceValeur = (i === moi)? $(`#surface`).val() : extra_data[i]["Surface"];
  let nbHab = (i === moi)? $(`#nbHabitant-valeur`).text() : extra_data[i]["nbHabitant"];
  let coefMangerLocal = (i === moi)?
    ((document.getElementById("mangerLocal").checked) === true)? 0.9 : 1:
    (extra_data[i]["mangerLocal"] === "true")? 0.9 : 1;
  let consoBaseElectromenager = (i === moi)?
    ((document.getElementById("debrancherAppareils").checked) === true)? 800 : 1100 :
    (extra_data[i]["debrancherAppareils"] === "true")? 800 : 1100;
  let consoChauffeEau = (i === moi)?
    ((document.getElementById("douche").checked) === true)? 400 : 800 :
    (extra_data[i]["douche"] === "true")? 400 : 800;

  const fcts = {
    'Train': (val) => val * 0.028,
    'Voiture': (val) => val * 0.131,
    'Bus': (val) => val * 0.130,
    'Moto': (val) => val * 0.117,
    'Avion': (val) => val * 0.131,
    "Boeuf, agneau": (val) => val * 1000 * coefMangerLocal,
    "Poulet, poisson, porc": (val) => val * 1000 * coefMangerLocal,
    "Produits laitiers": (val) => val * 1000 * coefMangerLocal,
    "Céréales, pain": (val) => val * 1000 * coefMangerLocal,
    "Légumes": (val) => val * 1000 * coefMangerLocal,
    "Fruits": (val) => val * 1000 * coefMangerLocal,
    "Huile, margarine": (val) => val * 1000 * coefMangerLocal,
    "En-cas, sucre": (val) => val * 1000 * coefMangerLocal,
    "Boisson": (val) => val * 1000 * coefMangerLocal,
    "Chauffage": (val) => (val * 110 * surfaceValeur * kwHtoCO2) / nbHab ,
    "Électroménager": (val) => (val * consoBaseElectromenager * kwHtoCO2)/ nbHab ,
    "ChauffageEau": (val) => val * consoChauffeEau * kwHtoCO2
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
    'Transport': ["Train", "Voiture", "Bus", "Moto", "Avion"],
    'Énergie': ["Chauffage", "Électroménager", "ChauffageEau"],
  };

  let data2 = [];
  data2.columns = ['Alimentaire', 'Transport', 'Énergie'];
  for (let i = 0; i < data.length; ++i) {
    data2[i] = processDataMergeSerie(data[i], i, columns);
  }
  return data2;
}
