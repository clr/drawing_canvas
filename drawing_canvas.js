/*
 * drawing_canvas 0.4.71 - Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2009-07-03 Fri Jul 03 18:46:04 -0400 2009 $
 * $Rev: 1 more than last time $
 */
 
// This file contains various helper methods.


// Sugar functions follow, some of which were inspired by
// [ http://www.crockford.com/javascript/inheritance.html ]
Function.prototype.method = function( name, lambda ){
  this.prototype[name] = lambda;
  return this;
};

// To be used as in ChildClass.inherits( ParentClass )
Function.method( 'inherits', function( parent ) {
  var d = {};
  var p = ( this.prototype = new parent() );

  this.method( '_super', function _super( name ){
    if( !( name in d ) ){
      d[name] = 0;
    }        
    var f, r, t = d[name];
    var v = parent.prototype;
    if( t ){
      while( t ){
        v = v.constructor.prototype;
        t -= 1;
      }
      f = v[name];
    } else {
      f = p[name];
      if( f == this[name] ){
        f = v[name];
      }
    }
    d[name] += 1;
    r = f.apply( this, Array.prototype.slice.apply( arguments, [1] ) );
    d[name] -= 1;
    return r;
  });
  return this;
});

Function.method( 'swiss', function( parent ){
  for( var i = 1; i < arguments.length; i++ ){
    var name = arguments[i];
    this.prototype[name] = parent.prototype[name];
  }
  return this;
});

Function.prototype.bind = function( object ){
  var method = this;
  var temp = function() {
    return method.apply( object, arguments );
   };
  return temp;
} 

// Camel case is useful for generating dynamic functions.
String.method( 'toCamelCase', function(){
  if( this.length < 1 ){
    return this;
  }
  var newString = '';
  var parts = this.split( /[^a-zA-Z0-9]/ );
  for( var i = 0; i < parts.length; i++ ){
    var part = parts[i];
    if( part.length > 0 ){
      newString += ( part[0].toUpperCase() + part.slice( 1 ) );
    }
  }
  return newString;
});

// This is just to test to make sure that my Psuedo-class structure is sound.
DummyPepperClass = function(){
  this.dummyAttr = null;
};
DummyPepperClass.method( 'getDummyAttr', function(){
  return this.dummyAttr;
});
DummyPepperClass.method( 'setDummyAttr', function( newValue ){
  this.dummyAttr = newValue;
  return this;
});

// Surprised that javascript doesn't have a function like .includes?()
Array.method( 'hasElement', function ( element ){
  for( var i = 0; i < this.length; i++ ){
    if( element == this[i] ){
      return true;
    }
  }
  return false;
});
// Same thing for a NodeList.
NodeList.prototype.hasElement = function ( element ){
  for( var i = 0; i < this.length; i++ ){
    if( element == this.item( i ) ){
      return true;
    }
  }
  return false;
};

// First element.
Array.method( 'first', function (){
  return this[0];
});

// Last element.
Array.method( 'last', function (){
  return this[ this.length - 1 ];
});

// Return the firts value that isn't null.
notNull = function(){
  for( var i = 0; i < arguments.length; i++ ){
    var value = arguments[i];
    if( value != null ){
      return value;
    }
  }
};

// We need to trigger events for testing purposes.  This library is 
// inspired by, and borrows some code from:
// http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/27e7c70e51ff8a99/98cea9cdf065a524%2398cea9cdf065a524
Event = function( species ){
  this.species = species;
};

Event.method( 'trigger', function( domElement ){
  if( !domElement ) {
    alert( 'Cannot trigger an event into the ether; must be attached to a DOM element.' );
  }
  if( document.createEvent ) {
    event = document.createEvent( 'MouseEvents' );
  }
  event.initMouseEvent(
    this.species,
    true,     // Click events bubble
    true,     // and they can be cancelled
    document.defaultView,  // Use the default view
    1,        // Just a single click
    0,        // Don't bother with co-ordinates
    0,
    0,
    0,
    false,    // Don't apply any key modifiers
    false,
    false,
    false,
    0,        // 0 - left, 1 - middle, 2 - right
    null
  );
  domElement.dispatchEvent( event );
});

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
// This class inspects the styleControls DOM element and reports
// the settings back as a JSON object.
Style = function( colorPicker, opacityPicker, sizePicker ){
  this.colorPicker = colorPicker;
  this.opacityPicker = opacityPicker;
  this.sizePicker = sizePicker;
};

Style.method( 'getColor', function(){
  //  Had to modify the vendor library to add the 
  // ColorPickerGetGolor() function.
  return '#' + $( this.colorPicker ).ColorPickerGetColor();
});

