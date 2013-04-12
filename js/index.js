(function(GPSTools, $){

  var progress,
      trackList,
      titleLabel,
      currentTrack;

  $(function(){
    progress = $('progress');
    trackList = $('#tracks-list');
    titleLabel = $('#track-title');

    $('#open-file-btn').click(function(){
      $('#files').click();
    });

    var detail = $('#details').click(function(e){
      if(detail.is(e.target)){
        var body = $('body'),
            toScroll = body.scrollTop() ? 0 : detail.offset().top;
        body.animate({
          scrollTop: toScroll
        }, 2000);
      }
    });

    var firstSelected = 0;
    trackList.on('click', '.track', function(e){
      e.stopPropagation();
      var selected = $(e.currentTarget),
          index = trackList.find('.track').index(selected),
          tracks = [], i = 0, l, track,
          mergeButton = $('#mrg-trk-btn');

      if(e.ctrlKey){
        firstSelected = index;
        selected.toggleClass('selected');
        trackList.find('.selected').each(function(i,item){
          var track = $(item).data('track');
          tracks.push(track);
        });
      }
      else if(e.shiftKey){
        trackList.find('.selected').removeClass('selected');
        trackList.find('.track').each(function(i,item){
          if((index <= i && i <= firstSelected) ||
            (firstSelected <= i && i <= index)){
            item = $(item);
            item.addClass('selected');
            tracks.push(item.data('track'));
          }
        });
      }
      else {
        trackList.find('.selected').removeClass('selected');
        firstSelected = index;
        selected.addClass('selected');
        track = selected.data("track");
        tracks.push(track);
      }

      if(tracks.length > 1){
        displayTracks(tracks);
        mergeButton.show();
        if(GPSTools.areMergeable(tracks)){
          mergeButton.removeAttr('disabled');
        }
        else {
          mergeButton.attr('disabled', '');
        }
      }
      else if(tracks.length == 1) {
        if(tracks[0] instanceof GPSTools.SuperTrack) {
          displaySuperTrack(tracks[0]);
        }else {
          displayTrack(tracks[0]);
        }
        mergeButton.hide();
      }
    });

    titleLabel.on("input", function(){
      var newName = titleLabel.text();
      if(currentTrack){
        currentTrack.setName(newName);
      }
    });
  });


  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    loadFiles(files);
  }

  function loadFiles(files){
    var i = 0,
        l = files.length,
        added = 0;
    // files is a FileList of File objects. List some properties.
    if(l > 0) {
      setProgress(0,l);
      for(;i<l;i++){
        var f = files[i];
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
            else if(GPSTools.Format.TCX.isValid(doc)) {
              logging("Found TCX file!");
              track = GPSTools.Format.TCX.parse(doc);
            }
            else {
              logging("Unrecognised file type");
              return;
            }

            track.setName(theFile.name);

            addTrack(track);

            added++;
            setProgress(added);

            if(added == l){
              displayTrack(track);
              resetProgress();
            }
          };
        })(f);

        // Read in the file as text.
        reader.readAsText(f);
      }
    }
  }

  function displayTrack(track){

    if(currentTrack)
      currentTrack.events.off('change.gpstools-detail');
    currentTrack = track;

    titleLabel.text(track.name);

    showStats(track);
    track.events.on('change.gpstools-detail', (function(track){
      return function(e){
        showStats(track);
      };
    }(track)));

    GPSTools.Map.clearLine();
    GPSTools.Map.drawLine(track.points);

    $('#super-breakdown').hide();

    if(track.hasElevation()) {
      logging("Track has elevation data");
      $('#get-ele-btn').hide();
      GPSTools.Graph.clear('graphCanvas');
      GPSTools.Graph.clear('gradientCanvas');
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
      $('#gen-spd-btn').hide();
      var startDate = track.getStart(),
          endDate = track.getEnd();
      if(startDate.getDate() != endDate.getDate()){
        $('#ato-spl-btn').removeAttr('disabled').show();
      }
      else {
        $('#ato-spl-btn').hide();
      }
      plotSpeed(track);
    }
    else{
      $('#gen-spd-btn').removeAttr('disabled').show();
    }

    $('#gen-spd-btn').off('click').click(function(){
      $(this).attr('disabled','');
      generateSpeed(track, function(){
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
          url, callback, delay,
          getCallback = function(i,index){
            return function(data){
              geo[index] = Math.max(parseFloat(data),0);
              points[i].ele = geo[index];
              if(incrementProgress()) {
                resetProgress(0);
                plotElevation(track);
                plotGradient(track);
              }
            };
          };
      $(this).attr('disabled','');
      setProgress(0, l);
      for(;i<l;i++) {
        lat = points[i].lat;
        lon = points[i].lon;
        index = lat + ":" + lon;
        if(!geo[index]){
          url = baseURL + "?lat=" + lat + "&lng=" + lon;
          callback = getCallback(i,index);
          // Batches of 200 every 5 seconds
          delay = Math.floor(i / 200) * 5000;
          (function(url, callback){
            setTimeout(function(){
              $.get(url, callback)
                .fail(function(){
                  $.get(url, callback)
                    .fail(function(){
                      callback(0);
                    });
                });
              }, delay);
          }(url, callback));
        }
        else {
          points[i].ele = geo[index];
          if(incrementProgress()) {
            resetProgress();
          }
        }
      }
    }).removeAttr('disabled').show();

    $('#gen-gpx-btn').off('click').on('click', function (){
      var format = GPSTools.Format.GPX,
          ext = 'gpx',
          data = format.generate(track),
          mime = format.mimeType,
          name = track.hasTime() ?
            track.getStart().toISOString() : (new Date()).toISOString();
      $(this)
        .attr('download', name+"."+ext)
        .attr('href', "data:"+mime+";base64,"+btoa(data));
    }).removeAttr('disabled');
    $('#export-group').css('display', 'inline-block');

    var selecting = false,
        mousePos,
        mouseOver,
        mouseDown;

    function onMouseOver(){
      var pos, index;

      if(mousePos){
        GPSTools.Graph.clear('graphCanvas');
        if(track.hasElevation())
          plotElevation(track);
        if(track.hasTime())
          plotSpeed(track);
        pos = GPSTools.Graph.mark('graphCanvas',mousePos);
        if(pos > 0 && pos < 1){
          index = Math.floor(pos * track.points.length);
          GPSTools.Map.mark(track.points[index]);
        }
        else{
          GPSTools.Map.unmark();
        }

        if(selecting)
          GPSTools.Graph.endSelection('graphCanvas',mousePos);

        GPSTools.Graph.drawAnnotations('graphCanvas');

        webkitRequestAnimationFrame(onMouseOver);
      }
    }

    $('#graphCanvas').off('mousemove').on('mousemove', function(e){
      mousePos = e.offsetX;
    });

    $('#graphCanvas').off('mouseenter').on('mouseenter', function(e){
      mousePos = e.offsetX;
      webkitRequestAnimationFrame(onMouseOver);
    });

    $('#graphCanvas').off('mouseleave').on('mouseleave', function(e){
      mousePos = false;
    });

    $('#graphCanvas').off('mousedown').on('mousedown', function(e){
      GPSTools.Graph.startSelection('graphCanvas',e.offsetX);
      $('#clr-slt-btn, #crp-slt-btn').show();
      selecting = true;
      mouseDown = {x:e.offsetX,y:e.offsetY};
    });

    $('#graphCanvas').off('mouseup mouseout').on('mouseup mouseout', function(e){
      if(selecting){
        selecting = false;

        var start = GPSTools.Graph.getSelectionStart('graphCanvas'),
            end = GPSTools.Graph.getSelectionEnd('graphCanvas'),
            startIndex = Math.floor(start * track.points.length),
            endIndex = Math.floor(end * track.points.length),
            i, points = [];

        if(startIndex == endIndex){
          clearSelection();
        }
        else if(startIndex > 0){
          for(i = startIndex; i < endIndex; i++){
            points.push(track.points[i]);
          }

          GPSTools.Map.drawLine(points, true);
        }
      }
    });

    $('#clr-slt-btn').off('click').on('click', clearSelection);

    $('#crp-slt-btn').off('click').on('click', function(){
      var start = GPSTools.Graph.getSelectionStart('graphCanvas'),
          end = GPSTools.Graph.getSelectionEnd('graphCanvas'),
          startIndex = Math.floor(start * track.points.length),
          endIndex = Math.floor(end * track.points.length),
          i, points = [], newTrack;

      if(startIndex > 0 && startIndex < endIndex){
        newTrack = GPSTools.cropTrack(track, startIndex, endIndex);

        clearSelection();
        addTrack(newTrack);
        displayTrack(newTrack);
      }

    });

    function clearSelection(){
      GPSTools.Graph.clear('graphCanvas');
      if(track.hasElevation())
        plotElevation(track);
      if(track.hasTime())
        plotSpeed(track);
      GPSTools.Map.clearLine(true);
      GPSTools.Graph.clearSelection();
      GPSTools.Graph.drawAnnotations('graphCanvas');
      $('#clr-slt-btn, #crp-slt-btn').hide();
    }

    $('#fll-scn-btn').removeAttr('disabled').show();

    $('#ato-spl-btn').removeAttr('disabled').show().off('click').on('click', function(){
      var i = 1,
          l = track.points.length,
          p,
          thisDate,
          lastDate = new Date(track.points[i].time),
          trackStart = 0,
          d, newTrack;
      setProgress(0, track.points.length);
      for (; i < l; i++) {
        p = track.points[i];
        thisDate = new Date(p.time);
        if(lastDate.getDate() != thisDate.getDate())
        {
          newTrack = GPSTools.cropTrack(track, trackStart, i);
          addTrack(newTrack);
          trackStart = i;
        }
        lastDate = thisDate;
        setProgress(i);
      }
      resetProgress();
    });
  }
  // endFunction: displayTrack()

  function displayTracks(tracks){
    var cumlDist = 0, cumlTime = 0;
    GPSTools.Map.clearLine();
    for(var i = 0, l = tracks.length; i < l; i++){
      cumlDist += tracks[i].getDistance();
      cumlTime += tracks[i].getDuration() || 0;
      GPSTools.Map.drawLine(tracks[i].points);
    }
    GPSTools.Map.zoomToExtent();
    $('output').html('Aggregate Statistics:' +
      '<br>Duration: ' + juration.stringify(cumlTime) +
      '<br>Distance (km): ' + cumlDist +
      '<br>Distance (mi): ' + GPSTools.Util.convertToMiles(cumlDist));
  }

  function displaySuperTrack(track){

    if(currentTrack)
      currentTrack.events.off('change.gpstools-detail');
    currentTrack = track;

    titleLabel.text(track.name);

    GPSTools.Map.clearLine();
    for(var i = 0, l = track.tracks.length; i < l; i++){
      GPSTools.Map.drawLine(track.tracks[i].points);
    }
    GPSTools.Map.zoomToExtent();
    showStats(track);

    track.events.on('change.gpstools-detail', (function(track){
      return function(e){
        showStats(track);
      }
    }(track)));

    $('#graph, #gradient').hide();
    var breakdownBody = $('#super-breakdown tbody'),
        i = 0,
        l = track.tracks.length,
        subTrack;

    breakdownBody.empty();

    for(;i<l;i++){
      subTrack = track.tracks[i];

      addRow(breakdownBody, subTrack);

      function addRow(table, track){
        var row = $('<tr>'),
            subNameCell;

        row.append($('<td>').text(i+1));
        subNameCell = $('<td>')
          .attr('contenteditable', true);
        subNameCell.on("input", (function(subNameCell, track){
            return function(){
              track.setName(subNameCell.text());
            }
          }(subNameCell, track))
        );
        row.append(subNameCell);

        row.append($('<td>'));
        row.append($('<td>'));
        row.append($('<td>'));
        row.append($('<td>'));

        row.append($('<td>').append(
          $('<button>').addClass('btn btn-small').append(
            $('<i>').addClass('icon-time')
          ).on('click', (function(track){
            return function(e){
              generateSpeed(track);
            };
          }(track)))
        ));

        populateRow(row, track);

        // small? (temporary) MEMORY LEAK:
        track.events.on('change.gpstools-detail', {row: row, track: track}, function(e){
          populateRow(e.data.row, e.data.track);
        });

        table.append(row);
      }

      function populateRow(row, track){
        row.find('td').each(function(i,item){
          var text;
          switch (i){
            case 1:
              text = track.name; break;
            case 2:
              text = track.getDistance().toFixed(2); break;
            case 3:
              text = formatDate(track.getStart(), "HH:i:s"); break;
            case 4:
              text = formatDate(track.getEnd(), "HH:i:s"); break;
            case 5:
              text = juration.stringify(track.getDuration()); break;
          }
          if(text)
            $(item).text(text);
        })
      }
    }

    track.events.on('addsubtrack.gpstools-detail', function(e){
      addRow(breakdownBody, e.newTrack);
    });

    $('#super-breakdown').show();
  }

  function addTrack(track){
    trackList.find('.selected').removeClass('selected');

    var targetList,
        trackItem,
        trackTime;

    if(currentTrack instanceof GPSTools.SuperTrack) {

      currentTrack.addTrack(track);

      $('.track').each(function(i,item){
        var $item = $(item);
        if(currentTrack == $item.data("track")) {
          targetList = $item.find('.sub-tracks');
          return false;
        }
      });
    }
    else {
      targetList = trackList;
    }

    trackItem = $('<div>')
      .addClass('track')
      .addClass('selected')
      .attr('draggable', true)
      .append($('<p>')
        .addClass('track-name')
      )
      .append($('<span>')
        .addClass('track-dist')
      )
      .data('track', track)
      .appendTo(targetList);

    trackTime = $('<span>')
      .addClass('track-time')
      .appendTo(trackItem)
      .toggle(track.hasTime());

    if(track instanceof GPSTools.SuperTrack){
      trackItem.append($('<div>')
        .addClass('sub-tracks')
      );
    }

    function populateListItem(listItem, track){
      listItem.css('background-image', 'url('+track.getThumb(64)+')');
      listItem.children('.track-name').text(track.name);
      listItem.children('.track-dist').text(track.getDistance().toFixed() + " km");
      listItem.children('.track-time')
        .text(juration.stringify(track.getDuration()))
        .toggle(track.hasTime());
    }

    populateListItem(trackItem, track);

    track.events.on('change', {listItem: trackItem, track: track}, function(e){
      var listItem = e.data.listItem,
          track = e.data.track;
      populateListItem(listItem, track);
    });
  }

  function updateListing(superTrackElement){
    var superTrack = superTrackElement.data("track");
    superTrackElement.css('background-image', "url("+superTrack.getThumb(64)+")");
    superTrackElement.children('.track-dist').text(superTrack.getDistance());
    superTrackElement.children('.track-time').text(superTrack.getDuration());
  }

  function showStats(track) {
    var out = 'Distance (km): ' + track.getDistance() +
          '<br>Distance (mi): ' + GPSTools.Util.convertToMiles(track.getDistance());
    if(track.hasTime()){
      out += '<br>Start: ' + track.getStart() + '<br>End: ' + track.getEnd() +
          '<br>Duration: ' + GPSTools.Util.duration(track.getDuration()) +
          '<br>Average Speed (km/h): ' + GPSTools.Util.convertToKPH(track.getAvgSpeed()) +
          '<br>Maximum Speed (km/h): ' + GPSTools.Util.convertToKPH(track.getMaxSpeed()) +
          '<br>Maximum Speed (mph): ' + GPSTools.Util.convertToMPH(track.getMaxSpeed());
    }
    if(track.hasElevation()){
      out += '<br>Height Gain (m): ' + track.getHeightGain();
    }
    $('output').html(out);
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

  function generateSpeed(track, callback){

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
      track.events.trigger('changetime');

      if(typeof callback == "function")
        callback();
    });
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

  $('#mrg-trk-btn').click(function(e){
    var options = $('select')[0].selectedOptions,
        tracks = [], i = 0, l = options.length;
    if(options.length > 1){
      for(;i<l;i++){
        tracks.push($(options[i]).data('track'));
      }
      addTrack(GPSTools.mergeTracks(tracks));
    }
    $('#mrg-trk-btn').hide();
  });

  $('#fll-scn-btn').click(function(){
    $('#mapCanvas')[0].webkitRequestFullscreen();
  })

  $('#toggle-log').click(function(){
    $('#log').toggle();
    var self = $(this);
    self.text(self.text() == "Show Log" ? "Hide Log" : "Show Log");
  });

  // Strava Closure
  (function(){
    var stravaRideDetails,
        stravaRideIdTxt = $('#rideid_txt'),
        stravaImportBtn = $('#strava-import-btn'),
        stravaRideDetailsDiv = $('#strava-ride-details'),
        stravaRideNameTxt = $('#strava-name'),
        stravaRideDistanceTxt = $('#strava-distance'),
        stravaRideDurationTxt = $('#strava-duration'),
        stravaRideAthleteTxt = $('#strava-athlete'),
        stravaLoading = $('#strava-loading'),
        stravaModal = $('#importModal'),
        stravaLoadRideBtn = stravaModal.find('.btn-primary'),
        stravaRideId;
    stravaRideIdTxt.on('keyup change', function(){
      var val = stravaRideIdTxt.val(),
          pattern = /\d+$/,
          result = pattern.exec(val);
      if(result && result[0]){
        stravaRideId = result[0];
        stravaLoading.show();

        $.getJSON('proxy.php?url=' + encodeURIComponent('http://app.strava.com/api/v1/rides/'+stravaRideId),
          function(data){
            stravaLoading.hide();
            if(data.ride){
              rideDetails = data.ride;
              stravaRideNameTxt.text(data.ride.name);
              stravaRideDistanceTxt.text((data.ride.distance/1000).toFixed(1) + " km");
              stravaRideDurationTxt.text(juration.stringify(data.ride.elapsedTime));
              stravaRideAthleteTxt.text(data.ride.athlete.name);
              stravaRideDetailsDiv.show();
              stravaLoadRideBtn.removeAttr('disabled');
            }
            else if (data.error){
              stravaRideDetailsDiv.hide();
              stravaLoading.hide();
              alert(data.error);
            }
          }
        ).error(function(){
          stravaRideDetailsDiv.hide();
          stravaLoading.hide();
          alert("Other Error!");
        });
      }
    });

    stravaImportBtn.click(function(){
      stravaModal.modal();
      stravaLoadRideBtn.click(function(){
        resetModal();
        if(!stravaRideId)
          return;
        var pp = pseudoProgress(10);
        $.getJSON('proxy.php?url=' + encodeURIComponent('http://app.strava.com/api/v1/streams/'+stravaRideId+'?streams[]=latlng,time,altitude'),
          function(data){
            if(data.latlng){
              if(rideDetails){
                var latlng = data.latlng,
                    time = data.time,
                    elevation = data.altitude,
                    l = latlng.length,
                    i = 0,
                    points = [],
                    track, date,
                    startDate = new Date(rideDetails.startDate).valueOf();
                for(;i<l;i++){
                  date = (new Date(startDate + (time[i]*1000))).toISOString();
                  points.push(new GPSTools.Point(latlng[i][0],latlng[i][1],elevation[i],date));
                }
                track = new GPSTools.Track(points);
                track.name = rideDetails.name;
                addTrack(track);
                displayTrack(track);
              }
            }
            else if (data.error){
              resetModal();
              alert(data.error);
            }
            pp.complete();
          }
        ).error(function(){
          resetModal();
          pp.complete();
          alert("Other Error!");
        });
      });
    });

    function resetModal(){
      stravaModal.modal('hide');
      stravaLoading.hide();
      stravaLoadRideBtn.attr('disabled', true);
      stravaRideDetailsDiv.hide();
    }
  }());

  var drawTrackButton = $('#drw-trk-btn');
  drawTrackButton.click(function(){
    drawTrackButton.attr('disabled', true);
    GPSTools.Map.createLine(function(track){
      addTrack(track);
      displayTrack(track);
      drawTrackButton.removeAttr('disabled');
    });
  });

  var superTrackButton = $('#spr-trk-btn');
  superTrackButton.click(function(){
    superTrack = new GPSTools.SuperTrack();
    addTrack(superTrack);
  });

  $(function(){

    var draggingElement = null;

    var dragHover = function(e){
          e.stopPropagation();
          e.preventDefault();

          // Handle File dragging
          if(e.originalEvent.dataTransfer.types){
            if(e.type == "dragover"){
              trackList.addClass('drop-target');
            }
            else {
              trackList.removeClass('drop-target');
            }
          }
          // Handle Track dragging
          else {
            var target = $(e.originalEvent.target);
            if(!target.is('.sub-tracks'))
              target = target.closest('.track');
            else
              console.log(target);
            if(e.type == "dragover"){
              target.addClass('hover-over');
            }
            else {
              target.removeClass('hover-over');
            }
          }
        };
    $(document).on('dragover', dragHover);
    $(document).on('dragleave', dragHover);

    trackList.on('drop', function(e){
      console.log('drop');
      dragHover(e);
      var files = e.originalEvent.dataTransfer.files;
      if(files.length){
        loadFiles(files);
      }
      else {
        draggingElement = $(draggingElement);
        var draggingTrackElement = draggingElement.closest('.track'),
            draggingTrack = draggingElement.data("track"),

            droppedElement = $(e.originalEvent.target),
            droppedTrackElement = droppedElement.closest('.track'),
            droppedTrack = droppedTrackElement.data("track"),

            newSubTrackList = droppedElement.closest('.sub-tracks'),
            newSuperTrackElement = newSubTrackList.closest('.track'),
            newSuperTrack = newSuperTrackElement.data("track"),

            oldSubTrackList = draggingElement.closest('.sub-tracks'),
            oldSuperTrackElement = oldSubTrackList.closest('.track'),
            oldSuperTrack = oldSuperTrackElement.data("track");

        // Has been dropped on the empty space at the bottom of the trackList
        if(droppedElement.is(trackList)){

          trackList.append(draggingElement);

          if(oldSuperTrackElement.length){
            oldSuperTrack.removeTrack(draggingTrack);
          }
        }
        else if(droppedElement.is('.sub-tracks')){

          droppedTrack = droppedTrackElement.data("track");

          // Add HTML
          droppedElement.append(draggingElement);
          // Add track to new supertrack
          droppedTrack.addTrack(draggingTrack);
          // Refresh both (possible) super track elements
          if(oldSubTrackList.length){
            // Remove track from old super track
            oldSuperTrack.removeTrack(draggingTrack);
          }
        }
        else if(!droppedTrackElement.is(draggingElement)){

          if(oldSubTrackList.length){
            oldSuperTrack.removeTrack(draggingTrack);
          }
          if(newSubTrackList.length){
            newSuperTrack.addTrack(draggingTrack);
          }

          if(droppedTrackElement.index() < draggingTrackElement.index()){
            draggingTrackElement.insertBefore(droppedTrackElement);
          }
          else{
            draggingTrackElement.insertAfter(droppedTrackElement);
          }
        }
      }
      console.log('drop END');
    });

    $(document).on('dragstart', '.track', function(e){
      console.log("dragstart");
      e.stopPropagation();
      draggingElement = e.currentTarget;
      $(this).css('opacity', 0.5);
      console.log("dragstart END");
    }).on('dragend', '.track', function(e){
      console.log("dragend");
      draggingElement = null;
      $(this).css('opacity', 1);
      console.log("dragend END");
    });
  });

  function setProgress(val, max){
    if (typeof max != "undefined"){
      progress.attr('max', max);
    }
    else {
      max = progress.attr('max');
    }
    progress.val(val);
    progress.show();
    return val == max;
  }

  function resetProgress(){
    progress.val(0);
    progress.hide();
  }

  function incrementProgress(){
    return setProgress(progress.val() + 1);
  }

  function pseudoProgress(duration){
    var max = duration * 1000,// duration in seconds
        interval = 100,       // interval in milliseconds
        val = 0,
        update = function(){
          val += interval;
          if(val > max){
            val = max;
            clearInterval(timer);
          }
          setProgress(val);
        },
        timer = setInterval(update, interval);
    setProgress(0, max);
    return {
      complete: function(){
        clearInterval(timer);
        resetProgress();
      }
    }
  }

}(GPSTools, jQuery));

function logging(m) {
  $('#log ul').append('<li><small>' + (new Date()).toISOString() + "</small>: " + m);
}

function formatDate(date, format){
  if(typeof date == "undefined")
    date = new Date();
  if(typeof format == "undefined")
    format = "iso";
  switch(format){
    case "Y-m-d":
      return date.getFullYear() + "-"
        + (date.getMonth() + 1) + "-"
        + date.getDate();
    case "H:i":
      return date.getHours() + ":"
        + pad(date.getMinutes());
    case "H:i:s":
      return date.getHours() + ":"
        + pad(date.getMinutes()) + ":"
        + pad(date.getSeconds());
    case "HH:i":
      return pad(date.getHours()) + ":"
        + pad(date.getMinutes());
    case "HH:i:s":
      return pad(date.getHours()) + ":"
        + pad(date.getMinutes()) + ":"
        + pad(date.getSeconds());
    case "iso":
    default:
      return date.toISOString();
  }
}
function pad(n){return n<10?"0"+n:n}
