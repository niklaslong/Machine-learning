//PATH GENERATION ––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var generateAngle = function() {
    let deg  = Math.random() * (180 - 0); 
    let rad = deg * (Math.PI) / 180; 
    return rad;
  };
  
  // generates a random chord from previous chord
  // Input: {x, y} of previous chord. If no previous chord is specified {x: 0, y: 0} is default param.
  // Output: {x: y} (generated choord)
  var generateCoord = function(coord = {x: 50, y: 0}) {
    let newCoord = {x: null, y: null};

    let alphaX = generateAngle();
    let alphaY = generateAngle(); 

    newCoord.x = coord.x + Math.cos(alphaX) * 5;
    newCoord.y = coord.y + Math.sin(alphaY) * 5; // length of segment

    return newCoord;
  };

  var generatePath = function() {
    let path = [{x: 50, y: 0}]; //all paths start at starting point
    let latestCoord;
      
    for (let i = 0; i < 23; i++) { //change max value for i (number of segments per path)
      latestCoord = generateCoord(latestCoord);
      path.push(latestCoord);
    }

  return path;
  };

  var createDataArray = function() {
    let pathArray = [];
    let formatedDataArray = [];

    for (let i = 0; i < 10; i++) { // number of paths
      let path = generatePath();
      pathArray.push(path);
    }

    formatedDataArray.push(pathArray, "x", "y");

    return formatedDataArray;
  };

// FITNESS FUNCTION ––––––––––––––––––––––––––––––––––––––––––––––––––––

  var calculateDistance = function(lastCoords) { // last coords is {x: ,y: }
    let endPoint = {x: 50, y: 100}; // Objective to reach for path
    
    let deltaX = endPoint.x - lastCoords.x, // difference in x distance between path's last coord and endpoint
        deltaY = endPoint.y - lastCoords.y, // same for y
        deltaD = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // same for total

    return deltaD;
  };
  
  var calculateFitness = function(lastCoords) {
      let deltaD = calculateDistance(lastCoords),
          totalD = 100, // Total distance between start point and endpoint
          score; 

      score = (totalD - deltaD) * 100 / totalD;

      return score;
  };

  var fitness = function(pathArray) {
    let evaluatedPathArray = arrayDeepCopy(pathArray);
  
    for (let i in pathArray) {
      let lastCoords = pathArray[i][pathArray[i].length-1]; //last coords in path
      let score = calculateFitness(lastCoords);
      evaluatedPathArray[i].push({rawFitness: score});
    }

    return evaluatedPathArray;
  };


// SELECTION –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var normalise = function(evaluatedPathArray) {
    let workingArray = arrayDeepCopy(evaluatedPathArray),
        rawFitnessArray = [],
        fitnessTotal = 0;

    for (let i in workingArray) {
      rawFitnessArray.push(workingArray[i].slice(-1).pop());
    }

    for (let i in rawFitnessArray) {
      fitnessTotal += rawFitnessArray[i].rawFitness;
    }

    for (let i in workingArray) {
      let normFitness = lastElementInArray(workingArray[i]).rawFitness / fitnessTotal;
      workingArray[i][workingArray[i].length-1].normalisedFitness = normFitness;
    }
    return workingArray;
  };

  var sortDescending = function(normalisedPathArray) {
    let workingArray = arrayDeepCopy(normalisedPathArray);

    workingArray.sort(function(a, b) {
      return b[b.length-1].normalisedFitness - a[a.length-1].normalisedFitness;
    });
    return workingArray;
  };

  var accumulateFitness = function(sortedNormArray) {
    let workingArray = arrayDeepCopy(sortedNormArray);

    for (let i in workingArray) {
      workingArray[i][workingArray[i].length-1].accumulatedFitness = 0;
      for (let j = 0; j <= i; j++) {

        workingArray[i][workingArray[i].length-1].accumulatedFitness += 
        workingArray[j][workingArray[j].length-1].normalisedFitness;

      }
    }

    // verification
    // for (let i in workingArray) {
    //   console.log(lastElementInArray(workingArray[i]).accumulatedFitness);
    // }
        
    return workingArray;
  };

  var selectParent = function(workingArray) {
    let R = Math.random(),
        selectedParent = [{accumulatedFitness: -1}];

    for (let i in workingArray) {
      if (lastElementInArray(workingArray[i]).accumulatedFitness > lastElementInArray(selectedParent).accumulatedFitness) {
        if (lastElementInArray(workingArray[i]).accumulatedFitness < R) { 
          selectedParent = workingArray[i];
        }
      }
    }
    return selectedParent;
  };

  var selectParents = function(workingArray) {
    let selectedParentsArray = [],
        n = 10; // number of selected parents 

    while (selectedParentsArray.length < n) {
      let selectedParent = selectParent(workingArray);

      if (lastElementInArray(selectedParent).accumulatedFitness > -1) {
        selectedParentsArray.push(selectedParent);
      }
    }

    return selectedParentsArray;
  };

  var selection = function(evaluatedPathArray) {
    let pathArrayToSelect = arrayDeepCopy(evaluatedPathArray);

    let normalisedPathArray = normalise(pathArrayToSelect);
    let sortedNormArray = sortDescending(normalisedPathArray);
    let accumulatedFitnessArray = accumulateFitness(sortedNormArray);

    let selectedParents = selectParents(accumulatedFitnessArray);

    return sortedNormArray;
  };


// BRAIN –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var brain = function() {
    // let inputDataArray = [[[{x: 50,y: 0}, {x: 2,y: 5}, {x: 50,y: 100}], [{x: 1,y: 2}, {x: 4,y: 3}, {x: 9,y: 5}],[{x: 3,y: 2}, {x: 4,y: 5}, {x: 19,y: 6}]], "x", "y"];

    let inputDataArray = (createDataArray());
    let pathArray = arrayDeepCopy(inputDataArray[0]);

    let evaluatedPathArray = arrayDeepCopy(fitness(pathArray));
    let selectedPathArray = selection(evaluatedPathArray);

  

    console.log('inputDataArray: ', inputDataArray);
    console.log('pathArray: ', pathArray);
    console.log('evaluatedPathArray: ', evaluatedPathArray);
    console.log('selectedPathArray: ', selectedPathArray);


    drawLines(inputDataArray);
  };

  // HELPER CODE –––––––––––––––––––––––––––––––––––––––––––––––––––––––

    var arrayDeepCopy = function(array) {
      var copy = JSON.parse(JSON.stringify(array));
      return copy;
    };

    var lastElementInArray = function(array) {
      return array[array.length-1];
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