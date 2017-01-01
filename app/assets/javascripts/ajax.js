$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  var token = $('meta[name="csrf-token"]').attr('content');
  jqXHR.setRequestHeader('X-CSRF-Token', token);
})