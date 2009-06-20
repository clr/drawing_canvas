// This class waits for mouse events, and updates its canvas array 
// based on the event.
Drawing = function( canvas ){
  this.canvas = canvas;
//   Could store this as psuedo-objects, but for simplicity-sake,
//   I'm just going to save it as JSON in the following structure:
//     { lines: [
//        { 
//          style: {}
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
    that = window.getDrawingCanvas();
    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line.
    that.currentLine = that.createLine();
    // Append the line to this object.
    that.data.lines.push( that.currentLine );
    // Append the origin point to the current line.
    that.currentLine.points.push( [ mouseEvent.clientX, mouseEvent.clientY - 30 ] );
    // Draw the line into the canvas.
  }, false );
  
  this.canvas.addEventListener( 'mousemove', function( mouseEvent ) {
    that = window.getDrawingCanvas();
    if( that.pencilOnCanvas ) {
      var chart = that.canvas.getContext( '2d' );
      lastPoint = that.currentLine.points[ that.currentLine.points.length - 1 ];
chart.lineWidth = 2;
  chart.strokeStyle = "#FF0000";
  chart.beginPath();
//alert( that.currentLine.points );
  chart.moveTo( lastPoint[0], lastPoint[1] );
      chart.lineTo( mouseEvent.clientX, mouseEvent.clientY - 30 );
  chart.stroke();
    that.currentLine.points.push( [ mouseEvent.clientX, mouseEvent.clientY - 30 ] );
    }
  }, false );
   
  this.canvas.addEventListener( 'mouseup', function( mouseEvent ) {
    // Put the pencil on the canvas.
    that.pencilUp();
  }, false );
   

};

Drawing.method( 'getCanvas', function(){
  return this.canvas;
});

Drawing.method( 'pencilDown', function(){
  this.pencilOnCanvas = true;
});

Drawing.method( 'pencilUp', function(){
  this.pencilOnCanvas = false;
});

Drawing.method( 'createLine', function(){
  var newLine = { 
    style: {},
    points: []
  };
  return newLine;
});

