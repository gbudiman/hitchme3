var event_setup_ride = (function() {
  var _state = 'init';

  var get_route = function(destination) {
    switch(destination) {
      case 'to_event':
        gmaps.route($('#offer-ride-depart-address').val(), 
                    event_finder.get_selected('address'),
                    'route-to-event', 'red');
        break;
      case 'to_home':
        gmaps.route(event_finder.get_selected('address'), 
                    $('#offer-ride-return-address').val(),
                    'route-to-home', 'green');
        break;
    }
    gmaps.set_bounds();
    
  }

  var reset_all_fields = function() {
    $('#offer-ride-depart-address').val('');
    $('#offer-ride-depart-time').val('');
    $('#offer-ride-return-address').val('');
    $('#offer-ride-return-time').val('');

    $('#offer-ride-departure').bootstrapToggle('on');
    $('#offer-ride-return').bootstrapToggle('off');
  }

  var trigger_gmaps_route = function(address, marker_id, marker_color, func) {
    gmaps.clear_marker(marker_id);
    gmaps.place_marker(address, marker_id, marker_color, func);
  }

  var trigger_route_to = function(destination) {
    switch(destination) {
      case 'event':
        trigger_gmaps_route($('#offer-ride-depart-address').val().trim(),
                            'ride-offered-start',
                            'red',
                            function() { get_route('to_event'); });
        break;
      case 'home':
        trigger_gmaps_route($('#offer-ride-return-address').val().trim(),
                            'ride-offered-end',
                            'green',
                            function() { get_route('to_home'); });
        break;
    }
  }

  var initialize = function() {
    switch(_state) {
      case 'init':
        
        
        $('#offer-ride-departure').bootstrapToggle('on');
        var autocomplete_depart = new google.maps.places.Autocomplete(document.getElementById('offer-ride-depart-address'));
        var autocomplete_return = new google.maps.places.Autocomplete(document.getElementById('offer-ride-return-address'));
        autocomplete_depart.addListener('place_changed', function() {
          trigger_route_to('event');
          $('#offer-ride-return-address').val(($('#offer-ride-depart-address')).val());

        })
        autocomplete_return.addListener('place_changed', function() {
          trigger_route_to('home');
        })

        $('#offer-ride-depart-time').datetimepicker();
        $('#offer-ride-return-time').datetimepicker();

        $('#offer-ride-depart-address').on('keyup', function() {
          run_validations();
          $('#offer-ride-return-address').val($('#offer-ride-depart-address').val().trim());
        })
        $('#offer-ride-return-address').on('keyup', run_validations);
        $('#offer-ride-depart-time')
          .on('keyup', run_validations)
          .on('dp.change', run_validations);
        $('#offer-ride-return-time')
          .on('keyup', run_validations)
          .on('dp.change', run_validations);

        $('#offer-ride-departure').on('change', function() {
          gmaps.clear_route('route-to-event');
          if ($(this).prop('checked')) {
            if ($('#offer-ride-depart-address').val().trim().length > 0) {
              trigger_route_to('event');
            }
          } else {
            gmaps.clear_marker('ride-offered-start');

          }
          run_validations();
        });

        $('#offer-ride-return').on('change', function() {
          gmaps.clear_route('route-to-home');
          if ($(this).prop('checked')) {
            console.log('checked');
            if ($('#offer-ride-return-address').val().trim().length > 0) {
              trigger_route_to('home');
            }
          } else {
            gmaps.clear_marker('ride-offered-end');
            
          }
          run_validations();
        });

        reset_all_fields();
        run_validations(false);
        break;
    }
  }

  var set_nonlinear_error = function(val) {
    if (val) { $('#offer-ride-non-linear-time').show(400); }
    else { $('#offer-ride-non-linear-time').hide(400); }
  }

  var run_validations = function(highlight_error) {
    var departure_offered = $('#offer-ride-departure').prop('checked');
    var return_offered = $('#offer-ride-return').prop('checked');
    var error_count = 0;

    if (departure_offered) {
      error_count += form_validator.not_empty($('#offer-ride-depart-address'), highlight_error);
      error_count += form_validator.not_empty($('#offer-ride-depart-time'), highlight_error);
    } else {
      form_validator.clear_error($('#offer-ride-depart-address'))
      form_validator.clear_error($('#offer-ride-depart-time'))
    }

    if (return_offered) {
      console.log('return offered');
      error_count += form_validator.not_empty($('#offer-ride-return-address'), highlight_error);
      error_count += form_validator.not_empty($('#offer-ride-return-time'), highlight_error);
    } else {
      form_validator.clear_error($('#offer-ride-return-address'))
      form_validator.clear_error($('#offer-ride-return-time'))
    }

    if (departure_offered && return_offered) {
      var non_linear_error = form_validator.linear_timeline($('#offer-ride-depart-time'),
                                                            $('#offer-ride-return-time'));
 
      error_count += non_linear_error;

      if (non_linear_error == 1) {
        set_nonlinear_error(true);
      } else {
        set_nonlinear_error(false);
      }
    } else {
      set_nonlinear_error(false);
    }

    if (!departure_offered && !return_offered) {
      $('#offer-trip-create').prop('disabled', true);
    } else {
      $('#offer-trip-create').prop('disabled', error_count > 0);
    }
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  var set_date = function(type, val) {
    console.log('set date: ' + val);
    var date = moment.unix(val).format('M/D/Y h:mm A');

    switch(type) {
      case 'departure':
        $('#offer-ride-depart-time').val(date);
        break;
      case 'return':
        $('#offer-ride-return-time').val(date);
        break;
    }
  }

  return {
    transition: transition,
    set_date: set_date
  }
})();