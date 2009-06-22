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

