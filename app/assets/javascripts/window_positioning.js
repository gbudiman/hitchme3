var window_positioning = (function() {
  var initialize = function() {
    $(window).on('resize', function() {
      var new_width = $(window).width();
      if (new_width < 768) {
        $('#map-canvas').outerWidth(768);
        $('#map-interactions').outerWidth(768);
      } else {
        $('#map-canvas').outerWidth(8/12 * new_width);
        $('#map-interactions').outerWidth(4/12 * new_width);
      }

      gmaps.reposition();

    })
  }

  return {
    initialize: initialize
  }
})()

$(function() {
  window_positioning.initialize();
})