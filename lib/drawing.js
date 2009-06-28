// This class waits for mouse events, and updates its canvas array 
// based on the event.
Drawing = function( canvas ){
  this.canvas = canvas;
  //   Could store this as psuedo-objects, but for simplicity-sake,
  //   I'm just going to save it as JSON in the following structure.
  //   See doc/discussion.txt for more info.
  //     { l: [ // lines
  //        { 
  //          s: { // style
  //            c: "#000000", // color
  //            o: 1.0, // opacity
  //            d: 2 // diameter
  //          },
  //          p: [ // points
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
    l: []
  };
  this.pencilOnCanvas = false;
  this.currentLine = null;
  
  var that = this;
  this.getCanvas().parentNode.addEventListener( 'mousedown', function( mouseEvent ) {
    var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line in the JSON data structure.
    that.createLine();
    // Append the line to this object.
    that.data.l.push( that.getCurrentLine() );
    // Append the origin point to the current line.
    that.currentLine.p.push( [ coordinates[0], coordinates[1] ] );

    // Draw the line into <canvas> context.
    window.getCanvas().createLine( [ coordinates[0], coordinates[1] ], {
      diameter: that.getCurrentLine().s.d,
      color: that.getCurrentLine().s.c,
      opacity: that.getCurrentLine().s.o
    } );
  }, false );
  
  this.getCanvas().parentNode.addEventListener( 'mousemove', function( mouseEvent ) {
    if( that.isPencilOnCanvas() ) {
      var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

      // Append the point data to the current line.
      that.getCurrentLine().p.push( [ coordinates[0], coordinates[1] ] );

      // Draw the segment into <canvas> context.
      window.getCanvas().createSegment( [ coordinates[0], coordinates[1] ] );
    }
  }, false );
   
  this.getCanvas().parentNode.addEventListener( 'mouseup', function( mouseEvent ) {
    // Pull the pencil off the canvas.
    that.pencilUp();
  }, false );
   

};

Drawing.method( 'getCanvas', function(){
  return this.canvas;
});

Drawing.method( 'getContext', function(){
  return this.getCanvas().getContext( '2d' );
});

Drawing.method( 'getCurrentLine', function(){
  return this.currentLine;
});

Drawing.method( 'getOffset', function(){
  if( this.getCanvas().parentNode.boxObject ){
    // XUL
    return [ this.getCanvas().parentNode.boxObject.x, this.getCanvas().parentNode.boxObject.y ];
  } else {
    // HTML
    return [ this.getCanvas().parentNode.offsetLeft, this.getCanvas().parentNode.offsetTop ];
  }
});

Drawing.method( 'setStyle', function(){
  color = window.getColorPicker().value;
  return this.getCanvas().getContext( '2d' );
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
  this.currentLine = { 
    s: style.getStyle(),
    p: []
  };
  return this;
});

// Get rid of the current line from the data and from the canvas
// scratch layer.
Drawing.method( 'undoLine', function(){
  if( this.getCurrentLine() == this.data.l.last() ){
    this.data.l.pop();
    window.getCanvas().clearScratchCanvas();
  }
});

Drawing.method( 'normalizeCoordinates', function( xValue, yValue ){
  var offset = this.getOffset();
  return [ ( xValue - offset[0] ), ( yValue - offset[1] ) ];
});
