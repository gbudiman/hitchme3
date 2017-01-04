var existing_ride_offers = (function() {
  var _event_id;

  var fetch = function(id) {
    _event_id = id;

    $.get({
      url: '/event/my/offers',
      data: {
        id: id
      }
    }).done(function(res) {
      if (res.status == 'OK') {
        //console.log(res.results);

        render(res.results);
      }
    })
  }

  var render = function(data) {
    $('#existing-ride-offers')
      .empty();


    if (data.length == 0) { return; }
    $('#existing-ride-offers')
      //.append('<h4>Existing Offers</h4>')
      .append($('<h4/>')
                .append('Existing Offers')
                .append($('<a/>')
                          .attr('href', '#')
                          .attr('id', 'existing-ride-offers-refresh')
                          .append($('<span/>')
                                    .addClass('pull-right glyphicon glyphicon-refresh'))))

    $('#existing-ride-offers-refresh').on('click', function() {
      fetch(_event_id);
      return false;
    })

    $.each(data, function(i, d) {
      var trip_data;

      var s = $('<a/>')
                .addClass('list-group-item')

      if (d.trip_type == 'to_event') {
        trip_data = $('<div/>')
                      .append(d.address + ' &raquo; Event');
      } else {
        trip_data = $('<div/>')
                      .append('Event &raquo; ' + d.address);
      }

      s.append(trip_data)
       .append($('<div/>')
                 .append(moment(d.time_start).format('ddd M/D/Y h:mm A')))
       .append($('<span/>')
                 .addClass('pull-right')
                 .append('<a href="#" class="delete-ride-offer" '
                          + 'data-id=' + d.id + ' '
                          + 'data-delete-trip-type="' + d.trip_type + '" '
                          + '>Delete</a>'))
       .append($('<div/>').addClass('row'))
       .attr('data-trip-type', d.trip_type)
       .attr('data-event-address', d.event_address)
       .attr('data-local-address', d.address);
      $('#existing-ride-offers').append(s);
    })

    attach_actions();
  }

  var attach_actions = function() {
    $('a.delete-ride-offer[data-id]').on('click', function() {
      var id = parseInt($(this).attr('data-id'));
      var delete_type = $(this).attr('data-delete-trip-type');
      execute_delete(id, delete_type);
      return false;
    })

    $('a[data-trip-type]').on('click', function() {
      var trip_type = $(this).attr('data-trip-type');

      $('a[data-trip-type="' + trip_type + '"]').removeClass('active');
      $(this).addClass('active');
      draw_on_map($(this));
    })
  }

  var deactivate_highlight = function(type) {
    $('a[data-trip-type="' + type + '"]').removeClass('active');  
  }

  var draw_on_map = function(o) {
    var type = o.attr('data-trip-type');
    var event_address = o.attr('data-event-address');
    var local_address = o.attr('data-local-address');
    var polylines = o.attr('data-polylines');

    gmaps.clear_marker('event-created');
    if (type == 'to_event') {
      gmaps.clear_marker('ride-offered-start');
      gmaps.clear_route('route-to-event');

      gmaps.place_marker(local_address, 'ride-offered-start', 'red', function() {
        gmaps.place_marker(event_address, 'event-created', 'blue', function() {
          gmaps.set_bounds();
        });
      });
      
      gmaps.route(local_address, event_address, 'route-to-event', 'red');
    } else {
      gmaps.clear_marker('ride-offered-end');
      gmaps.clear_route('route-to-home');
      gmaps.place_marker(local_address, 'ride-offered-end', 'green', function() {
        gmaps.place_marker(event_address, 'event-created', 'blue', function() {
          gmaps.set_bounds();
        });
      });
      
      gmaps.route(event_address, local_address, 'route-to-home', 'green');
    }

    return false;
  }

  var mark_as_deleted = function(id, val) {
    var obj = $('a.delete-ride-offer[data-id="' + id + '"]').parent().parent();

    if (val) {
      obj.find('div').addClass('deleted');
    } else {
      obj.find('div').removeClass('deleted');
    }

    return obj;
  }

  var execute_delete = function(id, type) {
    var obj = $('a.delete-ride-offer[data-id="' + id + '"]');

    obj
      .removeAttr('href')
      .text('Deleting...');

    // obj.parent().parent().removeClass('active')
    //   .find('div').addClass('deleted');

    mark_as_deleted(id, true).removeClass('active');

    $.ajax({
      url: '/trip/destroy',
      method: 'DELETE',
      data: { id: id }
    }).done(function(res) {
      if (res.status == 'OK') {
        //fetch(_event_id);

        var timeout_id = window.setTimeout(function() {
          obj.parent().parent().hide(400, function() {
            $(this).remove();
          })
        }, 3000);

        obj
          .attr('href', '#')
          .text('Undo')
          .off('click').on('click', function() {
            undo_delete(id, type, timeout_id);

            return false;
          })
        switch(type) {
          case 'to_event':
            gmaps.clear_marker('ride-offered-start');
            gmaps.clear_route('route-to-event');
            break;
          case 'to_home':
            gmaps.clear_marker('ride-offered-end');
            gmaps.clear_route('route-to-home');
            break;
        }
      }
    })
  }

  var undo_delete = function(id, type, timeout_id) {
    window.clearTimeout(timeout_id);
    var obj = $('a.delete-ride-offer[data-id="' + id + '"]');

    obj
      .removeAttr('href')
      .text('Undeleting...');

    $.ajax({
      url: '/trip/undestroy',
      method: 'POST',
      data: { id: id }
    }).done(function(res) {
      if (res.status == 'OK') {
        mark_as_deleted(id, false);

        obj
          .attr('href', '#')
          .text('Delete')
          .off('click').on('click', function() {
            execute_delete(id, type);
            return false;
          })
      }
    })
  }

  return {
    fetch: fetch,
    deactivate_highlight: deactivate_highlight
  }
})();

$(function() {
  $('#modal-confirm-delete-ride-offer').modal({show: false})
})
