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

  var linear_timeline = function(obj_a, obj_b) {
    var a = obj_a.val().trim();
    var b = obj_b.val().trim();

    console.log(a + ' ? ' + b);

    if (a.length > 0 && b.length > 0) {
      console.log('checking linearity');
      if (moment(a) > moment(b)) {
        console.log(a + ' <=> ' + b);
        obj_a.parent().addClass('has-error');
        obj_b.parent().addClass('has-error');
        return 1;
      } else {
        obj_a.parent().removeClass('has-error');
        obj_b.parent().removeClass('has-error');
      }
    }

    return 0;
  }

  var clear_error = function(o) {
    o.parent().removeClass('has-error');
  }

  return {
    clear_error: clear_error,
    not_empty: not_empty,
    linear_timeline: linear_timeline
  }
})()