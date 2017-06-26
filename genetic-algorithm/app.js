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
        n = 5; // number of selected parents 

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

    return selectedParents;
  };


// CROSSOVER –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var selectCouple = function(parentsArray, n) {
    let coupleArray = [],
        one = Math.floor(Math.random() * (n - 0)),
        two = Math.floor(Math.random() * (n - 0));

    coupleArray.push(parentsArray[one], parentsArray[two]);

    return coupleArray;  
  };

  var createChild = function(coupleArray) {
    let father = arrayDeepCopy(coupleArray[0]),
        mother = arrayDeepCopy(coupleArray[1]),
        child = [];
        
    for (let i in father) {
      let num = Math.floor(Math.random() * (2));
      
      num === 0 ? child.push(father[i]) : child.push(mother[i]);
    }

    return child;
  };

  var createChildren = function(parentsArray) {
    let n = parentsArray.length, // number of parents
        c = 10,                  // number of children
        childrenArray = [],
        i = 0;

    while (i < c) {
      let coupleArray = selectCouple(parentsArray, n);
      child = createChild(coupleArray);
      
      childrenArray.push(child);
      i = childrenArray.length;
    }

    return childrenArray;
  };

  var crossOver = function(selectedParentsArray) {
    let parentsArray = arrayDeepCopy(selectedParentsArray);
    let childrenArray = createChildren(parentsArray);

    return childrenArray;
  };

  // MUTATION ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var mutate = function(workingArray, xOrY) {
    
    for (let i in workingArray) {
      for (let j in workingArray[i]) {
        let num = Math.random();

        if (num < 0.2) {
          let plusOrMinus = Math.random() * (2),
              mutation = Math.random() * (5); // segment length

          plusOrMinus === 0 ? workingArray[i][j][xOrY] += mutation : workingArray[i][j][xOrY] -= mutation;
        }
      }
    }
    
  return workingArray;

  };

  var mutation = function(inputArray) {
    let childrenArray = arrayDeepCopy(inputArray);

    mutate(childrenArray, 'x');
    mutate(childrenArray, 'y');

    return childrenArray;
  };


// BRAIN –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  var nextGeneration = function(pathArray) {
    
    let evaluatedPathArray = arrayDeepCopy(fitness(pathArray));
    let selectedParentsArray = selection(evaluatedPathArray);


    let childrenArray = crossOver(selectedParentsArray);
    let mutatedChildrenArray = mutation(childrenArray);

    // console.log('inputDataArray: ', inputDataArray);
    // console.log('pathArray: ', pathArray);
    // console.log('evaluatedPathArray: ', evaluatedPathArray);
    // console.log('selectedParentsArray: ', selectedParentsArray);

    return mutatedChildrenArray;
  };

  var generateNGenerations = function(pathArray, n) {

    let currentGeneration = arrayDeepCopy(pathArray);
    let generationArray = [];
    
    for (let i = 0; i < n; i++) {
      generationArray.push(arrayDeepCopy(currentGeneration));
      currentGeneration = arrayDeepCopy(nextGeneration(currentGeneration));
    }

    return generationArray;
  };

  var brain = function() {
    let i = 0;

    let inputDataArray = (createDataArray());
    let pathArray = arrayDeepCopy(inputDataArray[0]);

    // let generation1 = arrayDeepCopy(nextGeneration(pathArray));
    // let generation2 = arrayDeepCopy(nextGeneration(generation1));
    // let generation3 = arrayDeepCopy(nextGeneration(generation2));

    let generationArray = arrayDeepCopy(generateNGenerations(pathArray, 3));

    let output = arrayDeepCopy(generationArray);

    // for (let i in generationArray) {
    //   drawLines([generationArray[i], 'x', 'y']);
    // }


    // drawLines(inputDataArray);
    // drawLines([generation1, 'x', 'y']);
    // drawLines([generation2, 'x', 'y']);
    // drawLines([generation3, 'x', 'y']);
    return generationArray;
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


// D3 ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  //See draw file;


// RUN THE APP ––––––––––––––––––––––––––––––––––––––––––––––––––––––––– 
  
  let output = arrayDeepCopy(brain());

  // function myWrite(output) {
  //   fs.appendFile('output.txt', output, function (err) {
  //     if (err) { /* Do whatever is appropriate if append fails*/ }
  //   });
// }
  console.log(JSON.stringify(output));