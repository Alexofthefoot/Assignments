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

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  // Enable the depth test
  gl.enable(gl.DEPTH_TEST);

  // Clear <canvas> and the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var disk_radius = 150; // the radius of disk

   // Start drawing
  var tick = function() {
	  
	  // Clear <canvas> and depth buffer
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	  
	  draw_circle(gl, 0, 0, disk_radius, [1.0, 1.0, 1.0, 1]);	
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick(); 
}

// generate a random floating point value between 0 and max
function getRandom(max) {
	return Math.random() * Math.floor(max);
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
