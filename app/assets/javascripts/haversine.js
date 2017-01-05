var haversine = (function() {
  function rad(x) {
    return x * Math.PI / 180;
  }

  function get_distance(p1, p2) {
    var r = 6378137; // Earth's radius
    var d_lat = rad(p2.lat - p1.lat);
    var d_lng = rad(p2.lng - p1.lng);

    var a = Math.sin(d_lat / 2) * Math.sin(d_lat / 2)
          + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(d_lng / 2) * Math.sin(d_lng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = r * c;

    return d;
  }

  function get_shortest(point, data) {
    var min_distance = Number.MAX_SAFE_INTEGER;
    var min_point = 0;

    var expand_latlng = function(x) { 
      return {
        lat: x.lat_e6 / 1000000.0, 
        lng: x.lng_e6 / 1000000.0
      } 
    }

    var update_min = function(i, step) {
      var a_lat = point.lat();
      var a_lng = point.lng();
      var b_lat = expand_latlng(step).lat;
      var b_lng = expand_latlng(step).lng;

      console.log('(' + a_lat + ',' + a_lng + ') -> (' + b_lat + ',' + b_lng);
      var distance = get_distance({lat: point.lat(), lng: point.lng()}, 
                                  expand_latlng(step));


      console.log(distance);
      if (distance < min_distance) {
        min_distance = distance;
        min_point = i;
      }
    }

    return new Promise(
      function(resolve, reject) {
        $.each(data, function(i, step) {
          update_min(i, step);
        })

        resolve(min_distance, min_point);
      }
    )
  }

  return {
    get_shortest: get_shortest
  }
})()
