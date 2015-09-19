GPSTools.Format.JSON = (function(GPSTools){
  return {
    isValid: function(string){
      try {
        JSON.parse(string);
      }
      catch (e) {
        return false;
      }
      return true;
    },
    parse: function(string){
      var obj = typeof string == "string" ? JSON.parse(string) : string,
          ts = obj.tracks,
          tracks = [],
          track,
          i = 0,
          l;
      function parseTrack(trackObj){
        var points = [],
            ps,
            i,
            l,
            p;
        if(trackObj.data && trackObj.data.items){
          ps = trackObj.data.items;
          for(i=ps.length-1;i>=0;i--){
            p = ps[i];
            points.push(new GPSTools.Point(p.latitude, p.longitude, 0, p.timestampMs));
          }
        }
        else if(trackObj.points){
          ps = trackObj.points;
          i = 0;
          l = ps.length;
          for(;i<l;i++){
            p = ps[i];
            points.push(new GPSTools.Point(p.lat, p.lon, p.ele, p.time));
          }
        }
        track = new GPSTools.Track(points);
        track.name = trackObj.name || "JSON Imported " + track.getStartTime();
        return track;
      }
      if(ts){
        l = ts.length;
        for(;i<l;i++){
          tracks.push(parseTrack(ts[i]));
        }
        track = new GPSTools.SuperTrack(tracks);
      }
      else
        track = parseTrack(obj);
      return track;
    },
    generate: function(track){
      return JSON.stringify(track);
    }
  }
}(GPSTools));
