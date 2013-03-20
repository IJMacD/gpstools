var GPSTools = (function(){
  var cropTrack = function(track, start, end){
        var points = track.points.slice(start, end),
            newTrack = new GPSTools.Track(points);
        newTrack.name = track.name + " (Cropped)";
        return newTrack;
      },
      areMergeable = function(tracks){
        return tracks.length == 2;
      },
      mergeTracks = function(tracks){
        var points, track, name;
        if(tracks[0].points[0].time <
          tracks[1].points[0].time){
          points = tracks[0].points.concat(tracks[1].points);
          name = tracks[0].name;
        }
        else{
          points = tracks[1].points.concat(tracks[0].points);
          name = tracks[1].name;
        }
        track = new GPSTools.Track(points);
        track.name = name + " (Merged)";
        return track;
      };

  return {
    areMergeable: areMergeable,
    cropTrack: cropTrack,
    mergeTracks: mergeTracks
  };
}());
GPSTools.Format = {};
GPSTools.Format.GPX = function(){
  return {
      mimeType: "application/gpx+xml",
      isValid: function (doc) {
        // This is not a jQuery object yet.
        if(!doc.find)
          doc = $(doc);

        return !!(doc.find('gpx').length);
      },
      parse: function (doc) {
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
          points = track.points,
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
          time.text(p.time);
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
      // This is not a jQuery object yet.
      if(!doc.find)
        doc = $(doc);

      return !!(doc.find('kml').length);
    },
    parse: function (doc) {
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
    generate: function (track) {}
  };
}();
GPSTools.Format.TCX = function(){
  return {
    isValid: function (doc) {
      // This is not a jQuery object yet.
      if(!doc.find)
        doc = $(doc);

      return !!(doc.find('TrainingCenterDatabase').length);
    },
    parse: function (doc) {
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
GPSTools.Track = function (points) {
  this.points = points;
};
GPSTools.Track.prototype.hasTime = function (){
  return !!(this.points && this.points[0] && this.points[0].time);
};
GPSTools.Track.prototype.hasElevation = function (){
  return !!(this.points && (this.points[0] && this.points[0].ele || this.points[1] && this.points[1].ele));
};
GPSTools.Track.prototype.getStart = function (){
  if(!this.start){
    if(this.points && this.points[0])
      this.start = new Date(this.points[0].time);
  }
  return this.start;
};
GPSTools.Track.prototype.getEnd = function (){
  if(!this.end){
    if(this.points && this.points[this.points.length-1])
      this.end = new Date(this.points[this.points.length-1].time);
  }
  return this.end;
};
/**
 * @return Duration in s
 */
GPSTools.Track.prototype.getDuration = function (){
  if(!this.duration)
    this.duration = (this.getEnd() - this.getStart()) / 1000;
  return this.duration;
};
GPSTools.Track.prototype.getDistance = function (){
  if(!this.distance) {
    var dist  = 0,
        i = 1,
        l = this.points.length;
    logging("Calculating Distance");
    for(;i<l;i++){
      var p1 = this.points[i-1],
          p2 = this.points[i];
      dist += p1.distanceTo(p2);
    }
    logging("Calculation finished");
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
      dp = p1.distanceTo(p2); // km
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
      val;
  for (var i = grad.length - 1; i >= 0; i--) {
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
GPSTools.Point = function (lat,lon,ele,time) {
  this.lat = parseFloat(lat);
  this.lon = parseFloat(lon);
  this.ele = parseFloat(ele);
  this.time = time;
};
/**
 * @return Distance in km
 */
GPSTools.Point.prototype.distanceTo = function(){
  var R = 6371, // km
      toRad = function(n) {
        return n * Math.PI / 180;
      },
      toDeg = function(n) {
        return n * 180 / Math.PI;
      };
  return function(point) {
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
GPSTools.Map = function (){
  var map,
      osmLayer,
      cycleLayer,
      lineLayer,
      bounds,
      marker, markers,
      lineHighlight;
  return {
    create: function () {
      map = new OpenLayers.Map("mapCanvas", {'controls': [
          new OpenLayers.Control.Navigation(),
          new OpenLayers.Control.Zoom(),
          new OpenLayers.Control.LayerSwitcher()
      ]});
      osmLayer = new OpenLayers.Layer.OSM( "Simple OSM Map");
      cycleLayer = new OpenLayers.Layer.OSM("OpenCycleMap",
        ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]);
      lineLayer = new OpenLayers.Layer.Vector("Line Layer");
      map.addLayer(osmLayer);
      map.addLayer(cycleLayer);
      map.addLayer(lineLayer);
    },
    clearLine: function(highlight) {
      if(!map){
        $('#map').show();
        GPSTools.Map.create();
      }
      if(highlight){
        lineLayer.removeFeatures([lineHighlight]);
        map.zoomToExtent(bounds);
      }else
        lineLayer.removeAllFeatures();
    },
    drawLine: function (points, highlight) {
      if(!map){
        $('#map').show();
        GPSTools.Map.create();
      }
      var olPoints = [],
          i,
          olLine,
          olBounds,
          olStyle,
          olFeature;
      logging("Drawing line" + (highlight ? " (highlight)" : ""));
      for(i=0;i<points.length;i++){
        if(isNaN(points[i].lon))
          console.log("Bad Point: " + points[i].time);
        else
          olPoints.push(new OpenLayers.Geometry.Point(points[i].lon,points[i].lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()));
      }
      olLine = new OpenLayers.Geometry.LineString(olPoints);
      logging("Conversion of points finished");
      olBounds = olLine.getBounds();
      olStyle = {
        strokeColor: highlight ? '#ff0000': '#0000ff',
        strokeOpacity: 0.5,
        strokeWidth: 5
      };
      // I tried to reuse Vector Feature!
      // I did I promise, it just displayed buggily
      olFeature = new OpenLayers.Feature.Vector(olLine, null, olStyle);

      if(highlight){
        if(lineHighlight)
          lineLayer.removeFeatures([lineHighlight]);
        lineHighlight = olFeature;
      }
      else{
        bounds = olBounds;
      }

      lineLayer.addFeatures([olFeature]);

      map.zoomToExtent(olBounds);
    },
    mark: function(point){
      var lonlat = new OpenLayers.LonLat(point.lon,point.lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
      if(!marker){
        markers = new OpenLayers.Layer.Markers();
        map.addLayer(markers);
        var size = new OpenLayers.Size(21,25),
            offset = new OpenLayers.Pixel(-(size.w/2), -size.h),
            icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        marker = new OpenLayers.Marker(lonlat,icon);
        markers.addMarker(marker);
      }else {
        marker.lonlat = lonlat;
        marker.display(true);
        markers.redraw();
      }
    },
    unmark: function(){
      if(marker){
        marker.display(false);
        markers.redraw();
      }
    }
  };
}();
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
          height = canvas.height,
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
        selectionEnd = x;
      }
    },
    endSelection: function(id, x){
      var pos = GPSTools.Graph.getPosition(id,x,0);
      if(pos > 0 && pos < 1){
        if(x < selectionStart){
          selectionStart = x;
        }
        else{
          selectionEnd = x;
        }
      }
    },
    clearSelection: function(id){
      selectionStart = selectionEnd = 0;
    },
    getSelectionStart: function(id){
      return GPSTools.Graph.getPosition(id,selectionStart);
    },
    getSelectionEnd: function(id){
      return GPSTools.Graph.getPosition(id,selectionEnd);
    }
  }
}());
GPSTools.Util = function(){
  return {
    /**
     * @param time Time in seconds
     */
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
     * @param s Distance in km
     */
    convertToMiles: function (s) {
      return s * 0.62137119223733;
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
