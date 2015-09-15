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
    generate: function (track) {}
  };
}();
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
GPSTools.Track = function (points, name) {
  this.points = points || [];
  this.name = name || "Track";
  var events = this.events = $({}),
      suspendChangeEvent = false,
      that = this;
  events.on('changename', function(){
    if(!suspendChangeEvent)
      events.trigger('change');
  });
  events.on('changepoints', function(){

    that.distance = 0;
    that.elevation = 0;
    that.gradient = 0;

    var sce = suspendChangeEvent;
    suspendChangeEvent = true;
    events.trigger('changetime');
    suspendChangeEvent = sce;

    if(!suspendChangeEvent)
      events.trigger('change');
  });
  events.on('changetime', function(){

    that.start = null;
    that.end = null;
    that.speed = 0;
    that.avgSpeed = 0;
    that.maxSpeed = 0;
    that.duration = 0;

    if(!suspendChangeEvent)
      events.trigger('changepoints');
  });
};
GPSTools.Track.prototype.setName = function(name) {
  this.name = name.replace(/_/g, " ").replace(/\.[a-z]{3,4}$/,"");
  this.events.trigger('changename');
}
GPSTools.Track.prototype.hasTime = function (){
  var p = this.points;
  return !!(p && p[0] && p[0].time && p[p.length - 1].time && (p[0].time != p[p.length - 1].time));
};
GPSTools.Track.prototype.hasElevation = function (){
  var p = this.points;
  return !!(p && (p[0] && p[0].ele || p[1] && p[1].ele));
};
GPSTools.Track.prototype.getPoints = function (){
  return this.points;
};
GPSTools.Track.prototype.setPoints = function (points){
  this.points = points;
  this.start = null;
  this.end = null;
  this.duration = null;
  this.distance = null;
  this.elevation = null;
  this.speed = null;
  this.gradient = null;
  this.avgSpeed = null;
  this.maxSpeed = null;
};
// Deprecated
// Use Track.getStartTime
GPSTools.Track.prototype.getStart = function (){
  var p = this.points;
  if(!this.start){
    if(p && p[0] && p[0].time)
      this.start = new Date(p[0].time);
  }
  return this.start;
};
// API Method Track.getStart should be this
GPSTools.Track.prototype.getStartTime = function (){
  var p = this.points;
  return p && p[0] && p[0].time && new Date(p[0].time);
}
GPSTools.Track.prototype.getStartPoint = function (){
  var p = this.points;
  return p && p[0];
}
// Deprecated
// Use Track.getEndTime
GPSTools.Track.prototype.getEnd = function (){
  var p = this.points,
      l = p.length - 1;
  if(!this.end){
    if(p && p[l] && p[l].time)
      this.end = new Date(p[l].time);
  }
  return this.end;
};
// API Method Track.getEnd should be this
GPSTools.Track.prototype.getEndTime = function (){
  return this.getEnd();
}
GPSTools.Track.prototype.getEndPoint = function (){
  var p = this.points,
      l = p.length - 1;
  return p && p[l];
};
/**
 * @return Duration in s
 */
