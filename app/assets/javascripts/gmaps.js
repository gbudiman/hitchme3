var gmaps = (function() {
  var _map;
  var _markers;
  var _canvas = '#map-canvas'
  var _interactions = '#map-interactions'
  var _polylines;
  var _steps;
  var _cached;

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
    _steps = new Object();
    _cached = new Object();

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
    console.log('gmaps.js: All markers cleared!');
    $.each(_markers, function(i, x) {
      x.setMap(null);
    })

    _markers = new Object();
  }

  var clear_all_routes = function() {
    console.log('gmaps.js: All routes cleared!');
    $.each(_polylines, function(i, x) {
      x.setMap(null);
    })
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
    console.log(_steps);
    if (_steps[name] != undefined) {
      var latlngs = new Array();
      var durations = new Array();
      $.each(_steps[name], function(i, x) {
        latlngs.push([x.location.lat(), x.location.lng()])
        durations.push(x.duration);
      })
      // $.each(_steps[name].latLngs.b, function(i, x) {
      //   $.each(x.b, function(j, y) {
      //     latlngs.push([y.lat(), y.lng()]);
      //   })
        
      // });

      return {
        polysteps: polyline.encode(latlngs),
        durations: durations
      }
    }
  }

  var initialize_external_interations = function() {
    event_setup_ride.transition('init');
    event_find_ride.attach();
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

  var route_with_alternate = function(trip_id, direction, addresses) {
    return new Promise(
      function(resolve, reject) {
        var p;
        /*
          addresses = {
            event:,
            local:,
            pickup:,
            waypoints:
          }
        */

        var default_route;
        var pickup_route;

        var check_delta = function() {
          if (default_route != undefined && pickup_route != undefined) {
            var x_dist = pickup_route.total_distance - default_route.total_distance;
            var x_time = pickup_route.total_duration - default_route.total_duration;

            set_bounds();
            resolve({
              extra_distance: x_dist,
              extra_duration: x_time
            })
          } 
        }

        switch(direction) {
          case 'to_event':
            p = {
              start_marker_name: 'ride-offered-start',
              start_marker_color: 'red',
              end_marker_name: 'event-created',
              end_marker_color: 'blue',
              pickup_marker_name: 'ride-request-to-event',
              pickup_marker_color: 'yellow',
              route_default_name: 'route-to-event',
              route_default_color: 'red',
              route_additional_name: 'route-additional-to-event',
              route_additional_color: 'yellow',
              start: addresses.local,
              end: addresses.event
            }

            break;
          case 'to_home':
            p = {
              start_marker_name: 'event-created',
              start_marker_color: 'blue',
              end_marker_name: 'ride-offered-end',
              end_marker_color: 'green',
              pickup_marker_name: 'ride-request-to-home',
              pickup_marker_color: 'orange',
              route_default_name: 'route-to-home',
              route_default_color: 'green',
              route_additional_name: 'route-additional-to-home',
              route_additional_color: 'orange',
              start: addresses.event,
              end: addresses.local
            }

            break;
        }

        console.log('route_with_alternate to ' + direction);
        clear_all_markers();
        clear_all_routes();
        place_marker(p.start, p.start_marker_name, p.start_marker_color);
        place_marker(p.end, p.end_marker_name, p.end_marker_color);
        place_marker(addresses.pickup, p.pickup_marker_name, p.pickup_marker_color);

        route(p.start, p.end, p.route_default_name, p.route_default_color,
              undefined,
              function() {
                default_route = cached(trip_id);
                check_delta();
              },
              { cache_id: trip_id });
        route(p.start, p.end, p.route_additional_name, p.route_additional_color,
              undefined,
              function() {
                pickup_route = cached(trip_id + '-x');
                check_delta()
              },
              { cache_id: trip_id + '-x',
                waypoints: addresses.waypoints });
      }
    )


    
  }


  var route = function(a, b, name, color, start, done, _options) {
    clear_route(name);
    var options = _options == undefined ? new Object() : _options;
    var paths = new Array();
    var steps = new Array();
    var direction_service = new google.maps.DirectionsService;
    var waypoints = new Array();

    var total_distance = 0;
    var total_duration = 0;

    if (start != undefined) { start(); }

    if (options.waypoints != undefined) {
      $.each(options.waypoints, function(i, x) {
        waypoints.push({location: x});
      })
    } 

    if (name.match(/route-additional/)) {

    } else {
      clear_route('route-additional-to-event');
      clear_route('route-additional-to-home');
      clear_marker('ride-request-to-event');
      clear_marker('ride-reqeust-to-home');
    }

    direction_service.route({
      origin: a,
      destination: b,
      optimizeWaypoints: true,
      waypoints: waypoints,
      travelMode: 'DRIVING'
    }, function(response, status) {
      if (status === 'OK') {
        console.log(response);
        console.log('Saving to steps: ' + name);
        $.each(response.routes[0].legs, function(i, leg) {
          total_distance += leg.distance.value;
          total_duration += leg.duration.value;

          $.each(leg.steps, function(j, step) {
            if (steps.length == 0) { 
              steps.push({
                location: step.start_location,
                duration: 0
              })
            }

            steps.push({
              location: step.end_location,
              duration: step.duration.value
            })

            paths = paths.concat(step.path);
          })
        })

        _polylines[name] = new google.maps.Polyline({
          path: paths,
          strokeColor: color,
          strokeOpacity: 0.5,
          strokeWeight: 6
        })
        _polylines[name].setMap(_map.map);
        _steps[name] = steps;

        if (options.cache_id) {
          var cache = {
            total_duration: total_duration,
            total_distance: total_distance
          }

          _cached[options.cache_id] = cache;
          console.log('Cached at ' + options.cache_id);
          console.log(_cached[options.cache_id]);
        }

        if (done != undefined) {
          done();
        }
      }
    })
    // return new Promise(
    //   function(resolve, reject) {
    //     geocode(a).then(function(ll_a) {
    //       geocode(b).then(function(ll_b) {
    //         _map.travelRoute({
    //           origin: [ll_a.lat(), ll_a.lng()],
    //           destination: [ll_b.lat(), ll_b.lng()],
    //           travelMode: 'driving',
    //           step: function(e) {
    //             paths = paths.concat(e.path);
    //           },
    //           end: function() {
    //             _polylines[name] = new google.maps.Polyline({
    //               path: paths,
    //               strokeColor: color,
    //               strokeOpacity: 0.5,
    //               strokeWeight: 6
    //             })
    //             _polylines[name].setMap(_map.map);

    //             console.log(_polylines[name]);
    //             if (done != undefined) {
    //               done();
    //             }
    //           }
    //         })
    //       })
    //     })
    //   }
    // )
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

    return new Promise(
      function (resolve, reject) {
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
              console.log('gmaps.js: Marker placed: ' + id);
              if (done != undefined) { done(); }
              resolve(latlng);
            }
          }
        })
      }
    )
  }

  var destroy = function() {
    $(_canvas).empty();
    $(_interactions).empty();
  }  

  var cached = function(x) {
    console.log('querying cache: ' + x);
    console.log(_cached[x])
    return _cached[x];
  }

  return {
    initialize: initialize,
    clear_route: clear_route,
    
    cached: cached,
    clear_all_markers: clear_all_markers,
    clear_all_routes: clear_all_routes,
    clear_marker: clear_marker,
    destroy: destroy,
    encode_route: encode_route,
    map: map,
    reposition: reposition,
    get_canvas_height: get_canvas_height,
    place_marker: place_marker,
    route: route,
    route_with_alternate: route_with_alternate,
    set_bounds: set_bounds,
  }
})()

var init_map = function() {
  gmaps.initialize();
}