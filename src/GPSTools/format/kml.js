GPSTools.Format.KML = function(){
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

      return !!(doc.find('kml').length);
    },
    parse: function (doc) {
      if(typeof doc == "string"){
        doc = $.parseXML(doc);
      }
      // This is not a jQuery object yet.
      if(!doc.find)
        doc = $(doc);

      var lineString = doc.find('LineString'),
          c = lineString.find('coordinates').text().trim(),
          coords = c.split(" "),
          i = 0,
          l = coords.length,
          points = [],
          lle;
          logging(l + " track points");
      for(;i<l;i++) {
        lle = coords[i].split(",");
        if(isNaN(lle[1]) || isNaN(lle[0]))
          console.log("lat: "+lle[1]+" lon: "+lle[1]);
        else
          points.push(new GPSTools.Point(lle[1], lle[0], lle[2]));
      }
      logging(points.length + " points loaded");
      return new GPSTools.Track(points);
    },
    generate: function (track) {
      var doc = $.parseXML($('#kml-tmpl').text()),
          kml = $(doc).find('kml'),
          name = $(doc).find('name').not("author name"),
          points = track.getPoints(),
          l = points.length,
          i = 0,
          p, trkpt, ele,
          hasTime = track.hasTime(),
          hasEle = track.hasElevation(),
          lineString = [],
          coordinates = $(doc).find('coordinates');
      name.text(track.name);
      for(;i<l;i++) {
        p = points[i];
        lineString.push(p.lon+","+p.lat+","+(p.ele||0));
      }
      coordinates.text(lineString.join(" "));
      return (new XMLSerializer()).serializeToString(doc);
    }
  };
}();
