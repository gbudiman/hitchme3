var event_finder = (function() {
  var _state = 'init';

  var attach = function() {
    $('#setup-ride-tab').on('shown.bs.tab', function() { transition('setup_ride_clicked') });
    $('#find-ride-tab').on('shown.bs.tab', function() { transition('find_ride_clicked') });
    $('#find-event-search').selectize({
      valueField: 'id',
      labelField: 'name',
      searchField: 'name',
      create: false,
      options: [],
      render: {
        option: function(item, escape) {
          return '<div class="event-search-entry">'
               +   '<div class="event-search-title">' + escape(item.name) + '</div>'
               +   '<div>' + escape(item.address) + '</div>'
               +   '<div>' + escape(moment.unix(item.time_start).format('ddd M/D/Y h:mm A')) + '</div>'
               +   (item.time_end > 0 ?
                     '<div>' + escape(moment.unix(item.time_end).format('ddd M/D/Y h:mm A')) + '</div>' :
                     '')
               +   '<div>' + escape(item.organizer) + '</div>'
               + '</div>'
        },
        item: function(item, escape) {
          return '<div id="find-event-search-result" '
               +      'data-address="' + escape(item.address) + '" '
               +      'data-time_start="' + item.time_start + '" '
               +      'data-time_end="' + item.time_end + '" '
               +      'data-name="' + escape(item.name) + '" '
               +      'data-id="' + escape(item.id) + '" '
               + '>' 
               +   item.name 
               +   ' (' 
               +   '<span class="event-search-downlight">'
               +     moment.unix(item.time_start).format('M/D') 
               +   '</span>'
               +   ')'
               + '</div>';
        }
      },
      load: function(query, callback) {
        if (!query.length) return callback();
        $.ajax({
          url: '/event/search',
          type: 'GET',
          data: {
            q: encodeURIComponent(query)
          }
        }).done(function(res) {
          if (res.status == 'OK') {
            callback(res.results);
          } 
        })
      },
      onChange: function(item) {
        gmaps.clear_all_markers();
        gmaps.place_marker(get_selected('address'), 'event-found', 'blue');

        var event_start_time = parseInt(get_selected('time_start'));
        var event_end_time = parseInt(get_selected('time_end'));

        event_setup_ride.set_date('departure', event_start_time);

        if (event_end_time > 0) {
          event_setup_ride.set_date('return', get_selected('time_end'));
        }
      }
    })
  }

  var get_selected = function(q) {
    var item = $('#find-event-search-result');

    return item.attr('data-' + q);
  }

  var initialize = function() {
    console.log('event_finder transition to ' + _state);
    switch(_state) {
      case 'setup_ride_clicked':
        $('#find-ride-switch')
          .parent().hide()
            .parent().css('padding', '10px 15px');
        break;
      case 'find_ride_clicked':
        $('#find-ride-switch')
          .parent().show()
            .parent().css('padding', '0px 15px');
        break;
    }
  }

  var transition = function(x) {
    _state = x;
    initialize();
  }

  return {
    attach: attach,
    get_selected: get_selected,
    transition: transition
  }
})();

// attach must be called after DOM is ready. See index.html.haml