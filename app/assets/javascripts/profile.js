var profile = (function() {
  var _state = 'init';

  var initialize = function() {
    //console.log('initializing state ' + _state);
    hide_profile_button();

    switch (_state) {
      case 'init':
        $('#fb-login')
          .show().text('Sign In')
          .off('click').on('click', function() {
            window.open('/auth/facebook', 'login_aux', 
                        'scrollbars=0, resizable=0, height=256, width=384');
          })
        check_existing_session();
        break;
      case 'logging_in':
        $('#fb-login')
          .show().text('Logging In...')
          .off('click');
        break;
      case 'logged_in':
        show_profile_button();
        $('#fb-login').hide();
        $('#profile-button').show();
        $('#profile-name').text('Fetching name...')
        $('#profile-logout')
          .off('click').on('click', function() {
            transition('init');
          })

        update_profile_name();
        break;
    }
    
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  var update_profile_name = function(done) {
    $.get({
      url: '/session/username',
      method: 'GET'
    }).done(function(res) {
      if (res.valid) {
        $('#profile-name').text(res.name);
      }

      if (done != undefined) { done(); }
    })
  }

  var hide_profile_button = function() {
    setTimeout(function() {
      $('#profile-button').hide()
    }, 128)
  }

  var show_profile_button = function() {
    setTimeout(function() {
      $('#profile-button').show()
    }, 128)
  }

  var check_existing_session = function() {
    update_profile_name(function() {
      transition('logged_in');
    })
  }

  return {
    initialize: initialize,
    transition: transition
  }
})();

$(function() {
  profile.transition('init');
})