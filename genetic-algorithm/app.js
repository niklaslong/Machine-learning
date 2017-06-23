


// BRAIN ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

var brain = function() {
  let dataArray = [[{x: 3,y: 4}, {x: 5,y: 7}, {x: 4,y: 5}], "x", "y"];
  draw(dataArray);
};


// D3 ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 
 var draw = function(dataArray) {

   let data = dataArray[0],
       prop1 = dataArray[1],
       prop2 = dataArray[2];


  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var x = d3.scaleLinear()
    .range([0, width]);

  var y = d3.scaleLinear()
    .range([height, 0]);

  data.forEach(function(d) {
      d.age = +d.age; // formats whatever d.age is in d3.csv to number
      d.count = +d.count;
  });

  var line = d3.line()
    .x(function(d) { return x(d[prop1]); })
    .y(function(d) { return y(d[prop2]); });

  x.domain(d3.extent(data, function(d) { return d[prop1]; }));
  y.domain(d3.extent(data, function(d) { return d[prop2]; }));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("dx", "0.71em")
      .attr("y", 30)
      .attr("x", width)
      .attr("text-anchor", "start")
      .text("x");
    

  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("y");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);


 };

brain();