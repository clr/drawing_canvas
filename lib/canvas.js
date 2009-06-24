// We set our canvas configuration here.
Canvas = function(){
  this.canvas = document.getElementById( 'drawing_canvas' );
  this.colorPicker = document.getElementById( 'color_picker' );
  this.width = 600;
  this.height = 360;
}

// We initialize the canvas with this command.
Canvas.method( 'cleanSlate', function(){
  this.canvas.setAttribute( 'width', this.width );
  this.canvas.setAttribute( 'height', this.height );
  this.canvas.setAttribute( 'style', 'width:'+this.width+'px;height:'+this.height+'px' );

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
  Window.prototype.setPlayer = function( player ){
    this.player = player;
  };
  Window.prototype.getPlayer = function(){
    return this.player;
  };

  window.setDrawingCanvas( new Drawing( this.canvas ) );
  window.setStyle( new Style() );
});

