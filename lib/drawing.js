// This class waits for mouse events, and updates its canvas array 
// based on the event.
Drawing = function( canvas ){
  this.canvas = canvas;
  //   Could store this as psuedo-objects, but for simplicity-sake,
  //   I'm just going to save it as JSON in the following structure.
  //   See doc/discussion.txt for more info.
  //     { lines: [
  //        { 
  //          style: {
  //            color: "#000000",
  //            opacity: 1.0,
  //            size: 2
  //          },
  //          points: [
  //            [ x0, y0 ],
  //            [ x1, y1 ],
  //            ...
  //            [ xN, yN ]
  //          ]
  //        },
  //        {
  //          ...
  //        }
  //      ]
  //    } 
  this.data = {
    lines: []
  };
  this.pencilOnCanvas = false;
  this.currentLine = null;
  
  this.canvas.addEventListener( 'mousedown', function( mouseEvent ) {
    var that = window.getDrawingCanvas();
    var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line.
    that.currentLine = that.createLine();
    // Append the line to this object.
    that.data.lines.push( that.currentLine );
    // Append the origin point to the current line.
    that.currentLine.points.push( [ coordinates.x, coordinates.y ] );
    // Begin drawing the line into the canvas.

    var context = that.getContext();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = that.currentLine.style.size;
    context.strokeStyle = that.currentLine.style.color;
    context.globalAlpha = that.currentLine.style.opacity;
    context.beginPath();
    // Draw the first brush stroke.
    context.lineTo( coordinates.x, coordinates.y );
    context.stroke();
  }, false );
  
  this.canvas.addEventListener( 'mousemove', function( mouseEvent ) {
    var that = window.getDrawingCanvas();
    var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

    if( that.pencilOnCanvas ) {
      context.lineTo( coordinates.x, coordinates.y );
      context.stroke();
      that.currentLine.points.push( [ coordinates.x, coordinates.y ] );
    }
  }, false );
   
  this.canvas.addEventListener( 'mouseup', function( mouseEvent ) {
    var that = window.getDrawingCanvas();
    // Pull the pencil off the canvas.
    that.pencilUp();
  }, false );
   

};

Drawing.method( 'getCanvas', function(){
  return this.canvas;
});

Drawing.method( 'getContext', function(){
  return this.canvas.getContext( '2d' );
});

Drawing.method( 'getCurrentLine', function(){
  return this.currentLine;
});

Drawing.method( 'getOffset', function(){
  return { x: this.canvas.offsetLeft, y: this.canvas.offsetTop };
});

Drawing.method( 'setStyle', function(){
  color = window.getColorPicker().value;
  return this.canvas.getContext( '2d' );
});

Drawing.method( 'pencilDown', function(){
  this.pencilOnCanvas = true;
});

Drawing.method( 'pencilUp', function(){
  this.pencilOnCanvas = false;
});

Drawing.method( 'isPencilOnCanvas', function(){
  return this.pencilOnCanvas;
});

Drawing.method( 'createLine', function(){
  style = new Style();
  var newLine = { 
    style: style.getStyle(),
    points: []
  };
  return newLine;
});

Drawing.method( 'normalizeCoordinates', function( xValue, yValue ){
  return { x: ( xValue - this.getOffset().x ), y: ( yValue - this.getOffset().y ) }
});
