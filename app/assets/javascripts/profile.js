var profile = (function() {
  var _state = 'init';

  var initialize = function() {
    switch (_state) {
      case 'init':
        $('#fb-login')
          .text('Sign In')
          .show()

        break;
    }
    
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  return {
    initialize: initialize,
    transition: transition
  }
})();

$(function() {
  profile.transition('init');
})