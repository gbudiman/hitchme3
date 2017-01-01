var login_aux = (function() {
  var success = function() {
    window.opener.profile.transition('logged_in');
    window.close();
  } 

  return {
    success: success
  }
})();