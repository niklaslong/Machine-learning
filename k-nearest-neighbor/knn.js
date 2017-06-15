/* 
Node object properties:
  (Initial)
    rooms: number of rooms
    area: square feet
    type: apartment, house, flat or false if unknown

    (Defined in determineUnknown())
    neighbors: array containing neighbor nodes with a defined type

  (Defined in measureDistance() but only for neighbor nodes contained in neighbors array (whose type is defined))
    distance: distance between this neighbor node and the unknown node currently being evaluated

  (Defined in guessType())
    guess: object containing key value pairs for:
      type: for node type ('apartment', 'flat' or 'house')
      count: it's number of occurences



NodeList object properties:
  (Initial)
    nodes: array of nodes
    k: number of neighbor nodes to evaluate
    
  (Defined in calculateRanges())
    rooms: object containing max and min value for room number found in node array
    areas: object containing max and min value for area size found in node array

// ––––––––––––––––––––––––––––––––––––

Steps:

  1. Calculate working range by finding min and max values for room and area present in node array. (calculateRanges())
 
  2. Loop through nodes and find unknown types.
 
  3. On each node with an unknown type, define a new property. This property will store all the nodes in the set which have a defined type.
  
  4. For the current node with unknown type in the loop, run measureDistance(). This takes in the nodeList's rooms and areas properties as arguments. The function then subtracts the min values from their max values and stores them in two variables. It then loops through the node's neighbor array and subtracts the current node's room property from the neighbors room property: delta_rooms. Then, delta_rooms is divided by the rooms_range. This garanties values between -1 and +1 because the range is the biggest delta possible between the values. If the two nodes happen to be the same which defined the two extreme values (max and min) the division will result in either 1 or -1 depending on which was subtracted from the other. The distance between the current unknown node and the known node is then calculated using pythagoras.
  
  5. sortByDistance() uses a sort function which will sort the neighbor nodes array for the unknown node by distance. The sorting is from smallest to largest. The aim is to pust the closest neighbor nodes at the beginning of the array. This article was useful in regards to advanced sorting: https://www.sitepoint.com/sophisticated-sorting-in-javascript/

  6. guessType() starts by slicing the array and selects only the first k neighbors. It then loops through the selected neighbor nodes. The types object is going to hold key value pairs for the type i.e. 'apartment', 'house', 'flat' and their respective counts which start at 0 and are individualy incremented every time the neighbor node has one of those types. The function then loops through the types object and finds the largest count for a type and stores as the guess.
*/


var Node = function(object) {
  for (var key in object) {
    this[key] = object[key];
  } 
};

Node.prototype.measureDistances = function(area_range_obj, rooms_range_obj) {
  var rooms_range = rooms_range_obj.max - rooms_range_obj.min;
  var area_range = area_range_obj.max - area_range_obj.min;

  for (var i in this.neighbors) {
    var neighbor = this.neighbors[i];

    var delta_rooms = neighbor.rooms - this.rooms;
    delta_rooms = (delta_rooms) / rooms_range;

    var delta_area = neighbor.area - this.area;
    delta_area = (delta_area) / area_range;

    neighbor.distance = Math.sqrt(delta_rooms*delta_rooms + delta_area*delta_area);
  }
};

Node.prototype.sortByDistance = function() {
  this.neighbors.sort(function(a, b) {
    return a.distance - b.distance;
  });
};

Node.prototype.guessType = function(k) {
  var types = {};

  for (var i in this.neighbors.slice(0, k)) {
    var neighbor = this.neighbors[i];

    if ( ! types[neighbor.type]) {
      types[neighbor.type] = 0;
    }
    types[neighbor.type] += 1;
  }

  var guess = {type: false, count: 0};

  for (var type in types) {
    if (types[type] > guess.count) {
      guess.type = type;
      guess.count = types[type];
    }
  }
  this.guess = guess;
  return types;
};

var NodeList = function(k) {
  this.nodes = [];
  this.k = k;
};

NodeList.prototype.add = function(node) {
  this.nodes.push(node);
};

NodeList.prototype.determineUnknown = function() {
  this.calculateRanges(); //1

  // Loop through our nodes and look for unknown types

  for (var i in this.nodes) { // 2
    if ( ! this.nodes[i].type) {
      // If the node is an unknown type, clone the nodes list and then measure distances.

      // Cloning nodes with a defined type and storing in neighbor property in the node.
      this.nodes[i].neighbors = []; //3
      
      for (var j in this.nodes) {
        if ( ! this.nodes[j].type) {
          continue;
        }
        this.nodes[i].neighbors.push( new Node(this.nodes[j]) );
      }

      /* Measure distances */
      this.nodes[i].measureDistances(this.areas, this.rooms); //4

      /* Sort by distance */
      this.nodes[i].sortByDistance(); //5

      /* Guess type */
      console.log(this.nodes[i].guessType(this.k)); //6
    }
  }
};

