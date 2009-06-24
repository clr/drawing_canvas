// This class wraps Sassijs and simply loads a file into the template variable.  We
// assume the presence of a loading DOM element 'document'.
Player = function( url, async ){
  this.loaded = false;
  this.data = null;
  this.fetch( url, async );
  this.context = window.getDrawingCanvas().getContext();
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
    this.context.lineWidth = line.s.d;
    this.context.strokeStyle = line.s.c;
    this.context.globalAlpha = line.s.o;
    this.context.beginPath();
  }
  // Draw this segment.
  var point = this.data[ this.i ].p[ this.j ];
  this.context.lineTo( point[0], point[1] );
  this.context.stroke();
  this.j++;
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

