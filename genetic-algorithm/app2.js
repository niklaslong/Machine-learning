//PATH GENERATION ––––––––––––––––––––––––––––––––––––––––––––––––––––––
 
  var generateAngle = function() {
    let deg  = Math.random() * (180 - 0);
    let rad = deg * (Math.PI) / 180;
    return rad;
  };
  
  var generatePath = function(s) {
    path = [];
    
    for (let i = 0; i < s; i++) {
      alpha = generateAngle();
      path.push(alpha);
    }

    return path;
  };
 
  var createDataArray = function(n, s) {
    let pathArray = [];
    
    for (let i = 0; i < n; i++) {
      pathArray.push(generatePath(s));
    }

    return pathArray;
  };

  // FITNESS FUNCTION ––––––––––––––––––––––––––––––––––––––––––––––––––

    var calculateDistance = function(angleArray, nodeArray, endPoint) {
      let lastPoints = [];
      for (let i = 0; i < nodeArray.length; i++) {
        lastPoints.push(nodeArray[i].reverse()[0]); // getting last point in nodeArray 
      }

      for (let i = 0; i < angleArray.length; i++) {
        let lastCoords = lastPoints[i],
            deltaX = endPoint.x - lastCoords.x, // difference in x distance between path's last coord & endpoint
            deltaY = endPoint.y - lastCoords.y, // same for y
            deltaD = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // same for total

        angleArray[i].unshift({distance: deltaD});
      }
      return angleArray;
    };

    var fitness = function(pathArray, l, startPoint, endPoint) {
      let angleArray = arrayDeepCopy(pathArray),
          nodeArray = arrayDeepCopy(calculateNodes(angleArray, l, startPoint)),
          angle_w_distance_a = arrayDeepCopy(calculateDistance(angleArray, nodeArray, endPoint));
      
          

      return 'nothing returned from fitness yet!';
    };

  // BRAIN –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var brain = function() {
    let n = 10, // number of paths
        s = 22, // number of segments per path
        l = 5,  // length of segment
        p = 5,  // number of parents
        c = 10, // number of children    
        startPoint = {x: 50, y: 0},
        endPoint = {x: 50, y: 100}; 

    let pathArray = arrayDeepCopy(createDataArray(n, s));

    console.log(fitness(pathArray, l, startPoint, endPoint));

    //D3
    let d3Data = createD3Data(pathArray, l, startPoint, endPoint);
    drawLines(d3Data);
  };



  // HELPER CODE –––––––––––––––––––––––––––––––––––––––––––––––––––––––

    var arrayDeepCopy = function(array) {
      var copy = JSON.parse(JSON.stringify(array));
      return copy;
    };

    var lastElementInArray = function(array) {
      return array[array.length-1];
    };

    // Durstenfeld shuffle (computer optimized Fischer-Yates shuffle)
    // 1. Works from end to begining - selects last el, sets it = to currEl
    // 2. Selects random number between 0 and i (array.length decrementing) (i+1 necessary otherwise last el excluded)
    // 3. Swaps random el (array[j] for last array[i])
    // 4. Continues until it arrives at the begining of array.
    var shuffleArray = function(inputArray) {
      let array = arrayDeepCopy(inputArray);

      for (let i = array.length - 1; i > 0; i--) {
        let currEl = array[i],
            j = Math.floor(Math.random() * (i + 1));

        array[i] = array[j];
        array[j] = currEl;
      }
      return array;
    };

// DRAW and FITNESS HELPER –––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var calculateXY = function(angle, l, coord = {x: 50, y: 0}) {
    let newCoord = {x: null, y: null};

    newCoord.x = coord.x + Math.cos(angle) * l;
    newCoord.y = coord.y + Math.sin(angle) * l; // length of segment

    return newCoord;
  };
  
  var calculateNodes = function(pathArray, l, startPoint) {
   let nodeArray = [];

    for (let i = 0; i < pathArray.length; i++) {
      let path = [],
          lastPoint = startPoint;

      for (let j = 0; j <= pathArray[i].length; j++) {
        path.push(lastPoint);
        let node = calculateXY(pathArray[i][j], l, lastPoint);
        lastPoint = node;
      }
      nodeArray.push(path);
    }
    return nodeArray;
  };

  var createD3Data = function(pathArray, l, startPoint) {
    let nodeArray = calculateNodes(pathArray, l, startPoint);

    return [nodeArray, 'x', 'y'];
  };


// D3 ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

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



// RUN THE APP –––––––––––––––––––––––––––––––––––––––––––––––––––––––––

brain();

  // function myWrite(output) {
  //   fs.appendFile('output.txt', output, function (err) {
  //     if (err) { /* Do whatever is appropriate if append fails*/ }
  //   });
// }
