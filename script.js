const margin = {top: 20, right: 20, bottom: 70, left: 40};
const width = 920 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const add_total = function(d, i, columns) {
  let j = 1;
  let t = 0;
  for (j = 1, t = 0; j < columns.length; ++j) {
    t += d[columns[j]] = +d[columns[j]];
  }
  d.total = t;
  return d;
};

d3.csv("fake_data2.csv", add_total, (error, data) => {
  if (error) throw error;

  // console.log(data);

  const keys = data.columns.slice(1);

  // console.log(keys);

  const x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1)
    .domain(data.map(function(d) { return d.serie; }));

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.total; })])
    .rangeRound([height, 0])
    .nice();

  const z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
    .domain(keys);

  const layers = d3.stack().keys(keys)(data);

  // console.log('Layers = ');
  // console.log(layers);

  svg.append("g").selectAll("g")
    .data(layers)
    .enter().append("g")
      .style("fill", function(d) { return z(d.key); })
    .selectAll("rect")
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
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      let txt = `${d[1] - d[0]} kg CO2 / an`;
      tooltip.select("text").text(txt);
    });

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

});