// This class waits for mouse events, and updates its canvas array 
// based on the event.
Interface = function( context ){
  this.context = context;
  /*
     Could store this as psuedo-objects, but for simplicity-sake,
     I'm just going to save it as JSON in the following structure.
     See doc/discussion.txt for more info.
       { l: [ // lines
          { 
            s: { // style
              c: "#000000", // color
              o: 1.0, // opacity
              d: 2 // diameter
            },
            p: [ // points
              [ x0, y0 ],
              [ x1, y1 ],
              ...
              [ xN, yN ]
            ]
          },
          {
            ...
          }
        ]
      } 
  */
  this.data = {
    l: []
  };
  this.pencilOnCanvas = false;
  this.currentLine = null;
  // Generate all of the DOM elements.
  this
    .generateCanvas()
    .generateColorPicker()
    .generateOpacityPicker()
    .generateSizePicker()
    .generateButtons()
    .generateStyle();
  
  var that = this;

  /*  Mouse Down  */
  $( this.getContext() ).mousedown( function( mouseEvent ){
    var coordinates = that.normalizeCoordinates( mouseEvent, this );
    // Put the pencil on the canvas.
    that.pencilDown();
    // Create a line in the JSON data structure.
    that.createLine();
    // Append the line to this object.
    that.data.l.push( that.getCurrentLine() );
    // Append the origin point to the current line.
    that.currentLine.p.push( [ coordinates[0], coordinates[1] ] );

    // Draw the line into <canvas> context.
    that.getCanvas().createLine( [ coordinates[0], coordinates[1] ], {
      diameter: that.getCurrentLine().s.d,
      color: that.getCurrentLine().s.c,
      opacity: that.getCurrentLine().s.o
    } );
  });
  
  /*  Mouse Move  */
  $( this.getContext() ).mousemove( function( mouseEvent ){
    if( that.isPencilOnCanvas() ) {
      var coordinates = that.normalizeCoordinates( mouseEvent, this );

      // Append the point data to the current line.
      that.getCurrentLine().p.push( [ coordinates[0], coordinates[1] ] );

      // Draw the segment into <canvas> context.
      that.getCanvas().createSegment( [ coordinates[0], coordinates[1] ] );
    }
  });
   
  /*  Mouse Up  */
  $( this.getContext() ).mouseup( function( mouseEvent ){
    // Pull the pencil off the canvas.
    that.pencilUp();
  });
   
};

Interface.method( 'getContext', function(){
  return this.context;
});

Interface.method( 'getCurrentLine', function(){
  return this.currentLine;
});

Interface.method( 'pencilDown', function(){
  this.pencilOnCanvas = true;
});

Interface.method( 'pencilUp', function(){
  this.pencilOnCanvas = false;
});

Interface.method( 'isPencilOnCanvas', function(){
  return this.pencilOnCanvas;
});

Interface.method( 'createLine', function(){
  this.currentLine = { 
    s: this.getStyle().getStyle(),
    p: []
  };
  return this;
});

// Get rid of the current line from the data and from the canvas
// scratch layer.
Interface.method( 'undoLine', function(){
  if( this.getCurrentLine() == this.data.l.last() ){
    this.data.l.pop();
    that.getCanvas().clearScratchCanvas();
  }
});

Interface.method( 'normalizeCoordinates', function( mouseEvent, element ){
  return [ ( mouseEvent.pageX - element.offsetLeft - 12 ), ( mouseEvent.pageY - element.offsetTop - 12 ) ];
});

/*  Canvas Element  */
Interface.method( 'generateCanvas', function(){
  this.canvasHolder = $( "<div><canvas></canvas></div>" );
  this.canvasHolder.addClass( 'canvas_holder' );
  this.canvas = new Canvas( this.canvasHolder.find( '> canvas' )[0] );
  $( this.getContext() ).append( this.canvasHolder );
  return this;
});

Interface.method( 'getCanvas', function(){
  return this.canvas;
});

/*  ColorPicker  */
Interface.method( 'generateColorPicker', function(){
  this.colorPicker = $( "<div></div>" );
  this.colorPicker.addClass( 'color_picker_holder' );
  // Call vendor colorpicker library.
  $( this.colorPicker ).ColorPicker( {flat: true} );
  $( this.getContext() ).append( this.colorPicker );
  return this;
});

Interface.method( 'getColorPicker', function(){
  return this.colorPicker;
});

/*  SizePicker  */
Interface.method( 'generateSizePicker', function(){
  this.sizePicker = $( "<div><div><span>SIZE</span><div></div></div></div>" );
  this.sizePicker.addClass( 'size_picker_holder' );
  this.sizePicker.find( '> div' ).addClass( 'generic_slider' );
  this.size = this.sizePicker.find( '> div > div' )[0];
  $( this.size ).slider( { min: 1, max: 100, value: 4 } );
  $( this.getContext() ).append( this.sizePicker );
  return this;
});

Interface.method( 'getSizePicker', function(){
  return this.sizePicker;
});

/*  OpacityPicker  */
Interface.method( 'generateOpacityPicker', function(){
  this.opacityPicker = $( "<div><div><span>OPACITY</span><div></div></div></div>" );
  this.opacityPicker.addClass( 'opacity_picker_holder' );
  this.opacityPicker.find( '> div' ).addClass( 'generic_slider' );
  this.opacity = this.opacityPicker.find( '> div > div' )[0];
  $( this.opacity ).slider( { min: 0, max: 100, value: 100 } );
  $( this.getContext() ).append( this.opacityPicker );
  return this;
});

Interface.method( 'getOpacityPicker', function(){
  return this.opacityPicker;
});


/*  Buttons  */
Interface.method( 'generateButtons', function(){
  this.undo = $( "<button>Undo</button>" );
  this.undo.addClass( 'generic_button' );
  this.undo.appendTo( this.getContext() );
  return this;
});

/*  Style Object  */
Interface.method( 'generateStyle', function(){
  this.style = new Style( 
    this.getColorPicker(),
    this.opacity,
    this.size
  );
  return this;
});

Interface.method( 'getStyle', function(){
  return this.style;
});


/* Extend jQuery to allow invokation of the Interface class on
 * a jQuery object as it's context.
 */
( function( $ ) {
	$.fn.extend({
		sketchfaux: function(){
		  this.each(function () {
		    new Interface( this );
		  });
		}
	});
})(jQuery)
