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

