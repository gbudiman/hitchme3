var gmaps = (function() {
  var _map;
  var _markers;
  var _canvas = '#map-canvas'
  var _interactions = '#map-interactions'
  var _polylines;

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
    _markers = new Object();
    _polylines = new Object();

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
          initialize_external_interations();
        }
      }
    })
  }

  var clear_all_markers = function() {
    $.each(_markers, function(i, x) {
      x.setMap(null);
    })

    _markers = new Object();
  }

  var clear_marker = function(x) {
    if (_markers[x] != undefined) {
      _markers[x].setMap(null);
    }
  }

  var clear_route = function(name) {
    // $.each(_polylines[name], function(_junk, line) {
    // })
    if (_polylines[name] != undefined) {
      _polylines[name].setMap(null);  
    }
  }

  var encode_route = function(name) {
    if (_polylines[name] != undefined) {
      var latlngs = new Array();
      $.each(_polylines[name].latLngs.b, function(i, x) {
        $.each(x.b, function(j, y) {
          latlngs.push([y.lat(), y.lng()]);
        })
        
      });

      return polyline.encode(latlngs);
    }
  }

  var initialize_external_interations = function() {
    event_setup_ride.transition('init');
    event_creator.transition('init_gmaps');
  }

  var set_bounds = function() {
    var bounds = new google.maps.LatLngBounds();
    $.each(_markers, function(i, x) {
      bounds.extend(x.position);
    })

    console.log(_markers);
    _map.fitBounds(bounds);
  }

  var route = function(a, b, name, color, start, done) {
    clear_route(name);
    var paths = new Array();

    if (start != undefined) { start(); }
    return new Promise(
      function(resolve, reject) {
        geocode(a).then(function(ll_a) {
          geocode(b).then(function(ll_b) {
            _map.travelRoute({
              origin: [ll_a.lat(), ll_a.lng()],
              destination: [ll_b.lat(), ll_b.lng()],
              travelMode: 'driving',
              step: function(e) {
                paths = paths.concat(e.path);
              },
              end: function() {
                _polylines[name] = new google.maps.Polyline({
                  path: paths,
                  strokeColor: color,
                  strokeOpacity: 0.5,
                  strokeWeight: 6
                })
                _polylines[name].setMap(_map.map);

                if (done != undefined) {
                  done();
                }
              }
            })
          })
        })
      }
    )
  }

  var geocode = function(address) {
    return new Promise(
      function(resolve, reject) {
        GMaps.geocode({
          address: address,
          callback: function(results, status) {
            if (status == 'OK') {
              resolve(results[0].geometry.location);
            }
          }
        })
      }
    )
  }

  var place_marker = function(x, id, _hue, done) {
    var hue = _hue == undefined ? 'red' : _hue;

    GMaps.geocode({
      address: x,
      callback: function(results, status) {
        if (status == 'OK') {
          var latlng = results[0].geometry.location;

          _map.setCenter(latlng.lat(), latlng.lng());
          var marker = _map.addMarker({
            position: latlng,
            icon: '//maps.google.com/mapfiles/ms/icons/' + hue + '-dot.png'
          })

          _markers[id] = marker;
          if (done != undefined) { done(); }
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
    clear_route: clear_route,
    
    clear_all_markers: clear_all_markers,
    clear_marker: clear_marker,
    destroy: destroy,
    encode_route: encode_route,
    map: map,
    reposition: reposition,
    get_canvas_height: get_canvas_height,
    place_marker: place_marker,
    route: route,
    set_bounds: set_bounds
  }
})()

var init_map = function() {
  gmaps.initialize();
}