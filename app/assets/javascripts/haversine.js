function rad(x) {
  return x * Math.PI / 180;
}

function get_distance(p1, p2) {
  var r = 6378137; // Earth's radius
  var d_lat = rad(p2.lat() - p1.lat());
  var d_lng = rad(p2.lng() - p1.lng());

  var a = Math.sin(d_lat / 2) * Math.sin(d_lat / 2)
        + Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(d_lng / 2) * Math.sin(d_lng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = r * c;

  return d;
}