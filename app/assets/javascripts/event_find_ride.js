var event_find_ride = (function() {
  var _state = 'init';
  var _time_to_event;
  var _time_to_home;
  var _supplied_time_to_event;
  var _supplied_time_to_home;

  var invalidate = function() {
    $('#find-ride-search').prop('disabled', true)
  }

  var attach = function() {
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('find-ride-address'));
    autocomplete.addListener('place_changed', function() {
      run_validations();


      gmaps.place_marker($('#find-ride-address').val(),
                         'ride-request-to-event',
                         'yellow');
    })

    $('#find-ride-start-time').datetimepicker();
    $('#find-ride-switch').on('change', function() {
      set_input_time(false);
      //cycle_default_time();
      run_validations();
    })

    $('#find-ride-start-time')
      .on('keyup', set_input_time)
      .on('dp.change', set_input_time);
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

  var supplied_data = function() {
    return {
      to_event: _supplied_time_to_event,
      to_home: _supplied_time_to_home,
      default_to_event: _time_to_event,
      default_to_home: _time_to_home
    }
  }

  return {
    attach: attach,
    transition: transition,
    set_date: set_date,
    supplied_data: supplied_data
  }
})();