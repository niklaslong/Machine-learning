


// BRAIN ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

var brain = function() {
  let inputDataArray = [[[{x: 1,y: 2}, {x: 2,y: 5}, {x: 4,y: 5}], [{x: 1,y: 2}, {x: 4,y: 3}, {x: 9,y: 5}],[{x: 3,y: 2}, {x: 4,y: 5}, {x: 19,y: 6}]], "x", "y"];


  
  draw(inputDataArray);
};


// D3 ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 
var draw = function(inputDataArray) {

  let dataArray = inputDataArray[0],
       prop1 = inputDataArray[1],
       prop2 = inputDataArray[2];


  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var x = d3.scaleLinear()
    .range([0, width]);

  var y = d3.scaleLinear()
    .range([height, 0]);

  dataArray.forEach(function(data) { data.forEach(function(d) {
    console.log(d);
      d[prop1] = +d[prop1]; // formats whatever d.age is in d3.csv to number
      d[prop2] = +d[prop2];
    });
  });


  var lineArray = [];
  
  dataArray.forEach(function(data) {
    var line = d3.line()
      .x(function(d) { return x(d[prop1]); })
      .y(function(d) { return y(d[prop2]); });
    lineArray.push(line);
  });


  domainArray = [];
  for (let i = 0; i < dataArray.length-1; i++) {
    domainArray = dataArray[0]; 
    domainArray = domainArray.concat(dataArray[i+1]);
  }


  x.domain(d3.extent(domainArray, function(d) { return d[prop1]; }));
  y.domain(d3.extent(domainArray, function(d) { return d[prop2]; }));

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

      for (let i = 0; i < dataArray.length; i++) {
        g.append("path")
          .datum(dataArray[i])
          .attr("fill", "none")
          .attr("stroke", function() {return '#'+Math.random().toString(16).substr(-6);})
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", lineArray[i]);
        } 
     



     
};
brain();