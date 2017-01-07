var event_find_ride = (function() {
  var _state = 'init';
  var _event_id;
  var _time_to_event;
  var _time_to_home;
  var _supplied_time_to_event;
  var _supplied_time_to_home;
  var _latlng;

  var _boundary_step = 250000;
  var _trip_cache;

  var invalidate = function() {
    $('#find-ride-search').prop('disabled', true)
  }

  var set_search_button = function(state) {
    var o = $('#find-ride-search');
    switch(state) {
      case 'default':
        o.text('Search').show().prop('disabled', false);
        break;
      case 'search_running':
        o.text('Finding rides...').show().prop('disabled', true); 
        break;
      case 'search_completed':
        o.text('Search').hide().prop('disabled', false); 
        break;
    }
  }

  var attach = function() {
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('find-ride-address'));
    autocomplete.addListener('place_changed', function() {
      var marker_id;
      var marker_color;

      set_search_button('default');
      render(null);
      switch(current_travel_direction()) {
        case 'to_event':
          marker_color = 'yellow';
          marker_id = 'ride-request-to-event';
          break;
        case 'to_home':
          marker_color = 'orange';
          marker_id = 'ride-request-to-home';
          break;
      }
      run_validations();

      gmaps.clear_marker(marker_id)
      gmaps.place_marker($('#find-ride-address').val(),
                         marker_id,
                         marker_color)
        .then(function(latlng) {
          _latlng = latlng;
          gmaps.set_bounds();
        });
    })

    $('#find-ride-start-time').datetimepicker();
    $('#find-ride-switch').on('change', function() {
      set_search_button('default');

      switch(current_travel_direction()) {
        case 'to_event':
          gmaps.clear_marker('ride-request-to-home');
          gmaps.clear_route('route-to-home');
          gmaps.clear_route('route-additional-to-home');

          gmaps.place_marker($('#find-ride-address').val(), 'ride-request-to-event', 'yellow')
            .then(function() { gmaps.set_bounds(); });
          break;
        case 'to_home':
          gmaps.clear_marker('ride-request-to-event');
          gmaps.clear_route('route-to-event');
          gmaps.clear_route('route-additional-to-event');

          gmaps.place_marker($('#find-ride-address').val(), 'ride-request-to-home', 'orange')
            .then(function() { gmaps.set_bounds(); });
          break;
      }

      set_input_time(false);
      //cycle_default_time();
      run_validations();
      render(null);
    })

    $('#find-ride-address').on('focus', function() {
      $(this).select();
    })

    $('#find-ride-start-time')
      .on('keyup', set_input_time)
      .on('dp.change', set_input_time);

    $('#find-ride-search').on('click', function() {
      set_search_button('search_running');

      $.ajax({
        method: 'GET',
        url: '/trip/search',
        data: {
          event_id: _event_id,
          bounds: create_latlng_boundary(1),
          trip_type: current_travel_direction
        }
      }).done(function(res) {
        if (res.status == 'OK') {
          render(res.results);

          set_search_button('search_completed');
        }
      })
    })
  }


  var render = function(data) {
    console.log(data);
    var sr = $('#find-ride-search-result');

    sr.empty();

    _trip_cache = new Object();
    gmaps.clear_all_routes();
    gmaps.clear_marker('ride-offered-start');
    gmaps.clear_marker('ride-offered-end');

    if (data == null) { return; }

    sr.append($('<a/>')
                .addClass('list-group-item')
                .append('Search Results'));

    $.each(data, function(trip_id, trip_data) {
      sr.append($('<a/>')
                  .addClass('list-group-item list-search-entry')
                  .attr('href', '#')
                  .attr('trip-id', trip_id)
                  .attr('trip-type', trip_data.trip_type)
                  .attr('trip-organizer', trip_data.trip_orgainzer)
                  .attr('trip-start-address', trip_data.trip_start_address)
                  .attr('trip-event-address', trip_data.event_address)
                  .attr('trip-waypoints', JSON.stringify(trip_data.waypoints))
                  .append($('<div/>')
                            .append(trip_data.trip_start_address))
                  .append($('<div/>')
                            .append(moment(trip_data.trip_start_time).format('ddd M/D/Y h:mm A'))));
    })

    $('a.list-search-entry').on('click', function() {
      var trip_id = parseInt($(this).attr('trip-id'));
      var trip_type = $(this).attr('trip-type');
      var trip_start_address = $(this).attr('trip-start-address');
      var trip_event_address = $(this).attr('trip-event-address');
      var waypoints = JSON.parse($(this).attr('trip-waypoints'));
      var additional_waypoint = $('#find-ride-address').val().trim();

      waypoints.push(additional_waypoint);

      var addresses = {
        event: trip_event_address,
        local: trip_start_address,
        pickup: additional_waypoint,
        waypoints: waypoints,
      }
      
      $('a.list-search-entry').removeClass('active');
      $(this).addClass('active');

      gmaps.route_with_alternate(trip_id, trip_type, addresses)
        .then(function(res) {
          console.log(res);
        });

      return false;
    })
  }

  var visualize_shortest_to = function(latlng, trip_id) {
    if (_trip_cache[trip_id] == undefined) {
      $.ajax({
        method: 'GET',
        url: '/trip/steps',
        data: { 
          trip_id: trip_id
        }
      }).done(function(res) {
        if (res.status == 'OK') {
          _trip_cache[trip_id] = res.results;

          render_visualization(latlng, trip_id);
        }
      })
    } else {
      render_visualization(latlng, trip_id);
    }
  }

  var render_visualization = function(latlng, trip_id) {
    var cached = _trip_cache[trip_id];



    // var find_neighbors = function(i) {
    //   points = new Array();

    //   if (i != 0 && cached[i - 1] != undefined) {
    //     points.push(cached[i - 1]);
    //   }

    //   points.push(cached[i]);

    //   if (cached[i + 1] != undefined) {
    //     points.push(cached[i + 1]);
    //   }
    // }

    // haversine
    //   .get_shortest(latlng, cached)
    //   .then(function(min_distance, index) {
    //     console.log(min_distance);
    //     console.log(index);
    //     console.log('--');
    //     $.each(find_neighbors(index), function(i, x) {
    //       console.log(x);
    //     });
    //   });
    // // $.each(_trip_cache[trip_id], function(i, x) {
    // //   console.log(x);
    // // })
  }

  var create_latlng_boundary = function(level) {
    var d = {
      lat_lo: parseInt(_latlng.lat() * 1000000),
      lat_hi: parseInt(_latlng.lat() * 1000000),
      lng_lo: parseInt(_latlng.lng() * 1000000),
      lng_hi: parseInt(_latlng.lng() * 1000000)
    }

    var mod = level * _boundary_step;

    d.lat_lo -= mod;
    d.lat_hi += mod; 
    d.lng_lo -= mod;
    d.lng_hi += mod;

    return d;
  }

  var set_input_time = function(_do_update) {
    var do_update = _do_update == undefined ? true : _do_update;
    var travel_direction = current_travel_direction();
    var input = $('#find-ride-start-time').val().trim();

    console.log('SIT triggered for: ' + travel_direction);
    if (do_update && input.length > 0) {
      switch(travel_direction) {
        case 'to_home':
          _supplied_time_to_home = moment(input);
          break;
        case 'to_event':
          _supplied_time_to_event = moment(input);
          break;
      }
    }

    switch(travel_direction) {
      case 'to_home':
        if (_supplied_time_to_home == undefined) {
          if (_time_to_home == undefined) { return; }
          $('#find-ride-start-time').val(_time_to_home.format('ddd M/D/Y h:mm A'));
        } else {
          $('#find-ride-start-time').val(_supplied_time_to_home.format('ddd M/D/Y h:mm A'));
        }
        break;
      case 'to_event':
        if (_supplied_time_to_event == undefined) {
          if (_time_to_event == undefined) { return; }
          $('#find-ride-start-time').val(_time_to_event.format('ddd M/D/Y h:mm A'));
        } else {
          $('#find-ride-start-time').val(_supplied_time_to_event.format('ddd M/D/Y h:mm A'));
        }
        break;
    }
  }

  var current_travel_direction = function() {
    return $('#find-ride-switch').prop('checked') ? 'to_home' : 'to_event';
  }

  var set_date = function(start, end) {
    _time_to_event = moment.unix(start);
    _time_to_home = moment.unix(end);

    set_input_time();
    run_validations();
  }

  var set_event_id = function(x) {
    _event_id = x;
  }

  var run_validations = function() {
    var error = form_validator.not_empty($('#find-ride-address'))
              + form_validator.not_empty($('#find-ride-start-time'));

    $('#find-ride-search').prop('disabled', error > 0);
  }

  var initialize = function() {
    switch(_state) {
      case 'init':
        $('#find-ride-address').val('');
        $('#find-ride-start-time').val('');
        gmaps.clear_all_markers();
        gmaps.clear_all_routes();
        reset_private_data();
        run_validations();
        break;
      case 'event-selected':
        break;
    }
  }

  var reset_private_data = function() {
    _supplied_time_to_event = undefined;
    _supplied_time_to_home = undefined;
    _time_to_event = undefined;
    _time_to_home = undefined;
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  return {
    attach: attach,
    transition: transition,
    set_date: set_date,
    set_event_id: set_event_id,
    create_latlng_boundary: create_latlng_boundary
  }
})();