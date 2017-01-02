var form_validator = (function() {
  var not_empty = function(o, _highlight_error) {
    var highlight_error = _highlight_error == undefined ? true : _highlight_error
    if (o.val().trim().length > 0) {
      o.parent().removeClass('has-error');
      return 0;
    } else {
      if (highlight_error) {
        o.parent().addClass('has-error');
      } else {
        o.parent().removeClass('has-error');
      }

      return 1;
    }
  }

  var linear_timeline = function(a, b) {
    if (a.length > 0 && b.length > 0) {
      if (moment(a) < moment(b)) {
        return 0;
      }
    }

    return 1;
  }

  return {
    not_empty: not_empty,
    linear_timeline: linear_timeline
  }
})()