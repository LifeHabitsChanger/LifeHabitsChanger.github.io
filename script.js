let $boeufValeur = $('#boeuf-valeur');

const margin = {top: 20, right: 20, bottom: 70, left: 40};
const width = 920 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("fake_data2.csv", (error, orig_data) => {
  if (error) throw error;

  let data = processData(orig_data);

  const keysNotMerged = data.columns.slice(1);
  const keysMerged = ['alimentaire', 'transport'];
  let keys = keysNotMerged;

  const x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1)
    .domain(data.map(function(d) { return d.serie; }));

  const z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
    .domain(keys);

  const bars = draw(data);

  handleSlider('boeuf');
  handleSlider('porc');

  $('#fusionner').on('change', function () {
    update();
  });

  function update () {
    let data;
    if ($('#fusionner').is(':checked')) {
      keys = keysMerged;
      data = processDataMerge(orig_data);
    } else {
      keys = keysNotMerged;
      data = processData(orig_data);
    }
    draw(data, bars);
  }

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

  function draw (data) {

    svg.selectAll('g').remove();

    // Compute the Y Axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d.total; })])
      .rangeRound([height, 0])
      .nice();

    // Create the layers
    const layers = d3.stack().keys(keys)(data);

    // Create new graphics
    const g = svg.append("g").selectAll("g").data(layers);
    const bars = g.enter().append("g")
      .style("fill", function(d) { return z(d.key); })
      .selectAll("rect");

    bars
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.serie); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
          let xPosition = d3.mouse(this)[0] + 30;
          let yPosition = d3.mouse(this)[1] - 30;
          tooltip.attr("transform", `translate(${xPosition}, ${yPosition})`);
          let txt = `${d[1] - d[0]} kg CO2 / an`;
          tooltip.select("text").text(txt);
        });

    // FIXME: label dans les rect

    // Prep the tooltip bits, initial display is hidden
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

    return bars;
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

});

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

function processData (data) {
  let data2 = [];
  data2.columns = data.columns;
  for (let i = 0; i < data.length; ++i) {
    data2[i] = processDataSerie(data[i], data.columns);
  }
  return data2;
}

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
