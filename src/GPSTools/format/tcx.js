GPSTools.Format.TCX = function(){
  return {
    isValid: function (doc) {
      if(typeof doc == "string"){
        try {
          doc = $.parseXML(doc);
        }
        catch(e) {
          return false;
        }
      }
      // This is not a jQuery object yet.
      if(!doc.find)
        doc = $(doc);

      return !!(doc.find('TrainingCenterDatabase').length);
    },
    parse: function (doc) {
      if(typeof doc == "string"){
        doc = $.parseXML(doc);
      }
      // This is not a jQuery object yet.
      if(!doc.find)
        doc = $(doc);

      var tracks = doc.find('Trackpoint'),
          l = tracks.length,
          points = [];
      logging(l + " track points");
      tracks.each(function(i,item){
          var tp = $(item),
              time = tp.find('Time').text(),
              lat = tp.find('LatitudeDegrees').text(),
              lon = tp.find('LongitudeDegrees').text(),
              ele = tp.find('AltitudeMeters').text() || 0.1;
          if(!lat.length || !lon.length)
            console.log("Bad Point: " + time);
          else
            points.push(new GPSTools.Point(lat, lon, ele, time));
      });
      logging(points.length + " points loaded");
      return new GPSTools.Track(points);
    },
    generate: function (/*track*/) {
      throw Error('Not Implemented.');
    }
  };
}();
