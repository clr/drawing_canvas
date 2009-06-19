libraries = function(){
  return [
    'pepper',
  ];
};

loadJavascriptLibrary = function( root ){
  for( i = 0; i < libraries().length; i++ ){
    var library = document.createElement( 'script' );
    library.setAttribute( "type", "text/javascript" );
    library.setAttribute( "src", root + '/lib/' + libraries()[i] + '.js' );
    document.getElementsByTagName( 'head' )[0].appendChild( library );
  }
}

var root = document.location.toString().split( "\/test", 1 )[0];
loadJavascriptLibrary( root );

$( function(){

  // Create the unit test selector.
  $( '#banner' ).append( $( "<span style='color:white;'>unit tests: </span><select id='unit_test_select'></select>" ) );
  $( [ '' ].concat( libraries() ) ).each( function( i, test ){ 
    var option = $( '<option>'+test+'</option>' );
    $( '#unit_test_select' ).append( option );
    $( option ).data( 'url', document.location.toString().split( "drawing_canvas\/test", 1 )[0] + 'drawing_canvas/test/' + test + '.qunit' );
  });
  $( '#unit_test_select' ).change( function(){
    var url = $( $( '#unit_test_select option:selected' )[0] ).data( 'url' );
    if( url.length > 0 ){
      document.location = url;
    }
  });

})
