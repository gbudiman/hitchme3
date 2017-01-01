var profile = (function() {
  var _state = 'init';

  var initialize = function() {
    console.log('initializing state ' + _state);
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
        $('#profile-name').text('Fetching data...')
        update_profile_name(function() { 
          planner.transition('init'); 
          transition('logged_in_post');
        });
        break;
      case 'logged_in_post':
        show_profile_button();
        $('#fb-login').hide();
        $('#profile-button').show();
        $('#profile-logout')
          .off('click').on('click', function() {
            transition('logging_out');
            window.open('/session/destroy', 'logout_aux',
                        'scrollbars=0, resizable=0, height=256, width=384');
          })
        break;
      case 'logging_out':
        $('#fb-login')
          .show().text('Logging Out...')
          .off('click');
        hide_profile_button();
    }
    
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  var display_intro = function(val) {
    if (val) {
      $('#intro').show();
    } else {
      $('#intro').hide();
    }
  }

  var update_profile_name = function(done) {
    $.get({
      url: '/session/username',
      method: 'GET'
    }).done(function(res) {
      console.log(res);
      if (res.valid) {
        $('#profile-name').text(res.name);
        console.log('hiding');
        display_intro(false);

        if (done != undefined) { done(); }
      } else {
        console.log('showing');
        display_intro(true);
      }      
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
      transition('logged_in_post');
      planner.transition('init');
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