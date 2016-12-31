var profile_button = (function() {
  var _state = 'init';

  var initialize = function() {
    switch (_state) {
      case 'init':
        $('#profile-login')
          .show()
          .off('click').on('click', function() { fb_login.login() });
        $('#profile-button').hide();
        break;
      case 'logging_in':
        $('#profile-login')
          .off('click')
          .text('Logging In...')
        break;
      case 'just_logged_in':
        $('#profile-login')
          .hide()
          .off('click').on('click', fb_login.login());
        $('#profile-button')
          .show()
        break;
    }
  }

  var transition = function(target_state, args) {
    _state = target_state;
    console.log('transitioning to ' + target_state);
    initialize();
    
    console.log(args);
    switch(_state) {
      case 'just_logged_in': set_friendly_button(args.name); break;
    }
  }

  var set_friendly_button = function(x) {
    $('#profile-button').text(x);
  }

  return {
    transition: transition
  }
})()