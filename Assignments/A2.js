// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec2 coordinates;\n' +
  'void main() {\n' +
	'  gl_Position = vec4(coordinates,0.0, 200.0);\n' +
  '}\n';
   
// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform variable
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';
  
var bacteria_list = [];

var computerScore = 0;
var playerScore = 0;
var number_of_bacteria = 5;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    click(ev, gl, canvas, bacteria_list);
  };
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  // Enable the depth test
  gl.enable(gl.DEPTH_TEST);

  // Clear <canvas> and the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var disk_radius = 150; // the radius of disk
  
  bacteria_list = [];
	var speed = 0.1;
	var colors = [
		[1.0, 0.0, 0.0, 1],
		[0.0, 1.0, 0.0, 1],
		[0.0, 0.0, 1.0, 1],
		[1.0, 1.0, 0.0, 1],
		[1.0, 0.0, 1.0, 1],
		[0.0, 1.0, 1.0, 1],
		[0.5, 0.5, 0.0, 1],
		[0.0, 0.5, 0.5, 1],
		[0.5, 0.0, 0.5, 1],
		[0.2, 1.0, 0.2, 1]];

	// var number_of_bacterias = 2;
		 
 	// generate a list of bacterias 
	for (var i = 0; i < number_of_bacteria; i++) {
		 bacteria_list.push(generate_bacteria(colors[i], disk_radius));
	} 

   // Start drawing
  var tick = function() {
	  grow(bacteria_list, speed);
	  
	  // Clear <canvas> and depth buffer
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	  
	 // draw bacterias
	for (var i = 0; i < bacteria_list.length; i++) {
		if (bacteria_list[i][4]) {
			//draw only if it's alive
			draw_circle(gl, bacteria_list[i][0], bacteria_list[i][1], bacteria_list[i][2], bacteria_list[i][3]);
		}
	}
	draw_circle(gl, 0, 0, disk_radius, [1.0, 1.0, 1.0, 1]);	
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick(); 
}

/** simulate the growth of bacteria */
function grow(bacteria_list, speed){
	if (computerScore > 2) {
		return;
	}
	for (var i = 0; i < bacteria_list.length; i++) {
		if (bacteria_list[i][4]) {
			// update only if it's alive

			//Couldnt figure out arc, using radius instead
			if (bacteria_list[i][2] > 60) {
				computerScore++;
				console.log("game point");
				if (computerScore > 2) {	
					var win = document.getElementById('winCondition');
					win.innerHTML = "Computer Wins! Score:" + computerScore;
				}
			}
			bacteria_list[i][2] = bacteria_list[i][2]+speed;
			// calculate circle's radius
			
		}
	}
}


// generate a random floating point value between 0 and max
function getRandom(max) {
	return Math.random() * Math.floor(max);
}

// randomly generate a bacteria's basic info. 
function generate_bacteria(color, r){
		// r is the radius of the disk 
		random_degree = getRandom(360)// random a degree between 0 and 360
		ret = [] // a list
		ret.push(r*Math.sin(random_degree)); // x
		ret.push(r*Math.cos(random_degree)); // y
		ret.push(1); // radius, start from 1
		ret.push(color); // color
		ret.push(true); // alive?  True/False
		return ret;
}

function draw_circle(gl, x, y, r, color){
		/**
		* (x, y): center of the circle 
		* r: radius
		* color: [R,G,B,A] ranging from 0.0 to 1.0
		*/

		//Define the geometry and store it in buffer objects
		//Represent a circle disk through 360 trangles
		 n = 3*360; // number of total vertices
		 var vertices = [];
		 for (var i = 1; i <= 360; i++) {
		 	vertices.push(x);
		 	vertices.push(y);
		 	vertices.push(x+r*Math.sin(i-1));
		 	vertices.push(y+r*Math.cos(i-1));
		 	vertices.push(x+r*Math.sin(i));
		 	vertices.push(y+r*Math.cos(i));
		 }
		    
		 // Create a new buffer object
		 var vertex_buffer = gl.createBuffer();
		
		 // Bind an empty array buffer to it
		 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		 
		 // Pass the vertices data to the buffer
		 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		 
		 //Get the attribute location
		 var coord = gl.getAttribLocation(gl.program, "coordinates");
		 
		 if(coord < 0) {
			console.log('Failed to get the storage location of coord');
			return -1;
		}
		
		// Get the storage location of u_FragColor
		var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
		if (!u_FragColor) {
			console.log('Failed to get the storage location of u_FragColor');
			return;
		}
  
		 //point an attribute to the currently bound VBO
		 gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
		 //Enable the attribute
		 gl.enableVertexAttribArray(coord); 
		 
		 // Pass the color of a point to u_FragColor variable
		 var rgba = color;
		 gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		 
		// Draw the triangles
		 gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
		 
		// Unbind the buffer
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/** Handle mouse click event */
function click(ev, gl, canvas, bacteria_list) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    console.log(x, y);

    var rect = ev.target.getBoundingClientRect();

    // Adjust for the aspect ratio
    var aspectRatio = canvas.width / canvas.height;
    var webglX = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2) * aspectRatio;
    var webglY = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    // Check if the click is inside any bacteria
    for (var i = 0; i < bacteria_list.length; i++) {
		if (bacteria_list[i][4]){
			var currentBacteria = bacteria_list[i];
			var centerX = currentBacteria[0];
			var centerY = currentBacteria[1];
			var radius = currentBacteria[2];

			console.log("Center: " + centerX + ", " + centerY + "Radius:" + radius)

			// Adjust due to vertex shader translation
			var adjustedX = centerX / 200.0; 
			var adjustedY = centerY / 200.0;

			// Check if the click is inside the bacteria
			if (Math.sqrt((webglX - adjustedX) ** 2 + (webglY - adjustedY) ** 2) < radius) {
				// Remove poisoned bacteria
				currentBacteria[4] = false;
				playerScore++;
				if (playerScore == number_of_bacteria) {
					console.log("player win");
					var win = document.getElementById('winCondition');
					win.innerHTML = "Player wins!";
				}
				console.log("Inside");
				break; 
			} 
		}
    }

}
