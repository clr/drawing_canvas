/*
 * drawing_canvas 0.4.71 - Drawing Canvas
 *
 * Copyright (c) 2009 Casey Rosenthal (github.net/clr)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2009-06-21 Sun Jun 21 23:08:49 -0400 2009 $
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
  return { color: this.getColor(), opacity: this.getOpacity(), size: this.getSize() };
});


// We set our canvas configuration here.
Canvas = function(){
  this.canvas = document.getElementById( 'drawing_canvas' );
  this.colorPicker = document.getElementById( 'color_picker' );
  this.width = 640;
  this.height = 480;
}

// We initialize the canvas with this command.
Canvas.method( 'initialize', function(){
  this.canvas.setAttribute( 'width', this.width );
  this.canvas.setAttribute( 'height', this.height );

  // Get context
  context = this.canvas.getContext( '2d' );

  // Create the frame
  context.fillStyle = "white";
  context.fillRect( 0, 0, this.width, this.height );
  context.strokeStyle = "2px";
  context.strokeRect( 1, 1, ( this.width - 2 ), ( this.height - 2 ) );

  // Extend the Window object, which is a Singleton, so we can always get the
  // drawing object, and the style object.
  Window.prototype.setDrawingCanvas = function( drawing ){
    this.drawing = drawing;
  };
  Window.prototype.getDrawingCanvas = function(){
    return this.drawing;
  };
  Window.prototype.setStyle = function( style ){
    this.style = style;
  };
  Window.prototype.getStyle = function(){
    return this.style;
  };

  window.setDrawingCanvas( new Drawing( this.canvas ) );
  window.setStyle( new Style() );
});

