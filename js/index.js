(function(GPSTools, $){
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    if(files.length > 0) {
      var f = files[0];
      logging("File selected");
      logging("Filename: \"" + f.name + "\"");
      logging("Size (bytes): " + f.size);
      if(f.size > 1024*1024)
        logging("Size is quite large, may be rejected");
      if(f.type) {
        logging("Type: " + f.type);
        // We can check a few types that it is definetly not going to be
        if( /^(image|audio|video)\//.test(f.type) ) {
          logging("Stopping for invalid type");
          return;
        }
      }
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var doc = $($.parseXML( e.target.result )),
              track;
          if(GPSTools.Format.GPX.isValid(doc)) {
            logging("Found GPX file!");
            track = GPSTools.Format.GPX.parse(doc);
          }
          else if(GPSTools.Format.KML.isValid(doc)) {
            logging("Found KML file!");
            track = GPSTools.Format.KML.parse(doc);
          }
          else {
            logging("Unrecognised file type");
            return;
          }

          $('<option>')
            .attr('selected', '')
            .text(f.name)
            .data('track', track)
            .appendTo('select');

          displayTrack(track);
        };
      })(f);

      // Read in the file as text.
      reader.readAsText(f);

    }
  }

  function displayTrack(track){

    GPSTools.Map.clearLine();
    GPSTools.Map.drawLine(track.points);

    if(track.hasElevation()) {
      logging("Track has elevation data");
      $('#get-ele-btn').hide();
      plotElevation(track);
      plotGradient(track);
    }
    else {
      logging("Track does not have elevation data");
      $('#get-ele-btn').removeAttr('disabled').show();
      $('#graph, #gradient').hide();
    }

    if(track.hasTime())
    {
      showStats(track);
      $('#gen-spd-btn').hide();
      plotSpeed(track);
    }
    else{
      $('output').text('Distance (km): ' + track.getDistance());
      $('#gen-spd-btn').removeAttr('disabled').show();
    }

    $('#gen-spd-btn').off('click').click(function(){
      $(this).attr('disabled','');
      var speed = 10, // m s^-1,
          distance = track.getDistance(), // km
          duration = (distance / speed) * 1000, // s
          end = new Date(),
          start = new Date(end - duration*1000),
          modal = $('#speedModal'),
          start_txt = modal.find('#start_txt'),
          end_txt = modal.find('#end_txt'),
          duration_txt = modal.find('#duration_txt'),
          distance_lbl = modal.find('#distance_lbl'),
          speed_lbl = modal.find('#speed_lbl'),
          hold = 'start';
      start_txt.val(start);
      end_txt.val(end);
      duration_txt.val(juration.stringify(duration));
      distance_lbl.text(distance.toFixed(2));
      speed_lbl.text(speed);
      start_txt.change(function(){
        start = new Date(start_txt.val());
        if(hold == 'duration'){
          end = new Date(+start + duration*1000);
          end_txt.val(end);
        }
        else{
          duration = (end - start) / 1000;
          duration_txt.val(juration.stringify(duration));
          speed = (distance / duration) * 1000;
          speed_lbl.text(speed.toFixed(1));
        }
        hold = 'start';
      });
      end_txt.change(function(){
        end = new Date(end_txt.val());
        if(hold == 'duration'){
          start = new Date(end - duration*1000);
          start_txt.val(start);
        }
        else{
          duration = (end - start) / 1000;
          duration_txt.val(juration.stringify(duration));
          speed = (distance / duration) * 1000;
          speed_lbl.text(speed.toFixed(1));
        }
        hold = 'end';
      });
      duration_txt.change(function(){
        duration = juration.parse(duration_txt.val());
        if(hold == 'end'){
          start = new Date(end - duration*1000);
          start_txt.val(start);
        }
        else{
          end = new Date(+start + duration*1000);
          end_txt.val(end);
        }
        speed = (distance / duration) * 1000;
        speed_lbl.text(speed.toFixed(1));
        hold = 'duration';
      });
      modal.modal().find('.btn-primary').click(function(){
        modal.modal('hide');
        var start = new Date(start_txt.val()),
            end = new Date(end_txt.val()),
            points = track.points,
            duration = (+end - start) / 1000, // s
            speed = distance / duration * 1000, // m s^-1,
            points = track.points,
            i = 1,
            l = points.length,
            cuml_dist = 0,
            time, date,
            grad = track.getGradient(),
            histSum = 0, hist = track.getGradientHistogram(),
            histAvg;
        for(key in hist){
          histSum += key * hist[key];
        }
        histAvg = histSum / (distance * 10);
        track.points[0].time = start.toISOString();
        for(;i<l;i++){
          cuml_dist += points[i-1].distanceTo(points[i]); // km
          time = cuml_dist / distance * duration + (grad[i-1] - histAvg)*0.5; // s
          date = new Date(+start + time*1000);
          track.points[i].time = date.toISOString();
        }
        showStats(track);
        plotSpeed(track);
      });
    });

    $('#get-ele-btn').off('click').on('click', function(){
      var i = 0,
          points = track.points,
          l = points.length,
          baseURL = "http://ws.geonames.org/srtm3",
          geo = {},
          lat, lon, index,
          progress = $('progress'),
          getCallback = function(i,index){
            return function(data){
              geo[index] = Math.max(parseFloat(data),0);
              points[i].ele = geo[index];
              var val = progress.val() + 1;
              progress.val(val);
              if(val == l) {
                progress.val(0);
                plotElevation(track);
                plotGradient(track);
              }
            };
          };
      $(this).attr('disabled','');
      progress.attr('max', l);
      for(;i<l;i++) {
        lat = points[i].lat;
        lon = points[i].lon;
        index = lat + ":" + lon;
        if(!geo[index]){
          var url = baseURL + "?lat=" + lat + "&lng=" + lon;
          $.get(url, getCallback(i,index));
        }
        else {
          points[i].ele = geo[index];
          var val = progress.val() + 1;
          progress.val(val);
          if(val == l) {
            progress.val(0);
          }
        }
      }
    }).removeAttr('disabled');

    $('#gen-gpx-btn').off('click').on('click', function (){
      var format = GPSTools.Format.GPX,
          ext = 'gpx',
          data = format.generate(track),
          mime = format.mimeType;
      $(this)
        .attr('download', track.getStart().toISOString()+"."+ext)
        .attr('href', "data:"+mime+";base64,"+btoa(data));
    }).removeAttr('disabled');

    $('#graphCanvas').off('mousemove').on('mousemove', function(e){
      var x = e.offsetX, pos, frac, index;
      GPSTools.Graph.clear('graphCanvas');
      plotElevation(track);
      plotSpeed(track);
      pos = GPSTools.Graph.mark('graphCanvas',x);
      frac = pos.x;
      if(pos.x > 0 && pos.x < 1){
        index = Math.floor(pos.x * track.points.length);
        GPSTools.Map.mark(track.points[index]);
      }
      else{
        GPSTools.Map.unmark();
      }
    });
  }

  function showStats(track) {
    $('output').html('Start: ' + track.getStart() + '<br>End: ' + track.getEnd() +
      '<br>Duration: ' + GPSTools.Util.duration(track.getDuration()) +
      '<br>Distance (km): ' + track.getDistance() +
      '<br>Distance (mi): ' + GPSTools.Util.convertToMiles(track.getDistance()) +
      '<br>Average Speed (km/h): ' + GPSTools.Util.convertToKPH(track.getAvgSpeed()) +
      '<br>Maximum Speed (km/h): ' + GPSTools.Util.convertToKPH(track.getMaxSpeed()) +
      '<br>Maximum Speed (mph): ' + GPSTools.Util.convertToMPH(track.getMaxSpeed())
    );
  }

  function plotSpeed(track) {
    GPSTools.Graph.drawLine('graphCanvas', track.getSpeed(), {color:'red',overlay:true});
    $('#graph').show();
  }

  function plotElevation(track){
    GPSTools.Graph.drawFilled('graphCanvas', track.getElevation(), 'blue');
    $('#graph').show();
  }

  function plotGradient(track){
    var data = track.getGradientHistogram(),
        vals = [],
        labels = [],
        min, max,
        step = 0.1,
        i, key;
    for(key in data){
      if(typeof min == "undefined"){
        min = key;
        max = key;
      }
      else{
        min = Math.min(min, key);
        max = Math.max(max, key);
      }
    }
    for(i=min;i<=max;i+=step){
      key = i.toFixed(1);
      vals.push(data[key] || 0);
      labels.push((key%1 == 0) ? key : "");
    }
    GPSTools.Graph.drawBar('gradientCanvas', vals, {color:'green',labels:labels});
    $('#gradient').show();
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

  $('select').on('change', function(e){
    var option = $(e.target).find(":selected");
    displayTrack(option.data('track'));
  });

  $('#toggle-log').click(function(){
    $('#log').toggle();
    var self = $(this);
    self.text(self.text() == "Show Log" ? "Hide Log" : "Show Log");
  });

}(GPSTools, jQuery));

function logging(m) {
  $('#log ul').append('<li><small>' + (new Date()).toISOString() + "</small>: " + m);
}
