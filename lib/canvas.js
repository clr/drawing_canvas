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

