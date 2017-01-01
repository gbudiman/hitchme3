var gmaps = (function() {
  var _map;
  var _canvas = '#map-canvas'

  var map = function() { return _map; }
  var reposition = function() {
    var target_width = $(_canvas).width();
    $(_canvas).width(target_width);
    google.maps.event.trigger(_map, 'resize');
  }

  var initialize = function() {
    console.log('gmaps init');
    GMaps.geocode({
      address: 'Los Angeles, CA',
      callback: function(results, status) {
        if (status == 'OK') {
          var latlng = results[0].geometry.location;

          _map = new GMaps({
            el: _canvas,
            lat: latlng.lat(), 
            lng: latlng.lng(),
            width: $(_canvas).width(),
            height: '600px',
            zoom: 10
          })

          reposition();
        }
      }
    })
  }

  

  return {
    initialize: initialize,
    map: map,
    reposition: reposition
  }
})()

var init_map = function() {
  console.log('called');
  gmaps.initialize();
}