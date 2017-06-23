 


// BRAIN ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

var brain = function() {
  let dataArray = [[{x: 3,y: 4}, {x: 5,y: 7}], "x", "y"];
  draw(dataArray);
};


// D3 ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 
 var draw = function(dataArray) {


  let data = dataArray[0],
      prop1 = dataArray[1],
      prop2 = dataArray[2];


  let margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 1200 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;


  // set the ranges for x and y
  let x = d3.scaleLinear().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);


  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //format the data
  data.forEach(function(d) {
      d[prop1] = +d[prop1]; // formats whatever d.age is in d3.csv to number
      d[prop2] = +d[prop2];
  });

  // scale the range of the data
  // d3.extent([1, 4, 3, 2]) -> [1, 4]
  x.domain(d3.extent(data, function(d) { return d[prop1]; })).nice();
  y.domain(d3.extent(data, function(d) { return d[prop2]; })).nice();


  // add the dots
  svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
      .attr("r", 2.5)
      .attr("cx", function(d) { return x(d[prop1]); })
      .attr("cy", function(d) { return y(d[prop2]); })
      .on("click", function() {
        console.log(d);
      });
  
  // add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));

  // add the Y Axis
  svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
};

brain();