GPSTools.Track.prototype.getDuration = function (){
  if(!this.duration){
    this.duration = 0;
    if(this.hasTime())
      this.duration = (this.getEnd() - this.getStart()) / 1000;
  }
  return this.duration;
};
GPSTools.Track.prototype.getDistance = function (){
  if(!this.distance) {
    var dist  = 0,
        i = 1,
        l = this.points.length,
        p1, p2;
    //logging("Calculating Distance");
    for(;i<l;i++){
      p1 = this.points[i-1];
      p2 = this.points[i];
      dist += p1.distanceTo(p2);
    }
    //logging("Calculation finished");
    this.distance = dist;
  }
  return this.distance;
};
GPSTools.Track.prototype.getElevation = function (){
  if(!this.elevation) {
    var ele = [],
        i = 0,
        l = this.points.length;
    logging("Collating elevation data");
    for(;i<l;i++)
      ele.push(this.points[i].ele);
    this.elevation = ele;
  }
  return this.elevation;
};
GPSTools.Track.prototype.getHeightGain = function (){
  var sum = 0,
      i = 1,
      l = this.points.length, p, p1;
  //logging("Summing elevation data");
  for(;i<l;i++) {
    p = this.points[i];
    p1 = this.points[i-1];
    if(p.ele > p1.ele)
      sum += (p.ele - p1.ele);
  }
  return sum;
};
GPSTools.Track.prototype.getGradient = function (){
  if(!this.gradient) {
    if(!this.hasElevation())
        throw "No Elevation data asccociated with this track";
    var grd = [],
        l = this.points.length,
        p1, p2, dp,
        e1, e2, de,
        avg = [], c = 10,
        f = function(a,b){return a+b};
    logging("Collating gradient data");
    for(i=c;i<l;i++){
      p1 = this.points[i-c];
      p2 = this.points[i];
      dp = p1.distanceTo(p2) * 0.001; // km = m * 0.001
      e1 = p1.ele;
      e2 = p2.ele;
      de = e2 - e1; // m
      avg[i%c] = de / dp / 10; // %
      if(i>=c)
        grd[i-1] = (avg.reduce(f)/c);
    }
    // fudge
    for(i=0;i<c-1;i++){
      grd[i] = grd[c-1];
    }
    this.gradient = grd;
  }
  return this.gradient;
};
GPSTools.Track.prototype.getGradientHistogram = function() {
  var grad = this.getGradient(),
      hist = {},
      val,
      i;
  for (i = grad.length - 1; i >= 0; i--) {
    val = grad[i].toFixed(1);
    if(!hist[val])
      hist[val] = 0
    hist[val]++;
  };
  return hist;
};
GPSTools.Track.prototype.getSpeed = function (){
  if(!this.speed) {
    if (!this.hasTime())
      throw "No time data asccociated with this track";
    var spd = [],
        i = 8,
        l = this.points.length;
    logging("Collating speed data");
    for(;i<l;i++)
      spd.push(this.points[i].speedTo(this.points[i-8]));
    this.speed = spd;
  }
  return this.speed;
};
/**
 * @return Average speed in (m s^-1)
 */
GPSTools.Track.prototype.getAvgSpeed = function () {
  if(!this.avgSpeed) {
    this.avgSpeed = this.getDistance() / this.getDuration() * 1000;
  }
  return this.avgSpeed;
};
/**
 * @return Maximum speed in (m s^-1)
 */
GPSTools.Track.prototype.getMaxSpeed = function () {
  if(!this.maxSpeed) {
    var max = 0,
        i = 1,
        l = this.points.length;
    for(;i<l;i++)
      max = Math.max(this.points[i].speedTo(this.points[i-1]),max);
    this.maxSpeed = max;
  }
  return this.maxSpeed;
};
// This could be better implemented without corrupting the state of the main map
// but currently it is expected to only be called at times when the main map
// will be in a state of transition e.g.
GPSTools.Track.prototype.getThumb = function(size) {
  GPSTools.Map.clearLine();
  GPSTools.Map.drawLine(this.points, {opacity:1,width:10});
  var thumb = GPSTools.Map.getLineThumb(size);
  GPSTools.Map.clearLine();
  return thumb;
};
GPSTools.Track.prototype.setTime = function(start, end) {
  var distance = this.getDistance(),
      duration = (+end - start) / 1000, // s
      //speed = distance / duration * 1000, // m s^-1,
      points = this.points,
      i = 1,
      l = points.length,
      cuml_dist = 0,
      time, date,
      grad, histSum, hist, histAvg;
  if(this.hasElevation()){
    grad = this.getGradient();
    histSum = 0;
    hist = this.getGradientHistogram();
    for(key in hist){
      histSum += key * hist[key];
    }
    histAvg = histSum / (distance * 10);
  }
  this.points[0].time = start.toISOString();
  for(;i<l;i++){
    cuml_dist += points[i-1].distanceTo(points[i]); // m
    time = cuml_dist / distance * duration + (histAvg ? (grad[i-1] - histAvg)*0.5 : 0); // s
    date = new Date(+start + time*1000); // ms = s * 1000
    this.points[i].time = date.toISOString();
  }
  this.events.trigger('changetime');
};
GPSTools.Track.prototype.setStartTime = function(start) {
  var end = this.getEndTime();
  if(end)
    this.setTime(start, end);
  else{
    this.points[0].time = start.toISOString();
    this.events.trigger('changetime');
  }
};
GPSTools.Track.prototype.setEndTime = function(end) {
  var start = this.getStartTime();
  if(start)
    this.setTime(start, end);
  else {
    this.points[this.points.length-1].time = end.toISOString();
    this.events.trigger('changetime');
  }
};
/**
 * Get the point immediately before a certain point in time
 * @param time Date object or integer milliseconds since epoch
 */