Style.method( 'getOpacity', function(){
  return ( ( 0.0 + $( this.opacityPicker ).slider( 'value' ) ) / 100 );
});

// This is in pixels.
Style.method( 'getSize', function(){
  return parseInt( $( this.sizePicker ).slider( 'value' ) );
});

Style.method( 'getStyle', function(){
  return { c: this.getColor(), o: this.getOpacity(), d: this.getSize() };
});


// This class wraps Sassijs and simply loads a file into the template variable.  We
// assume the presence of a loading DOM element 'document'.
Player = function( url, async ){
  this.loaded = false;
  this.data = null;
  this.fetch( url, async );
  this.context = window.getDrawing().getContext();
  this.i = 0; // Line counter.
  this.j = 0; // Point counter.
  this.timeout = null; // Timer firing the draw events.
  this.speed_picker = document.getElementById( 'speed_picker' );
}

Player.method( 'isLoaded', function(){
  return this.loaded;
});

Player.method( 'getData', function(){
  return this.data;
});

// This function and the following call each other, giving us room
// to set a timeout to imitate the playback effect.
Player.method( 'play', function(){
  this.timeout = window.setTimeout( 'window.getPlayer().frameForward()', this.getSpeed() );
});

// This function draws the next line segment, or bails if the data
// is done.
Player.method( 'frameForward', function(){
  this.context.lineCap = 'round';
  this.context.lineJoin = 'round';

  if( this.j >= this.data[ this.i ].p.length ){
    // Move to the next line if we're out of points.
    this.i++;
    this.j = 0;
  }
  if( this.i >= this.data.length ){ 
    // We are at the end of the JSON data, so return here so
    // that the timeout stops running.
    return;
  }
  if( this.j == 0 ) { 
    // We are at the beginning of a line, so set the style and 
    // start a new line, drawing the first point.
    var line = this.data[ this.i ];
    var point = this.data[ this.i ].p[ this.j ];

    // Draw the line into <canvas> context.
    window.getCanvas().createLine( point, {
      diameter: line.s.d,
      color: line.s.c,
      opacity: line.s.o
    } );
  } else {
    // We are in the middle of a line, so just draw this segment.
    var point = this.data[ this.i ].p[ this.j ];

    // Draw the segment into <canvas> context.
    window.getCanvas().createSegment( point );
  }
  // Continue.
  this.j++;
  this.play();
});

// Start the iterators over again.
Player.method( 'replay', function(){
  this.i = 0;
  this.j = 0;
  this.play();
});

// Clear the timeout to stop the playback effect.
Player.method( 'stop', function(){
  window.clearTimeout( this.timeout );
});

Player.method( 'getSpeed', function(){
  return this.speed_picker.value;
});

