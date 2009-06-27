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
  
  this.canvas.addEventListener( 'mousedown', function( mouseEvent ) {
    var that = window.getDrawing();
    var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line in the JSON data structure.
    that.createLine();
    // Append the line to this object.
    that.data.l.push( that.getCurrentLine() );
    // Append the origin point to the current line.
    that.currentLine.p.push( [ coordinates.x, coordinates.y ] );

    // Draw the line into <canvas> context.
    window.getCanvas().createLine( [ coordinates.x, coordinates.y ], {
      diameter: that.getCurrentLine().s.d,
      color: that.getCurrentLine().s.c,
      opacity: that.getCurrentLine().s.o
    } );
  }, false );
  
  this.canvas.addEventListener( 'mousemove', function( mouseEvent ) {
    var that = window.getDrawing();
    
    if( that.isPencilOnCanvas() ) {
      var coordinates = that.normalizeCoordinates( mouseEvent.clientX, mouseEvent.clientY );

      // Append the point data to the current line.
      that.getCurrentLine().p.push( [ coordinates.x, coordinates.y ] );

      // Draw the segment into <canvas> context.
      window.getCanvas().createSegment( [ coordinates.x, coordinates.y ] );
    }
  }, false );
   
  this.canvas.addEventListener( 'mouseup', function( mouseEvent ) {
    var that = window.getDrawing();
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
  this.currentLine = { 
    s: style.getStyle(),
    p: []
  };
  return this;
});

Drawing.method( 'normalizeCoordinates', function( xValue, yValue ){
  return { x: ( xValue - this.getOffset().x ), y: ( yValue - this.getOffset().y ) }
});
