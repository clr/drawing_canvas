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


