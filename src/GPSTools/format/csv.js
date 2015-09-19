GPSTools.Format.CSV = (function(GPSTools){
  var lineRegex = /(?:"([^"])",)*"([^"])"/;
  return {
    isValid: function(string){
      return lineRegex.test(string);
    },
    parse: function(string){
      var lines = string.split("\n"),
          values,
          tracks = [],
          track,
          point,
          points = {},
          i,
          l,
          name,
          time,
          lat,
          lon,
          alt,
          // Hard coded for strava db dump
          // n.b. "latiude"
          nameIndex = 0,
          timeIndex = 2,
          latitudeIndex = 3,
          longitudeIndex = 4,
          altitudeIndex = 5;

      for(i = 1, l = lines.length - 1; i < l; i += 1){
        values = lines[i].substr(1,l-2).split("\",\"");
        name = values[nameIndex];
        time = parseInt(values[timeIndex]);
        lat = values[latitudeIndex];
        lon = values[longitudeIndex];
        alt = values[altitudeIndex];
        point = new GPSTools.Point(lat, lon, alt, time);
        if(!points[name])
          points[name] = [];
        points[name].push(point);
      }

      for(name in points){
        track = new GPSTools.Track(points[name], name);
        tracks.push(track);
      }

      if(tracks.length > 1)
        track = new GPSTools.SuperTrack(tracks);

      return track;
    },
    generate: function(track){
      return JSON.stringify(track);
    }
  }
}(GPSTools));
