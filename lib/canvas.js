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
  this.clearScratchCanvas();
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
Canvas.method( 'clearScratchCanvas', function( opacity ){
  if( this.scratchCanvas != null ){
    this.canvas.removeChild( this.scratchCanvas );
  }
});

// Create a new segment in the <canvas> context.
Canvas.method( 'createScratchCanvas', function( opacity ){
  var newCanvasElement = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'html:canvas' );
  this.canvas.appendChild( newCanvasElement );

  newCanvasElement.setAttribute( 'width', this.width );
  newCanvasElement.setAttribute( 'height', this.height );
  newCanvasElement.setAttribute( 'style', 'position:absolute;z-index:10;top:0px;left:0px;width:'+this.width+'px;height:'+this.height+'px;opacity:'+opacity );
console.log( newCanvasElement );
  this.scratchCanvas = newCanvasElement;
});

Canvas.method( 'getScratchCanvas', function(){
  return this.scratchCanvas;
});

// We initialize the canvas with this command.
Canvas.method( 'cleanSlate', function(){
  this.canvas.setAttribute( 'width', this.width );
  this.canvas.setAttribute( 'height', this.height );
  this.canvas.setAttribute( 'style', 'width:'+this.width+'px;height:'+this.height+'px' );

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

