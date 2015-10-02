GPSTools.Point = function (lat,lon,ele,time) {
  this.lat = parseFloat(lat);
  this.lon = parseFloat(lon);
  this.ele = parseFloat(ele);
  this.time = time;
};
GPSTools.Point.prototype.getDate = function(){
  if(!this.date){
    this.date = new Date(this.time);
  }
  return this.date;
}
GPSTools.Point.prototype.getTime = function(){
  return this.getDate().getTime();
}
/**
 * Compute distance between two points
 * @static
 * @return Distance in m
 */
GPSTools.Point.distance = (function(){
  var R = 6371000, // m
      toRad = function(n) {
        return n * Math.PI / 180;
      };
  return function(p1, p2) {
    var dLat = toRad(p2.lat-p1.lat),
        dLon = toRad(p2.lon-p1.lon),
        lat1 = toRad(p1.lat),
        lat2 = toRad(p2.lat),

        a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
        d = R * c;
    return d;
  };
}());
/**
 * @return Distance in m
 */
GPSTools.Point.prototype.distanceTo = function(point) {
  return GPSTools.Point.distance(this, point)
}
/**
 * Get time difference between two points
 * @static
 * @return Time difference in seconds
 */
GPSTools.Point.duration = function (p1, p2) {
  return (new Date(p2.time) - new Date(p1.time)) / 1000
}
/**
 * @return Speed in (m s^-1)
 */
GPSTools.Point.prototype.speedTo = function(point) {
  var s = this.distanceTo(point),
      t = Math.abs(new Date(this.time) - new Date(point.time)) / 1000;
  return s / t;
};
GPSTools.Point.prototype.bearingTo = (function() {
  var toRad = function(n) {
        return n * Math.PI / 180;
      },
      toDeg = function(n) {
        return n * 180 / Math.PI;
      };
  return function(point){
    var dLon = toRad(point.lon - this.lon),
        lat1 = toRad(this.lat),
        lat2 = toRad(point.lat),
        y = Math.sin(dLon) * Math.cos(lat2),
        x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return toDeg(Math.atan2(y, x));
  }
}());
