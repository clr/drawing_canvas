/*
 * drawing_canvas 0.4.71 - Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2009-06-28 Sun Jun 28 16:44:18 -0400 2009 $
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
// This class inspects the styleControls DOM element and reports
// the settings back as a JSON object.
Style = function(){
  this.color_picker = document.getElementById( 'color_picker' );
  this.opacity_picker = document.getElementById( 'opacity_picker' );
  this.size_picker = document.getElementById( 'size_picker' );
};

Style.method( 'getColor', function(){
  return this.color_picker.color;
});

Style.method( 'getOpacity', function(){
  return ( ( 0.0 + this.opacity_picker.value ) / 100 );
});

// This is in pixels.
Style.method( 'getSize', function(){
  return parseInt( this.size_picker.value );
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
Canvas = function(){
  this.canvas = document.getElementById( 'drawing_canvas' );
  this.scratchCanvas = null;
  this.colorPicker = document.getElementById( 'color_picker' );
  this.width = 600;
  this.height = 360;
}

// Create a new line in the <canvas> context.
Canvas.method( 'createLine', function( coordinates, options ){

  // Set some default values.
  options.diameter = notNull( options.diameter, 2 );
  options.color    = notNull( options.color,    '#000000' );
  options.opacity  = notNull( options.opacity,  1.0 );

  // Get the context object and start drawing.
  this.collapseScratchCanvas();
  this.createScratchCanvas( options.opacity );
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
    
    this.canvas.getContext( '2d' ).drawImage( this.getScratchCanvas(), 0, 0 );
    this.clearScratchCanvas();
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'clearScratchCanvas', function(){
  if( this.canvas.parentNode.childNodes.hasElement( this.getScratchCanvas() ) ){
    this.canvas.parentNode.removeChild( this.scratchCanvas );
  }
  this.setScratchCanvas( null );
});

// Create a new segment in the <canvas> context.
Canvas.method( 'createScratchCanvas', function( opacity ){
  var newCanvasElement = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'html:canvas' );
  this.canvas.parentNode.appendChild( newCanvasElement );

  newCanvasElement.setAttribute( 'width', this.width );
  newCanvasElement.setAttribute( 'height', this.height );
  newCanvasElement.setAttribute( 'style', 'position:absolute;z-index:2;top:0px;left:0px;width:'+this.width+'px;height:'+this.height+'px;opacity:'+opacity );
  this.scratchCanvas = newCanvasElement;
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
  this.canvas.setAttribute( 'width', this.width );
  this.canvas.setAttribute( 'height', this.height );
  this.canvas.setAttribute( 'style', 'position:absolute;z-index:1;top:0px;left:0px;width:'+this.width+'px;height:'+this.height+'px' );

  // Get context
  context = this.canvas.getContext( '2d' );

  // Create the frame
  context.clearRect( 0, 0, this.width, this.height );
  context.fillStyle = "white";
  context.fillRect( 0, 0, this.width, this.height );
  context.strokeStyle = "2px";
  context.strokeRect( 1, 1, ( this.width - 2 ), ( this.height - 2 ) );

  // Extend the Window object, which is a Singleton, so we can always get the
  // drawing object, and the style object.
  Window.prototype.canvas = this;
  Window.prototype.getCanvas = function(){
    return this.canvas;
  };
  Window.prototype.setDrawing = function( drawing ){
    this.drawing = drawing;
  };
  Window.prototype.getDrawing = function(){
    return this.drawing;
  };
  Window.prototype.setStyle = function( style ){
    this.style = style;
  };
  Window.prototype.getStyle = function(){
    return this.style;
  };
  Window.prototype.setPlayer = function( player ){
    this.player = player;
  };
  Window.prototype.getPlayer = function(){
    return this.player;
  };

  window.setDrawing( new Drawing( this.canvas ) );
  window.setStyle( new Style() );
});

