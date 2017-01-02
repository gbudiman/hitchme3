var event_setup_ride = (function() {
  var _state = 'init';

  var get_route = function(destination) {
    switch(destination) {
      case 'to_event':
        gmaps.route($('#offer-ride-depart-address').val(), $('#find-event-search').val());
        break;
      case 'to_home':
        gmaps.route($('#find-event-search').val(), $('#offer-ride-return-address').val());
        break;
    }
    gmaps.set_bounds();
    
  }

  var initialize = function() {
    switch(_state) {
      case 'init':
        $('#offer-ride-departure').bootstrapToggle('on');
        var autocomplete_depart = new google.maps.places.Autocomplete(document.getElementById('offer-ride-depart-address'));
        var autocomplete_return = new google.maps.places.Autocomplete(document.getElementById('offer-ride-return-address'));
        autocomplete_depart.addListener('place_changed', function() {
          gmaps.clear_marker('ride-offered-start');
          gmaps.place_marker($('#offer-ride-depart-address').val().trim(), 
                             'ride-offered-start', 
                             'red', 
                             function() { get_route('to_event'); })

        })
        autocomplete_return.addListener('place_changed', function() {
          gmaps.clear_marker('ride-offered-end');
          gmaps.place_marker($('#offer-ride-return-address').val().trim(), 
                             'ride-offered-end', 
                             'green',
                             function() { get_route('to_home'); })
        })

        $('#offer-ride-depart-time').datetimepicker();
        $('#offer-ride-return-time').datetimepicker();
        break;
    }
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  return {
    transition: transition
  }
})();