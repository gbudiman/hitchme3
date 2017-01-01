var event_finder = (function() {
  var _state = 'init';

  var attach = function() {
    $('#setup-ride-tab').on('shown.bs.tab', function() { transition('setup_ride_clicked') });
    $('#find-ride-tab').on('shown.bs.tab', function() { transition('find_ride_clicked') });
    $('#find-event-search').selectize({
      valueField: 'address',
      labelField: 'name',
      searchField: 'name',
      create: false,
      options: [],
      render: {
        option: function(item, escape) {
          return '<div class="event-search-entry">'
               +   '<div class="event-search-title">' + escape(item.name) + '</div>'
               +   '<div>' + escape(item.address) + '</div>'
               +   '<div>' + escape(moment.unix(item.time_start).format('M/D/Y h:mm A ZZ')) + '</div>'
               +   (item.time_end > 0 ?
                     '<div>' + escape(moment.unix(item.time_end).format('M/D/Y h:mm A ZZ')) + '</div>' :
                     '')
               +   '<div>' + escape(item.organizer) + '</div>'
               + '</div>'
        },
        item: function(item, escape) {
          return '<div>' 
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
        gmaps.place_marker(item, 'event-found', 'blue');
      }
    })
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
    transition: transition
  }
})();

// attach must be called after DOM is ready. See index.html.haml