GPSTools.Format.GPX = function(){
  return {
      mimeType: "application/gpx+xml",
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

        return !!(doc.find('gpx').length);
      },
      parse: function (doc) {
          if(typeof doc == "string"){
            doc = $.parseXML(doc);
          }
          // This is not a jQuery object yet.
          if(!doc.find)
            doc = $(doc);

          var points = [],
              pts;
          if(doc.find('trk').length) {
            logging("GPX file with Track");
            pts = doc.find('trkpt');
            logging(pts.length + " track points");
            pts.each(function(i) {
              var item = $(this),
                  lat = item.attr('lat'),
                  lon = item.attr('lon'),
                  ele = parseFloat(item.find('ele').text()),
                  time = item.find('time').text();
              if(isNaN(lat) || isNaN(lon))
                console.log("lat: "+lat+" lon: "+lon);
              else
                points.push(new GPSTools.Point(lat,lon,ele,time));
            });
            logging("Loaded " + points.length);
            return new GPSTools.Track(points);
          }
          else if(doc.find('rte').length) {
            logging("GPX file with Route");
            pts = doc.find('rtept');
            logging(pts.length + " route points");
            pts.each(function(i) {
              var item = $(this),
                  lat = item.attr('lat'),
                  lon = item.attr('lon'),
                  ele = parseFloat(item.find('ele').text()),
                  time = item.find('time').text();
              points.push(new GPSTools.Point(lat,lon,ele,time));
            });
            logging("Loaded " + points.length);
            return new GPSTools.Track(points);
          }
          else if(doc.find('wpt').length) {
            logging("GPX file with Waypoints");
          }
      },
    generate: function (track) {
      var doc = $.parseXML($('#gpx-tmpl').text()),
          gpx = $(doc).find('gpx'),
          metadata = gpx.find('metadata'),
          time = $('<time>', doc),
          trk = $('<trk>', doc),
          points = track.getPoints(),
          l = points.length,
          i = 0,
          p, trkpt, ele,
          hasTime = track.hasTime(),
          hasEle = track.hasElevation();
      time.text((new Date()).toISOString());
      metadata.append(time);
      for(;i<l;i++) {
        p = points[i];
        trkpt = $('<trkpt>', doc);
        trkpt.attr({'lat': p.lat, 'lon': p.lon});
        if(hasEle) {
          ele = $('<ele>', doc);
          ele.text(p.ele);
          trkpt.append(ele);
        }
        if(hasTime) {
          time = $('<time>', doc);
          time.text(p.getDate().toISOString());
          trkpt.append(time);
        }
        trk.append(trkpt);
      }
      gpx.append(trk);
      return (new XMLSerializer()).serializeToString(doc);
    }
  };
}();
