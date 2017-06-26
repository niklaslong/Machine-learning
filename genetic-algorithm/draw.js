let pathData;

var draw = function() {
  for (let i in pathData) {
    drawLines([pathData[i], 'x', 'y']);
  }

  console.log(pathData);
};

var drawLines = function(inputDataArray) {

    let dataArray = inputDataArray[0],
        prop1 = inputDataArray[1],
        prop2 = inputDataArray[2];

    let margin = {top: 20, right: 20, bottom: 60, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

      var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");



      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleLinear()
      .range([0, width]);

    var y = d3.scaleLinear()
      .range([height, 0]);

    dataArray.forEach(function(data) { data.forEach(function(d) {
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

    //Dynamic domains
    // x.domain(d3.extent(domainArray, function(d) { return d[prop1]; }));
    // y.domain(d3.extent(domainArray, function(d) { return d[prop2]; }));

    //Static domain
    x.domain([0, 105]).nice();
    y.domain([0, 105]).nice();

    svg.append("circle")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
      .attr("cx", x(50))
      .attr("cy", y(0))
      .attr("r", 3);

      svg.append("circle")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
      .attr("cx", x(50))
      .attr("cy", y(100))
      .attr("r", 4);

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

        var generateColor = function() {
          return '#'+Math.random().toString(16).substr(-6);
        };
      

        for (let i = 0; i < dataArray.length; i++) {
          g.append("path")
            .datum(dataArray[i])
            .attr("fill", "none")
            .attr("stroke", generateColor())
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineArray[i]);
              
        }

  };

var getData = function() {
  fetch("data.json")
  .then(response => response.json())
  .then(data => {
    pathData = data;
  })
  .then(function() {
    draw();
  });
};

  window.onload = function() {
    getData();
  };