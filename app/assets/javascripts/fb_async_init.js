window.fbAsyncInit = function() {
  FB.init({
    appId      : '216881162054658',
    xfbml      : true,
    version    : 'v2.8',
    status     : true
  });
  FB.AppEvents.logPageView();

  fb_login.initialize()
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));