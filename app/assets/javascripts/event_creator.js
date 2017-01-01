var event_creator = (function() {
  var _state = 'init';

  var attach = function() {
    $('#create-event-reset').on('click', function() { transition('reset'); })
    $('#create-event-create').on('click', function() { transition('validating'); })
    $('#create-event-name').on('keyup', run_validations);
    $('#create-event-address').on('keyup', run_validations);
    $('#create-event-start-time').on('keyup', run_validations);
    return this;
  }

  var reset_all_fields = function() {
    $('#create-event-name').val('');
    $('#create-event-address').val('');
  }

  var run_validations = function(highlight_error) {
    var error_count = form_validator.not_empty($('#create-event-name'), highlight_error)
                    + form_validator.not_empty($('#create-event-address'), highlight_error)
                    + form_validator.not_empty($('#create-event-start-time'), highlight_error);

    $('#create-event-create').prop('disabled', error_count > 0);

    return error_count;
  }

  var display_success = function(id) {
    if (id === false) {
      $('#create-event-successful').hide();
    } else {
      $('#create-event-successful').show()
        .find('a')
          .attr('href', '/event/' + id)
    }
    
  }

  var get_data = function() {
    return {
      name: $('#create-event-name').val().trim(),
      address: $('#create-event-address').val().trim(),
      start_time: $('#create-event-start-time').val().trim(),
      end_time: $('#create-event-end-time').val().trim()
    }
  }


  var initialize = function() {
    run_validations(false);
    display_success(false);

    switch(_state) {
      case 'init':
        $('#create-event-create').text('Create!');
        $('#create-event-successful').hide();
        break;
      case 'init_gmaps':
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('create-event-address'));
        autocomplete.addListener('place_changed', function() {
          gmaps.place_marker($('#create-event-address').val().trim(), 'event-created', 'blue');
          gmaps.clear_all_markers();
        })
      case 'reset':
        reset_all_fields();
        run_validations(false);
        break;
      case 'validating':
        var errors = run_validations();
        if (errors == 0) {
          transition('validated');
        }
        break;
      case 'validated':
        $('#create-event-create').prop('disabled', true)
          .text('Processing...');

        $.ajax({
          method: 'POST',
          url: '/event/create',
          data: get_data()
        }).done(function(res) {
          if (res.status == 'OK') {
            $('#create-event-create').prop('disabled', false)
              .text('Create!')
            $('#create-event-start-time').val('');
            run_validations(false);
            display_success(res.id)
          }
        })

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

$(function() {
  event_creator.attach().transition('init');
})

