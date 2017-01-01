var window_positioning = (function() {
  var set_widths = function(new_width, new_height) {
    if (new_width < 970) {
      $('#map-canvas').outerWidth(new_width);
      $('#map-interactions')
        .outerWidth(new_width)
        .height(new_height)
        .css('padding-top', '15px')
        .css('padding-bottom', '15px');
    } else {
      $('#map-canvas').outerWidth(8/12 * new_width);
      $('#map-interactions')
        .outerWidth(4/12 * new_width)
        .height(new_height)
        .css('padding-top', 0)
        .css('padding-bottom', 0)

    }
  }

  var initialize = function() {
    $(window).on('resize', function() {
      var new_width = $(window).width();
      var new_height = gmaps.get_canvas_height();
      set_widths(new_width, new_height);
      $('#map-canvas').outerHeight(new_height)

      gmaps.reposition();
    })

    set_widths($(window).width(), gmaps.get_canvas_height());
  }

  return {
    initialize: initialize
  }
})()

$(function() {
  window_positioning.initialize();
})