GPSTools.Util = function(){
  return {
    /**
     * @param time Time in seconds
     */
    toRad: function (n){
      return Math.PI*n/180;
    },
    toDeg: function (n){
      return 180*n/Math.PI;
    },
    duration: function (time) {
      var dy,d,h,m,s;

      time = Math.abs(time);

      if(time < 1)
        return (time*1000) + ' milliseconds';

      if(time < 60)
        return Math.floor(time) + ' seconds';

      time /= 60;
      if(time < 60){
        m = Math.floor(time);
        d = time - m;
        s = Math.floor(d * 60);
        return m + ' minutes ' + s + ' seconds';
      }

      time /= 60;
      if(time < 24){
        h = Math.floor(time);
        d = time - h;
        m = Math.floor(d * 60);
        return h + ' hours ' + m + ' minutes';
      }

      time /= 24;
      dy = Math.floor(time);
      d = time - dy;
      h = Math.floor(d * 24);
      return dy + ' days ' + h + ' hours';
    },
    /**
     * @param s Distance in m
     */
    convertToKm: function (s) {
      return s * 0.001;
    },
    /**
     * @param s Distance in m
     */
    convertToMiles: function (s) {
      return s * 0.001 * 0.62137119223733;
    },
    /**
     * @param v Speed in (m s^-1)
     */
    convertToMPH: function(v) {
      return v * 2.2369362920544;
    },
    /**
     * @param v Speed in (m s^-1)
     */
    convertToKPH: function(v) {
      return v * 3.6;
    }
  };
}();
