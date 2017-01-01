var event_finder = (function() {
  var _state = 'init';

  var attach = function() {
    $('#setup-ride-tab').on('shown.bs.tab', function() { transition('setup_ride_clicked') });
    $('#find-ride-tab').on('shown.bs.tab', function() { transition('find_ride_clicked') });
  }

  var initialize = function() {
    console.log('event_finder transition to ' + _state);
    switch(_state) {
      case 'setup_ride_clicked':
        $('#find-ride-switch')
          .parent()
            .parent().css('padding', '10px 15px');
        break;
      case 'find_ride_clicked':
        $('#find-ride-switch')
          .parent()
            .parent().css('padding', '0px 15px');
        break;
    }
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  return {
    attach: attach,
    transition: transition
  }
})();

// attach must be called after DOM is ready. See index.html.haml