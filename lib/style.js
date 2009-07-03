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


