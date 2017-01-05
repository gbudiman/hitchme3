var event_find_ride = (function() {
  var _state = 'init';
  var _event_id;
  var _time_to_event;
  var _time_to_home;
  var _supplied_time_to_event;
  var _supplied_time_to_home;
  var _latlng;

  var _boundary_step = 250000;

  var invalidate = function() {
    $('#find-ride-search').prop('disabled', true)
  }

  var attach = function() {
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('find-ride-address'));
    autocomplete.addListener('place_changed', function() {
      run_validations();

      gmaps.place_marker($('#find-ride-address').val(),
                         'ride-request-to-event',
                         'yellow')
        .then(function(latlng) {
          _latlng = latlng;
          gmaps.set_bounds();
        });
    })

    $('#find-ride-start-time').datetimepicker();
    $('#find-ride-switch').on('change', function() {
      set_input_time(false);
      //cycle_default_time();
      run_validations();
    })

    $('#find-ride-address').on('focus', function() {
      $(this).select();
    })

    $('#find-ride-start-time')
      .on('keyup', set_input_time)
      .on('dp.change', set_input_time);

    $('#find-ride-search').on('click', function() {
      $.ajax({
        method: 'GET',
        url: '/trip/search',
        data: {
          event_id: _event_id,
          bounds: create_latlng_boundary(1),
          trip_type: current_travel_direction
        }
      }).done(function(res) {

      })
    })
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