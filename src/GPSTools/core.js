var GPSTools = (function(){
  var parseTrack = function(string) {
        for(fmt in GPSTools.Format){
          if(GPSTools.Format[fmt].isValid(string)){
            return GPSTools.Format[fmt].parse(string);
          }
        }
      },
      trimTrack = function(track){
        var i = 0,
            ps = track.getPoints(),
            l = ps.length,
            p;
        for (;i<l;i++) {
          p = ps[i];
          if(p.lat != 0 || p.lon != 0){
            break;
          }
        };
        if(i != 0){
          ps = ps.splice(0, i);
        }
        if(i != l){
          i = ps.length - 1;
          for(;i>=0;i--){
            p = ps[i];
            if(p.lat != 0 || ps.lon != 0){
              break;
            }
          }
          ps = ps.length = i;
        }
        track.setPoints(ps);
      },
      cropTrack = function(track, start, end){
        var points = track.points.slice(start, end),
            newTrack = new GPSTools.Track(points);
        newTrack.name = (newTrack.hasTime() ? newTrack.getStart().toISOString() : track.name) + " (Cropped)";
        return newTrack;
      },
      areMergeable = function(tracks){
        var mergeable = true;

        tracks.forEach(function(track){
          if(!track.hasTime()){
            mergeable = false;
            return false;
          }
        });

        return mergeable;
      },
      mergeTracks = function(tracks){
        var points = [], track, endTime;

        tracks.sort(function(a,b){
          return a.points[0].time <= b.points[0].time ? -1 : 1;
        });

        tracks.forEach(function(track, i){
          if(i==0){
            endTime = track.getEnd();
          }
          else if(track.getStart() < endTime) {
            alert("Unable to Merge: Tracks Times Overlap")
            throw new Error("Tracks overlap");
          }

          points = points.concat(track.points);

          endTime = track.getEnd();
        });

        track = new GPSTools.Track(points);
        track.name = tracks[0].name + " (Merged "+tracks.length+")";
        return track;
      };

  return {
    areMergeable: areMergeable,
    cropTrack: cropTrack,
    mergeTracks: mergeTracks,
    parseTrack: parseTrack
  };
}());
GPSTools.Format = {};
