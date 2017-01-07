var gmaps = (function() {
  var _map;
  var _markers;
  var _canvas = '#map-canvas'
  var _interactions = '#map-interactions'
  var _polylines;
  var _steps;
  var _cached_routes;
  var _cached_markers;

  var _waypoint_cache_key;

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
    _cached_routes = new Object();
    _cached_markers = new Object();

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
      console.log('Marker cleared: ' + x);
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

  var check_cache = function(id, property) {
    switch(property) {
      case 'steps':
        console.log('Fetching from steps cache: ' + id);
        return _cached_routes[id].steps;
      case 'polylines':
        console.log('Fetching from polylines cache: ' + id);
        return _cached_routes[id].polylines;
      case 'metadata':
        console.log('Fetching from metadata cache: ' + id);
        return _cached_routes[id].metadata;
      case 'marker':
        return _cached_markers[id];
        break;
    }
  }

  var encode_route = function(name) {
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
    } else {
      console.log('gmaps.encode_route(\"' + name + '\") -> null result');
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

    _map.fitBounds(bounds);
  }

  var invalidate_cached_alternate_routes = function() {
    $.each(_cached_routes, function(name, _junk) {
      if (name.match(/\-x$/)) {
        delete _cached_routes[name];
      }
    })
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

        console.log('Checking cache key: ' + _waypoint_cache_key + ' | ' + addresses.pickup);
        if (_waypoint_cache_key == undefined) {
          _waypoint_cache_key = addresses.pickup;
        } else if (_waypoint_cache_key != addresses.pickup) {
          console.log('All alternate route cache invalidated!');
          _waypoint_cache_key = addresses.pickup;
          invalidate_cached_alternate_routes();
        }

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

        clear_all_markers();
        clear_all_routes();
        place_marker(p.start, p.start_marker_name, p.start_marker_color);
        place_marker(p.end, p.end_marker_name, p.end_marker_color);
        place_marker(addresses.pickup, p.pickup_marker_name, p.pickup_marker_color);

        route(p.start, p.end, p.route_default_name, p.route_default_color,
              undefined,
              function() {
                default_route = check_cache(trip_id, 'metadata');
                check_delta();
              },
              { cache_id: trip_id });
        route(p.start, p.end, p.route_additional_name, p.route_additional_color,
              undefined,
              function() {
                pickup_route = check_cache(trip_id + '-x', 'metadata');
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

    // if (name.match(/route-additional/)) {

    // } else {
    //   clear_route('route-additional-to-event');
    //   clear_route('route-additional-to-home');
    //   clear_marker('ride-request-to-event');
    //   clear_marker('ride-reqeust-to-home');
    // }

    if (options.cache_id != undefined && _cached_routes[options.cache_id] != undefined) {
      console.log('Cache hit on route: ' + options.cache_id);
      _polylines[name] = check_cache(options.cache_id, 'polylines');
      _steps[name] = check_cache(options.cache_id, 'steps');

      _polylines[name].setMap(_map.map);

      if (done != undefined) { done(); }

      return;
    }


    console.log('No route cached for: ' + options.cache_id + ' - Querying gmaps...');
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
          var metadata = {
            total_duration: total_duration,
            total_distance: total_distance
          }

          _cached_routes[options.cache_id] = {
            metadata: metadata,
            polylines: _polylines[name],
            steps: _steps[name]
          }
          console.log('Route saved to cache: ' + options.cache_id);

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
    var op = function(latlng) {
      _map.setCenter(latlng.lat(), latlng.lng());
      console.log('Marker placed at: ' + latlng.lat() + ',' + latlng.lng() + ' for ' + x + ' [' + id + ']');
      return _map.addMarker({
        position: latlng,
        icon: '//maps.google.com/mapfiles/ms/icons/' + hue + '-dot.png'
      })
    }

    return new Promise(
      function (resolve, reject) {
        if (_cached_markers[x] != undefined) {
          var latlng = _cached_markers[x];
          console.log('gmaps.js: Marker retrieved from cache: ' + x + ' [' + id + ']');
          var marker = op(latlng);
          _markers[id] = marker;
          if (done != undefined) { done(); }
          resolve(latlng);
        } else {

          console.log('gmaps.js: Marker cache miss for address ' + x + '. Querying gmaps...');
          GMaps.geocode({
            address: x,
            callback: function(results, status) {
              if (status == 'OK') {
                var latlng = results[0].geometry.location;

                // _map.setCenter(latlng.lat(), latlng.lng());
                // var marker = _map.addMarker({
                //   position: latlng,
                //   icon: '//maps.google.com/mapfiles/ms/icons/' + hue + '-dot.png'
                // })
                var marker = op(latlng);

                _markers[id] = marker;
                console.log('gmaps.js: Marker placed and cached: ' + x + ' [' + id + ']');
                _cached_markers[x] = latlng;
                if (done != undefined) { done(); }
                resolve(latlng);
              }
            }
          })
        }
      }
    )
  }

  var destroy = function() {
    $(_canvas).empty();
    $(_interactions).empty();
  }  

  return {
    initialize: initialize,
    clear_route: clear_route,

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