GPSTools.Track.prototype.getPrecedingPointIndex = function(time) {
  if(time < this.getStartTime())
    throw new Error("Time was before track start");

  if(time > this.getEndTime())
    throw new Error("Time was after track ended");

  // Binary search!
  var low = 0,
      high = this.points.length,
      index = Math.floor(high/2),
      currPoint = this.points[index],
      prevIndex,
      isDateObj = (typeof time == "object"),
      compare;

  while(currPoint){
    // Optimise for fewer Date objects if we're only dealing with integers
    compare = isDateObj ? currPoint.getDate() : currPoint.getDate().getTime();
    if(time > compare){
      low = index;
    }
    else {
      high = index;
    }
    index = Math.floor((low+high)/2);
    currPoint = this.points[index];
    if(prevIndex == index){
      return index;
    }
    prevIndex = index;
  }
}
GPSTools.Track.prototype.getInstantPosition = function(time) {
  var i1 = this.getPrecedingPointIndex(time),
      // i0 = i1-1,
      i2 = i1+1,
      // i3 = i1+2,
      // p0 = this.points[i0],
      p1 = this.points[i1],
      p2 = this.points[i2],
      // p3 = this.points[i3],
      // v01 = (p0 && p0.speedTo(p1)) || 0,
      // v12 = p1.speedTo(p2),
      // v23 = p2.speedTo(p3),
      t1 = p1.getTime(),
      // t0 = (p0 && p0.getTime()) ||  t1-1,
      t2 = p2.getTime(),
      // t3 = p3.getTime(),
      // t01 = (t0 + t1)/2,
      // t12 = (t1 + t2)/2,
      // t23 = (t2 + t3)/2,
      t = time.getTime(),
      a = (t - t1)/(t2 - t1);
      //  = (t - t12)/(t23 - t12);
  // if(t < t12){
    return {
      lat: p1.lat + a * (p2.lat - p1.lat),
      lon: p1.lon + a * (p2.lon - p1.lon)
    }
  // }
  // return v12 + b * (v23 - v12);
}
GPSTools.Track.prototype.getInstantSpeed = function(time) {
  var l = this.points.length,
      i1 = this.getPrecedingPointIndex(time),
      i0 = i1-1,
      i2 = i1+1,
      i3 = Math.min(i1+2,l-1),
      p0 = this.points[i0],
      p1 = this.points[i1],
      p2 = this.points[i2],
      p3 = this.points[i3],
      v01 = (p0 && p0.speedTo(p1)) || 0,
      v12 = p1.speedTo(p2),
      v23 = p2.speedTo(p3),
      t1 = p1.getTime(),
      t0 = (p0 && p0.getTime()) ||  t1-1,
      t2 = p2.getTime(),
      t3 = p3.getTime(),
      t01 = (t0 + t1)/2,
      t12 = (t1 + t2)/2,
      t23 = (t2 + t3)/2,
      t = time.getTime(),
      a = (t - t01)/(t12 - t01),
      b = (t - t12)/(t23 - t12);
  if(t < t12){
    return v01 + a * (v12 - v01);
  }
  return v12 + b * (v23 - v12);
}
GPSTools.Track.prototype.getInstantAltitude = function(time) {
  var i0 = this.getPrecedingPointIndex(time),
      p0 = this.points[i0],
      p1 = this.points[i0+1],
      t0 = p0.getTime(),
      t1 = p1.getTime(),
      a = (time.getTime() - t0)/(t1-t0),
      e0 = p0.ele,
      e1 = p1.ele;
  if(a < 0 || a > 1)
    console.log(t0 + "[" + time + "]" + t1);
  return e0 + a * (e1 - e0);
}
GPSTools.Track.prototype.getInstantDistance = function(time) {
  var i0 = this.getPrecedingPointIndex(time);
  //return this.points[i0].speedTo(this.points[i0+1]);
}
GPSTools.Track.prototype.getInstantHeading = function(time) {
  var i1 = this.getPrecedingPointIndex(time),
      i0 = i1-1,
      i2 = i1+1,
      i3 = i2+2,
      p0 = this.points[i0],
      p1 = this.points[i1],
      p2 = this.points[i2],
      p3 = this.points[i3],
      b01 = (p0 && p0.bearingTo(p1)) || 0,
      b12 = p1.bearingTo(p2),
      b23 = p2.bearingTo(p3),
      t1 = p1.getTime(),
      t0 = (p0 && p0.getTime()) ||  t1-1,
      t2 = p2.getTime(),
      t3 = p3.getTime(),
      t01 = (t0 + t1)/2,
      t12 = (t1 + t2)/2,
      t23 = (t2 + t3)/2,
      t = time.getTime(),
      a = (t - t01)/(t12 - t01),
      b = (t - t12)/(t23 - t12);
  if(t < t12){
    return b01 + a * (b12 - b01);
  }
  return b12 + b * (b23 - b12);
}
GPSTools.SuperTrack = function(tracks){
  this.name = "Super Track";
  this.tracks = (tracks instanceof Array) ? tracks : [];
  var that = this;
  // TODO: sortTracks
  this.events.on('addsubtrack', function(){
    that.events.trigger('changesubtracks');
  });
  this.events.on('removesubtrack', function(){
    that.events.trigger('changesubtracks');
  });
  this.events.on('changesubtracks', function(e){
    that.distance = 0;
    that.duration = 0;
    if(!e.originalEvent || e.originalEvent.type == "changelocation")
      that.thumb = null;
    that.events.trigger('change');
  });
}
GPSTools.SuperTrack.prototype = (new GPSTools.Track());
GPSTools.SuperTrack.prototype.getPoints = function(){
  var points = [],
      i = 0,
      t = this.tracks,
      l = t.length;
  for(;i<l;i++){
    points = points.concat(t[i].getPoints());
  }
  return points;
}
GPSTools.SuperTrack.prototype.addTrack = function(track){
  if(track instanceof GPSTools.Track){
    this.tracks.push(track);
    this.distance = this.duration = 0;
    var ev = this.events,
        event;
    if(!this.subTrackRingback){
      this.subTrackRingback = function(e){
        var event = $.Event('changesubtracks');
        event.originalEvent = e;
        ev.trigger(event);
      }
    }
    track.events.on('change changepoints', this.subTrackRingback);
    event = $.Event('addsubtrack');
    event.newTrack = track;
    ev.trigger(event);
  }
  else
    console.error("Tried to add a non track: "+track);
}
GPSTools.SuperTrack.prototype.removeTrack = function(track){
  var i = 0,
      l = this.tracks.length,
      ev = this.events,
      event;
  for(;i<l;i++){
    if(this.tracks[i] == track){
      this.tracks.splice(i,1);
      track.events.off('change', this.subTrackRingback);
      event = $.Event('removesubtrack');
      event.oldTrack = track;
      ev.trigger(event);
      break;
    }
  }
  this.distance = this.duration = 0;
}
GPSTools.SuperTrack.prototype.hasTime = function (){
  var i = 0,
      l = this.tracks.length;
  for(;i<l;i++){
    if(this.tracks[i].hasTime())
      return true;
    return false;
  }
};
GPSTools.SuperTrack.prototype.hasElevation = function (){
  var i = 0,
      l = this.tracks.length;
  for(;i<l;i++){
    if(this.tracks[i].hasElevation())
      return true;
    return false;
  }};