// Lame AJAXy method to pull in the JSON.  This is skeletal for now, until 
// switching to a more powerful library like jQuery to handle AJAX.
Player.method( 'fetch', function( url, async ){
  // Asynchronous transfer is the default.
  if( async != false ){
    async = true;
  }
  if( window.XMLHttpRequest ){
    req = new XMLHttpRequest();
  } else if( window.ActiveXObject ){
    req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  // This is an asynch call that won't freeze up the browser.
  if( ( async ) && ( req != undefined ) ){
    var that = this;
    req.onreadystatechange = function(){ 
      if( req.readyState == 4 ) { // only if req is "loaded"
        if( ( req.status == 200 ) || ( req.status == 0 ) ) { // only if "OK" (0 is status for locally served files)
          this.loaded = true;
          this.data = eval( req.responseText );
        } else {
          this.loaded = false;
        }
      }
    };
    req.open( "GET", url );
    req.send( "" );
  // This is a synchronous call that holds up the browser, which is 
  // necessary for qUnit to work properly, for example.
  } else {
    var that = this;
    req.open( "GET", url, false );
    req.send( "" );
    if( req.readyState == 4 ) { // only if req is "loaded"
      if( ( req.status == 200 ) || ( req.status == 0 ) ) { // only if "OK" (0 is status for locally served files)
        this.loaded = true;
        this.data = eval( req.responseText );
      } else {
        this.loaded = false;
      }
    }
  }
});

// We set our canvas configuration here.
Canvas = function( canvasElement ){
  this.canvasElement = canvasElement;
  this.width = parseInt( $( this.canvasElement ).css( 'width' ) );
  this.height = parseInt( $( this.canvasElement ).css( 'height' ) );
  this.scratchCanvas = null;
  this.colorPicker = document.getElementById( 'color_picker' );
  this.cleanSlate();
  return this;
}

// Create a new line in the <canvas> context.
Canvas.method( 'createLine', function( coordinates, options ){

  // Set some default values.
  options.diameter = notNull( options.diameter, 2 );
  options.color    = notNull( options.color,    '#000000' );
  options.opacity  = notNull( options.opacity,  1.0 );

  // Get the context object and start drawing.
  this.collapseScratchCanvas();
  this.generateScratchCanvas( options.opacity );
  var context = this.getScratchCanvas().getContext( '2d' );
  context.lineCap     = 'round';
  context.lineJoin    = 'round';
  context.lineWidth   = options.diameter;
  context.strokeStyle = options.color;
  context.globalAlpha = 1.0;
  context.stroke();
  context.beginPath();

  // Draw the first brush stroke.
  context.lineTo( coordinates[0], coordinates[1] );
  context.stroke();
});

// Create a new segment in the <canvas> context.
Canvas.method( 'createSegment', function( coordinates ){
  // Get the context object and continue drawing.
  var context = this.getScratchCanvas().getContext( '2d' );
  context.lineTo( coordinates[0], coordinates[1] );
  context.stroke();
});

Canvas.method( 'getCanvasElement', function(){
  return this.canvasElement;
});

Canvas.method( 'getOffset', function(){
  if( this.getCanvasElement().parentNode.boxObject ){
    // XUL
    return [ this.getCanvasElement().parentNode.boxObject.x, this.getCanvasElement().parentNode.boxObject.y ];
  } else {
    // HTML
    return [ this.getCanvasElement().parentNode.offsetLeft, this.getCanvasElement().parentNode.offsetTop ];
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'collapseScratchCanvas', function(){
  if( this.getScratchCanvas() != null ){
    var scratchContext = this.getScratchCanvas().getContext( '2d' );
    var imageData = scratchContext.getImageData( 0, 0, this.width, this.height );
    var pixels    = imageData.data;
    var opacity   = this.getScratchCanvas().style.opacity;
    
    // Loop through all the pixels and apply the opacity.
    for( var i = 0, n = pixels.length; i < n; i += 4 ) {
      pixels[ i + 3 ] = parseInt( opacity * pixels[ i + 3 ] );
    }
    scratchContext.putImageData( imageData, 0, 0 );
    
    this.getCanvasElement().getContext( '2d' ).drawImage( this.getScratchCanvas(), 0, 0 );
    this.clearScratchCanvas();
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'clearScratchCanvas', function(){
  if( this.getCanvasElement().parentNode.childNodes.hasElement( this.getScratchCanvas() ) ){
    this.getCanvasElement().parentNode.removeChild( this.scratchCanvas );
  }
  this.setScratchCanvas( null );
});

// Create a new segment in the <canvas> context.
Canvas.method( 'generateScratchCanvas', function( opacity ){
  var newCanvasElement = $( "<canvas></canvas>");
  newCanvasElement.appendTo( this.getCanvasElement().parentNode );

  newCanvasElement.attr( 'width', this.width );
  newCanvasElement.attr( 'height', this.height );
  newCanvasElement.css( 'opacity', opacity );
  newCanvasElement.css( 'z-index', '2' );
  this.scratchCanvas = newCanvasElement[0];
});

Canvas.method( 'setScratchCanvas', function( scratchCanvas ){
  this.scratchCanvas = scratchCanvas;
  return this;
});

Canvas.method( 'getScratchCanvas', function(){
  return this.scratchCanvas;
});

// We initialize the canvas with this command.
Canvas.method( 'cleanSlate', function(){
  this.getCanvasElement().setAttribute( 'width', this.width );
  this.getCanvasElement().setAttribute( 'height', this.height );
  this.getCanvasElement().setAttribute( 'style', 'z-index:1' );

  // Get context
  context = this.getCanvasElement().getContext( '2d' );

  // Create the frame
  context.clearRect( 0, 0, this.width, this.height );
  context.fillStyle = "white";
  context.fillRect( 0, 0, this.width, this.height );

//  // Extend the Window object, which is a Singleton, so we can always get the
//  // drawing object, and the style object.
//  Window.prototype.canvas = this;
//  Window.prototype.getCanvas = function(){
//    return this.canvas;
//  };
//  Window.prototype.setDrawing = function( drawing ){
//    this.drawing = drawing;
//  };
//  Window.prototype.getDrawing = function(){
//    return this.drawing;
//  };
//  Window.prototype.setStyle = function( style ){
//    this.style = style;
//  };
//  Window.prototype.getStyle = function(){
//    return this.style;
//  };
//  Window.prototype.setPlayer = function( player ){
//    this.player = player;
//  };
//  Window.prototype.getPlayer = function(){
//    return this.player;
//  };

//  var interface = new Interface( this.context );
//  interface
//    .generateColorPicker()
//    .generateOpacityPicker()
//    .generateSizePicker();
//  window.setDrawing( interface );
//  window.setStyle( new Style() );
});

