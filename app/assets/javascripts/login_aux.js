var login_aux = (function() {
  var success = function() {
    window.opener.profile.transition('logged_in');
    window.close();
  } 

  var logout = function() {
    window.opener.profile.transition('init');
    window.close();
  }

  return {
    success: success,
    logout: logout
  }
})();