GPSTools.SuperTrack.prototype.getStart = function (){
  if(this.tracks.length){
    return this.tracks[0].getStart();
  }
};
GPSTools.SuperTrack.prototype.getEnd = function (){
  var l = this.tracks.length;
  if(l){
    return this.tracks[l-1].getEnd();
  }};
GPSTools.SuperTrack.prototype.getDuration = function (){
  if(!this.duration){
      this.duration = 0;
      var i = 0,
        l = this.tracks.length;
    for(;i<l;i++){
      this.duration += this.tracks[i].getDuration();
    }
  }
  return this.duration;
};
GPSTools.SuperTrack.prototype.getDistance = function (){
  if(!this.distance){
    this.distance = 0;
    var i = 0,
        l = this.tracks.length;
    for(;i<l;i++){
      this.distance += this.tracks[i].getDistance();
    }
  }
  return this.distance;
}
GPSTools.SuperTrack.prototype.getElevation = function (){};
GPSTools.SuperTrack.prototype.getHeightGain = function (){};
GPSTools.SuperTrack.prototype.getGradient = function (){};
GPSTools.SuperTrack.prototype.getGradientHistogram = function() {};
GPSTools.SuperTrack.prototype.getSpeed = function (){};
GPSTools.SuperTrack.prototype.getAvgSpeed = function () {};
GPSTools.SuperTrack.prototype.getMaxSpeed = function () {};
GPSTools.SuperTrack.prototype.getThumb = function(size) {
  if(!this.thumb){
    GPSTools.Map.clearLine();
    var i = 0,
        l = this.tracks.length;
    for(;i<l;i++){
      GPSTools.Map.drawLine(this.tracks[i].points, {opacity:1,width:10});
    }
    if(l)
      GPSTools.Map.zoomToExtent();
    this.thumb = GPSTools.Map.getLineThumb(size);
    GPSTools.Map.clearLine();
  }
  return this.thumb;
};
/**
 * Set the split time of a track boundary.
 *
 * @param index int The index of the split point to set e.g.
 * 0: Start of first track
 * 1: End of first track and start of second
 * ...
 * n: End of nth track, start of (n+1)th track
 */
