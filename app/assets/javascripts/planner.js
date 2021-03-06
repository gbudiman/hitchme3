var planner = (function() {
  var _state = 'hidden';
  var render_has_been_called = false;

  var initialize = function() {
    switch(_state) {
      case 'hidden':
        render_has_been_called = false;
        gmaps.destroy();
        break;
      case 'init':
        render_base_map();
        break;
    }
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  var render_base_map = function() {
    // var s = $('<script/>')
    //           .attr('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB0HMkhjSZwLxLMtOzokyyxQueN6G7fGK0&callback=init_map&libraries=places')
    //           .attr('async', true)
    //           .attr('defer', true);

    if (!render_has_been_called) {
      $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB0HMkhjSZwLxLMtOzokyyxQueN6G7fGK0&callback=init_map&libraries=places')
      render_has_been_called = true;
    }
  }

  return {
    transition: transition
  }
})()

