var gmaps = (function() {
  var _map;
  var _canvas = '#map-canvas'
  var _interactions = '#map-interactions'

  var map = function() { return _map; }
  var get_canvas_height = function() {
    return $(window).height() - $('.navbar').outerHeight() - 20;
  }
  var reposition = function() {
    var target_width = $(_canvas).width();
    $(_canvas).width(target_width);
    $(_canvas).height(get_canvas_height);
    google.maps.event.trigger(_map, 'resize');
  }

  var initialize = function() {
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
            height: get_canvas_height,
            zoom: 10
          })

          reposition();
        }
      }
    })
  }

  var destroy = function() {
    $(_canvas).empty();
    $(_interactions).empty();
  }  

  return {
    initialize: initialize,
    destroy: destroy,
    map: map,
    reposition: reposition,
    get_canvas_height: get_canvas_height
  }
})()

var init_map = function() {
  gmaps.initialize();
}