GPSTools.SuperTrack.prototype.setSplitTime = function(index, time) {
  var tracks = this.tracks;
  if(index >= 0 && index < tracks.length) {
    tracks[index].setStartTime(time);
  }
  if(index > 0 && index <= tracks.length) {
    tracks[index-1].setEndTime(time);
  }
};
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
 * @return Distance in m
 */
GPSTools.Point.prototype.distanceTo = function(){
  var R = 6371000, // m
      toRad = function(n) {
        return n * Math.PI / 180;
      },
      toDeg = function(n) {
        return n * 180 / Math.PI;
      };
  return function(point) {
    if(!point){
      console.log(point);
      return 0;
    }
    var dLat = toRad(point.lat-this.lat),
        dLon = toRad(point.lon-this.lon),
        lat1 = toRad(this.lat),
        lat2 = toRad(point.lat),

        a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
        d = R * c;
    return d;
  };
}();
/**
 * @return Speed in (m s^-1)
 */
GPSTools.Point.prototype.speedTo = function(point) {
  var s = this.distanceTo(point) * 1000,
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
        lon1 = toRad(this.lon),
        lon2 = toRad(point.lon),
        y = Math.sin(dLon) * Math.cos(lat2),
        x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return toDeg(Math.atan2(y, x));
  }
}());
GPSTools.Graph = (function(){
  var gutterWidth = 35,
      mark,
      selectionStart,
      selectionEnd,
      drawGraph = function(id, data, options){
        options = $.extend({
          color: 'black',
          filled: false
        }, options);

        $('#'+id).show();
        var graph;
        if(options.type == "bar")
          graph = new RGraph.Bar(id, data);
        else
          graph = new RGraph.Line(id, data);

        if(options.overlay){
          graph.Set('chart.yaxispos', 'right');
          graph.Set('chart.background.grid.color', 'rgba(0,0,0,0)');
        }
        else {
          graph.Set('chart.background.barcolor1', 'white');
          graph.Set('chart.background.barcolor2', 'white');
          graph.Set('chart.background.grid.color', 'rgba(238,238,238,1)');
        }
        graph.Set('chart.colors', [options.color]);
        graph.Set('chart.linewidth', 1);
        graph.Set('chart.filled', options.filled);
        graph.Set('chart.hmargin', 1);
        graph.Set('chart.gutter.left', gutterWidth);
        graph.Set('chart.gutter.right', gutterWidth);
        graph.Set('chart.gutter.top', gutterWidth);
        graph.Set('chart.gutter.bottom', gutterWidth);
        if(options.negative)
          graph.Set('chart.xaxispos', 'center');
        if(options.labels)
          graph.Set('chart.labels', options.labels);
        graph.Draw();
        RGraph.ObjectRegistry.Clear();
      };

  return {
    drawLine: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'line';
      drawGraph(id, data, color);
    },
    drawFilled: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'line';
      color.filled = true;
      drawGraph(id, data, color);
    },
    drawBar: function(id, data, color){
      if(typeof color != "object")
        color = {color: color};
      color.type = 'bar';
      color.filled = true;
      drawGraph(id, data, color);
    },
    clear: function(id){
      RGraph.Clear($('#'+id)[0]);
    },
    getPosition: function(id,x,y){
      var canvas = $('#'+id)[0],
          width = canvas.width,
          fracX = (x - gutterWidth) / (width - gutterWidth * 2);
      return fracX;
    },
    drawAnnotations: function(id){
      var canvas = $('#'+id)[0],
          ctx = canvas.getContext('2d'),
          height = canvas.height;

      if(mark){
        ctx.strokeWidth = "2";
        ctx.strokeStyle = "#ff0000";
        ctx.beginPath();
        ctx.moveTo(mark, gutterWidth);
        ctx.lineTo(mark, height - gutterWidth);
        ctx.stroke();
      }

      if(selectionStart){
        ctx.fillStyle = "rgba(255,42,42,0.6)";
        ctx.fillRect(selectionStart,gutterWidth,selectionEnd-selectionStart,height-gutterWidth*2);
      }
    },
    mark: function(id,x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        mark = x;
      }
      return pos;
    },
    startSelection: function(id, x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        selectionStart = x;
      }
    },
    endSelection: function(id, x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        selectionEnd = x;
      }
    },
    clearSelection: function(id){
      selectionStart = selectionEnd = 0;
    },
    getSelectionStart: function(id){
      return GPSTools.Graph.getPosition(id,selectionStart);
    },
    setSelectionStart: function(id,fraction){
      var canvas = $('#'+id)[0],
          width = canvas.width;
      selectionStart = fraction * (width - gutterWidth * 2) + gutterWidth;
    },
    getSelectionEnd: function(id){
      return GPSTools.Graph.getPosition(id,selectionEnd);
    },
    setSelectionEnd: function(id,fraction){
      var canvas = $('#'+id)[0],
          width = canvas.width;
      selectionEnd = fraction * (width - gutterWidth * 2) + gutterWidth;
    }
  }
}());
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
