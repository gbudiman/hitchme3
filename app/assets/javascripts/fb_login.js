var fb_login = (function() {
  var user_data;

  var current_user_data = function() {
    return user_data;
  }

  var get_user_data = function(done) {
    FB.api('/me', { fields: 'email, link, name' }, function(api_response) {
      console.log('API response: ');
      console.log(api_response);

      user_data = api_response;
      done();
    })
  }

  var check_login_status = function() {
    return new Promise(
      function(resolve, reject) {
        FB.getLoginStatus(function(response) {
          resolve(response);
        })
      }
    )
  }

  var status = function() {
    check_login_status().then(function(response) {
      console.log('Resolved: ');
      console.log(response);

      if (response.status === 'connected') {
        get_user_data();
      }
    })
  }

  var login = function() {
    check_login_status().then(function(response) {
      if (response.status === 'connected') {
        console.log('already logged in');
      } else {
        console.log('attempting to log in');
        FB.login(function(login_response) {
          console.log('response from FB.login: ');
          console.log(login_response);
          
          get_user_data(update_profile_button);
        })
      }
    })
  }

  var logout = function() {
    check_login_status().then(function(response) {
      if (response.status == 'connected') {
        FB.logout(function(response) {
          console.log('response from FB.logout: ');
          console.log(response);

          user_data = undefined;
        })
      } else {
        console.log('Not logged in. Ignoring...');
      }
    })
  }

  var initialize = function() {
    profile_button.transition('init');
    // get_user_data().then(function() {
    //   console.log(user_data);
    //   profile_button.transition('just_logged_in', {
    //     name: user_data.name
    //   });
    // })
    get_user_data(update_profile_button);
  }

  var update_profile_button = function() {
    profile_button.transition('just_logged_in', {
      name: user_data.name
    })
  }

  return {
    initialize: initialize,
    status: status,
    login: login,
    logout: logout,
    current_user_data: current_user_data
  }
})()

// function fb_login() {
//   console.log('called in');
//   FB.getLoginStatus(function(response) {
//     console.log(response);

//     if (response.status === 'connected') {
//       console.log('Already logged in...');
//     } else {
//       console.log('attempting log in...');
//       FB.login(function(response) {
//         if (response.authResponse) {
//           window.location.href = 'http://localhost:4000/auth/facebook/callback';
//           FB.api('/me', function(response) {
//             console.log(response);
//           }) 
//         } else {
//           console.log('login canceled');
//         }
//       });
//     }
//   })
// }

// function fb_logout() {
//   console.log('called out');

//   FB.getLoginStatus(function(response) {
//     console.log(response);
//     if (response.status == 'connected') {
//       FB.logout(function(response) {
//         console.log('out!');
//       })
//     }
//   })
// }

// function fb_check_status() {
//   FB.getLoginStatus(function(response) {
//     console.log(response);
//   })
// }

// function attach_auths() {
//   $('#fb-login').on('click', fb_login);
//   $('#fb-logout').on('click', fb_logout);
// }