// finds the minimum and maximum values for area and room amongst all the nodes. Determines the range we are working with.
NodeList.prototype.calculateRanges= function() {
  this.areas = {min: 1000000, max: 0};
  this.rooms = {min: 1000000, max: 0};
  for (var i in this.nodes)
  {
    if (this.nodes[i].rooms < this.rooms.min) { //garanties smallest value for room number in node array
      this.rooms.min = this.nodes[i].rooms;  
    }
    
    if (this.nodes[i].rooms > this.rooms.max) { //garanties largest value for room number
      this.rooms.max = this.nodes[i].rooms;
    }

    if (this.nodes[i].area < this.areas.min) { //same for area
      this.areas.min = this.nodes[i].area;
    }

    if (this.nodes[i].area > this.areas.max) { //idem
      this.areas.max = this.nodes[i].area;
    }
   }
};



NodeList.prototype.draw = function(canvas_id) {
  var rooms_range = this.rooms.max - this.rooms.min;
  var areas_range = this.areas.max - this.areas.min;

  var canvas = document.getElementById(canvas_id);
  var ctx = canvas.getContext("2d");

  var width = 400;
  var height = 400;
  ctx.clearRect(0, 0, width, height);

  for (var i in this.nodes) {
    ctx.save();
    switch (this.nodes[i].type) {
      case 'apartment': 
        ctx.fillStyle = 'red';
        break;
      case 'house':
        ctx.fillStyle = 'green';
        break;
      case 'flat':
        ctx.fillStyle = 'blue';
        break;
      default:
        ctx.fillStyle = '#666666';
    }

    var padding = 40;
    var x_shift_pct = (width - padding) / width;
    var y_shift_pct = (height - padding) / height;

    var x = (this.nodes[i].rooms - this.rooms.min) * (width / rooms_range) * x_shift_pct + (padding / 2);
    var y = (this.nodes[i].area - this.areas.min) * (height / areas_range) * y_shift_pct + (padding / 2);
    y = Math.abs(y - height);

    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();

    if ( ! this.nodes[i].type) {
      switch (this.nodes[i].guess.type) {
        case 'apartment':
          ctx.strokeStyle = 'red';
          break;
        case 'house':
          ctx.strokeStyle = 'green';
          break;
        case 'flat':
          ctx.strokeStyle = 'blue';
          break;
        default:
          ctx.strokeStyle = '#666666';       
      }

      var radius = this.nodes[i].neighbors[this.k - 1].distance * width;
      radius *= x_shift_pct;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI*2, true);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }
};


var nodes;

var data = [
  {rooms: 1, area: 350, type: 'apartment'},
  {rooms: 2, area: 300, type: 'apartment'},
  {rooms: 3, area: 300, type: 'apartment'},
  {rooms: 4, area: 250, type: 'apartment'},
  {rooms: 4, area: 500, type: 'apartment'},
  {rooms: 4, area: 400, type: 'apartment'},
  {rooms: 5, area: 450, type: 'apartment'},

  {rooms: 7,  area: 850,  type: 'house'},
  {rooms: 7,  area: 900,  type: 'house'},
  {rooms: 7,  area: 1200, type: 'house'},
  {rooms: 8,  area: 1500, type: 'house'},
  {rooms: 9,  area: 1300, type: 'house'},
  {rooms: 8,  area: 1240, type: 'house'},
  {rooms: 10, area: 1700, type: 'house'},
  {rooms: 9,  area: 1000, type: 'house'},

  {rooms: 1, area: 800,  type: 'flat'},
  {rooms: 3, area: 900,  type: 'flat'},
  {rooms: 2, area: 700,  type: 'flat'},
  {rooms: 1, area: 900,  type: 'flat'},
  {rooms: 2, area: 1150, type: 'flat'},
  {rooms: 1, area: 1000, type: 'flat'},
  {rooms: 2, area: 1200, type: 'flat'},
  {rooms: 1, area: 1300, type: 'flat'},
];

var run = function() {
  nodes = new NodeList(10);

  for (var i in data ) {
    nodes.add(new Node(data[i]));
  }

  var random_rooms = Math.round(Math.random() * 10);
  var random_area = Math.round(Math.random() * 2000);
  nodes.add(new Node({rooms: random_rooms, area: random_area, type: false}));

  nodes.determineUnknown();
  nodes.draw("canvas");
};

window.onload = function() {
  setInterval(run, 5000);
  run();
};

