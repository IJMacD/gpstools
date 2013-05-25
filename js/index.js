(function(GPSTools, $){

  var progress,
      trackList,
      titleLabel,
      currentTrack,
      defaultExportFormat = 'gpx',
      generateFormatBtn,
      elevationCache = {},
      drawTrackButton,
      superTrackButton,

      // List Selection
      firstSelected = 0;

  $(function(){
    progress = $('progress');
    trackList = $('#tracks-list');
    titleLabel = $('#track-title');
    generateFormatBtn = $('#gen-fmt-btn');
    drawTrackButton = $('#drw-trk-btn');
    superTrackButton = $('#spr-trk-btn');

    $('#open-file-btn').click(function(){
      $('#files').click();
    });

    drawTrackButton.click(function(){
      drawTrackButton.attr('disabled', true);
      GPSTools.Map.createLine(function(track){
        addTrack(track);
        displayTrack(track);
        drawTrackButton.removeAttr('disabled');
      });
    });

    superTrackButton.click(function(){
      superTrack = new GPSTools.SuperTrack();
      addTrack(superTrack);
      displaySuperTrack(superTrack);
    });

    function exportFormatHandler(e){
      if(!currentTrack)
        return;
      defaultExportFormat = (e.data && e.data.format) || defaultExportFormat;
      var dl = getDownloadDetails(currentTrack, defaultExportFormat);
      $(e.target)
        .attr('download', dl.name)
        .attr('href', "data:"+dl.mime+";base64,"+btoa(dl.data));
      generateFormatBtn.text("Export " + defaultExportFormat.toUpperCase());
    }

    $('#gen-fmt-btn').on('click', exportFormatHandler);
    $('#gen-gpx-btn').on('click', {format: 'gpx'}, exportFormatHandler);
    $('#gen-kml-btn').on('click', {format: 'kml'}, exportFormatHandler);
    $('#gen-tcx-btn').on('click', {format: 'tcx'}, exportFormatHandler);
    $('#gen-json-btn').on('click', {format: 'json'}, exportFormatHandler);

    var detail = $('#details').click(function(e){
      if(detail.is(e.target)){
        var body = $('body'),
            toScroll = body.scrollTop() ? 0 : detail.offset().top;
        body.animate({
          scrollTop: toScroll
        }, 2000);
      }
    });

    trackList.on('click', '.track', function(e){
      e.stopPropagation();
      var selected = $(e.currentTarget),
          index = trackList.find('.track').index(selected),
          tracks = [], track,
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
        added = 0,
        f,
        reader;
    // files is a FileList of File objects. List some properties.
    if(l > 0) {
      setProgress(0,l);
      for(;i<l;i++){
        f = files[i];
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
        reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            var track = GPSTools.parseTrack(e.target.result);

            if(track){
              if(!track.name)
                track.setName(theFile.name);

              addTrack(track);
            }

            setProgress(++added);

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

    if(track instanceof GPSTools.SuperTrack)
      return displaySuperTrack(track);

    if(currentTrack)
      currentTrack.events.off('.gpstools-detail');
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
          baseURL = "http://ijmacd-gpstools.appspot.com/geonames/srtm3",
          geo = elevationCache,
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
        lat = points[i].lat.toFixed(3);
        lon = points[i].lon.toFixed(3);
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

    $('#export-grp').css('display', 'inline-block');

    // Elevation/Speed hovering, selecting, cropping
    (function(){
      var selecting = false,
          mousePos,
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
            newTrack;

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
    }());

    $('#fll-scn-btn').removeAttr('disabled').show();

    $('#ato-spl-btn').removeAttr('disabled').show().off('click').on('click', function(){
      var i = 1,
          l = track.points.length,
          p,
          thisDate,
          lastDate = new Date(track.points[i].time),
          trackStart = 0,
          newTrack;
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
    var cumlDist = 0, cumlTime = 0,
        i, l;
    GPSTools.Map.clearLine();
    for(i = 0, l = tracks.length; i < l; i++){
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
      currentTrack.events.off('.gpstools-detail');
    currentTrack = track;

    titleLabel.text(track.name);

    function drawMap(track){
      var map = GPSTools.Map,
          tracks = track.tracks,
          p1, p2, i, l;
      map.clearLine();
      for(i = 0, l = tracks.length; i < l; i++){
        // Draw link lines
        if(i > 0){
          p1 = tracks[i-1].getEndPoint();
          p2 = tracks[i].getStartPoint();
          map.drawLine([p1,p2],{color:'#3399ff'});
        }
        map.drawLine(tracks[i].points);
      }
      if(l)
        map.zoomToExtent();
      else
        map.zoomToMaxExtent();
    }

    showStats(track);
    drawMap(track);

    track.events.on('changepoints.gpstools-detail', (function(track){
      return function(e){
        showStats(track);
        drawMap(track);
      }
    }(track)));
    track.events.on('change.gpstools-detail', (function(track){
      return function(e){
        showStats(track);
        drawMap(track);
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

      addRow(breakdownBody, i, subTrack);
    }

    function addRow(table, i, subtrack){
      var row = $('<tr>'),
          subNameCell,
          subStartCell,
          subEndCell;

      row.append($('<td>').text(i+1));  // Col 0: ID

      subNameCell = $('<td>')           // Col 1: Name
        .attr('contenteditable', true);
      subNameCell.on("input", (function(subNameCell, subtrack){
          return function(){
            subtrack.setName(subNameCell.text());
          }
        }(subNameCell, subtrack))
      );
      row.append(subNameCell);

      row.append($('<td>'));          // Col 2: Distance

      subStartCell = $('<td>')        // Col 3: Start Time
        .attr("contenteditable", true)
        .on("blur", function(){
          var startTime = subStartCell.text(),
              match = startTime.match(/(\d\d):(\d\d):(\d\d)/),
              start = subtrack.getStartTime();
          if(!start)
            start = subtrack.getEndTime() || new Date();
          if(match){
            start.setHours(match[1]);
            start.setMinutes(match[2]);
            start.setSeconds(match[3]);
            track.setSplitTime(i, start);
          }
        });
      row.append(subStartCell);

      subEndCell = $('<td>')        // Col 4: End Time
        .attr("contenteditable", true)
        .on("blur", function(){
          var endTime = subEndCell.text(),
              match = endTime.match(/(\d\d):(\d\d):(\d\d)/),
              end = subtrack.getEndTime();
          if(!end)
            end = subtrack.getStartTime() || new Date();
          if(match){
            end.setHours(match[1]);
            end.setMinutes(match[2]);
            end.setSeconds(match[3]);
            track.setSplitTime(i+1, end);
          }
        });
      row.append(subEndCell);
      row.append($('<td>'));          // Col 5: Duration

      row.append($('<td>').append(    // Col 6: Actions
        $('<button>').addClass('btn btn-small').append(
          $('<i>').addClass('icon-time')
        ).on('click', (function(subtrack){
          return function(e){
            generateSpeed(subtrack);
          };
        }(subtrack)))
      ));

      populateRow(row, subtrack);

      row.data("track", subtrack);

      // small? (temporary) MEMORY LEAK:
      subtrack.events.on('change.gpstools-detail', {row: row, track: subtrack}, function(e){
        populateRow(e.data.row, e.data.track);
      });

      table.append(row);
    }

    function populateRow(row, subtrack){
      row.find('td').each(function(i,item){
        var text;
        switch (i){
          case 1:
            text = subtrack.name; break;
          case 2:
            text = subtrack.getDistance().toFixed(2); break;
          case 3:
            if(subtrack.getStartTime())
              text = formatDate(subtrack.getStartTime(), "HH:i:s");
            break;
          case 4:
            if(subtrack.getEndTime())
              text = formatDate(subtrack.getEndTime(), "HH:i:s");
            break;
          case 5:
            text = juration.stringify(subtrack.getDuration()); break;
        }
        if(text)
          $(item).text(text);
      });
    }

    track.events.on('addsubtrack.gpstools-detail', function(e){
      addRow(breakdownBody, breakdownBody.find('tr').length, e.newTrack);
    });

    track.events.on('removesubtrack.gpstools-detail', function(e){
      breakdownBody.find('tr').each(function(i,item){
        var $item = $(item),
            track  = $item.data("track");
        if(track == e.oldTrack){
          $item.remove();
          return false;
        }
      });
    });

    $('#super-breakdown').show();
  }

  function addTrack(track){

    var targetList;

    // Work out where this track is going to get added
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

    trackItem = createTrackItem(track, targetList);

    // Only the outer trackItem gets selected
    trackItem.addClass('selected');

    function createTrackItem(track, targetList){

      var trackItem,
          trackSubList,
          t, i, l;

      trackItem = $('<div>')
        .addClass('track')
        .attr('draggable', true)
        .append($('<p>')
          .addClass('track-name')
        )
        .append($('<span>')
          .addClass('track-dist')
        )
        .data('track', track)
        .appendTo(targetList);

      $('<span>')
        .addClass('track-time')
        .appendTo(trackItem)
        .toggle(track.hasTime());

      populateListItem(trackItem, track);

      track.events.on('change', {listItem: trackItem, track: track}, function(e){
        var listItem = e.data.listItem,
            track = e.data.track;
        populateListItem(listItem, track);
      });

      if(track instanceof GPSTools.SuperTrack){

        trackSubList = $('<div>')
          .addClass('sub-tracks')
          .appendTo(trackItem);

        t = track.tracks;
        if(t.length){
          for(i=0,l=t.length;i<l;i++){
            createTrackItem(t[i],trackSubList);
          }
        }
      }

      return trackItem;
    }

    function populateListItem(listItem, track){
      listItem.css('background-image', 'url('+track.getThumb(64)+')');
      listItem.children('.track-name').text(track.name);
      listItem.children('.track-dist').text(track.getDistance().toFixed() + " km");
      listItem.children('.track-time')
        .text(juration.stringify(track.getDuration()))
        .toggle(track.hasTime());
    }
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
      min = Math.min(min || key, key);
      max = Math.max(max || key, key);
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
        duration = track.hasTime() ? track.getDuration() : (distance / speed) * 1000, // s
        end = track.getEndTime() || new Date(),
        start = track.getStartTime() || new Date(end - duration*1000),
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
    modal.modal().find('.btn-primary').off('click').click(function(){
      modal.modal('hide');
      var start = new Date(start_txt.val()),
          end = new Date(end_txt.val());
      track.setTime(start, end);
      if(typeof callback == "function")
        callback();
    });
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

  $('#mrg-trk-btn').click(function(e){
    var options = trackList.find('.selected'),
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
    var stravaRideIdTxt = $('#rideid_txt'),
        stravaImportBtn = $('#strava-import-btn'),
        stravaRideDetailsDiv = $('#strava-ride-details'),
        stravaRideNameTxt = $('#strava-name'),
        stravaRideDistanceTxt = $('#strava-distance'),
        stravaRideDurationTxt = $('#strava-duration'),
        stravaRideAthleteTxt = $('#strava-athlete'),
        stravaRidesDetailsDiv = $('#strava-rides-details'),
        stravaRidesNumLbl = $('#strava-num-rides'),
        stravaRidesFirstLbl = $('#strava-first-ride'),
        stravaRidesLastLbl = $('#strava-last-ride'),
        stravaLoading = $('#strava-loading'),
        stravaModal = $('#importModal'),
        stravaLoadRideBtn = stravaModal.find('.btn-primary'),
        stravaAthleteId,
        stravaRideId,
        stravaRideIds,
        stravaRideDetails = {};

    stravaRideDetailsDiv.hide();
    stravaRidesDetailsDiv.hide();

    stravaRideIdTxt.on('keyup change', function(){
      var val = stravaRideIdTxt.val(),
          athleteRegex = /\/athletes\/(\d+)$/,
          athleteResult = athleteRegex.exec(val),
          idRegex = /\d+$/,
          idResult = idRegex.exec(val),
          i,
          length;

      if(athleteResult && athleteResult[1]){
        stravaAthleteId = athleteResult[1];
        stravaLoading.show();

        $.getJSON('http://ijmacd-gpstools.appspot.com/strava/v1/rides?athleteId='+stravaAthleteId,
          function(data){
            stravaLoading.hide();
            if(data.rides){
              rides = data.rides;
              length = rides.length;
              stravaRideIds = [];
              for(i=0;i<length;i++){
                stravaRideIds.push(rides[i].id);
              }
              stravaRidesNumLbl.text(length);
              //stravaRidesFirstLbl.text(juration.stringify(rides[0].date));
              //stravaRidesLastLbl.text(juration.stringify(rides[length-1].date));
              stravaLoadRideBtn.text("Import " + length + " Rides");
              stravaRidesDetailsDiv.show();
              stravaLoadRideBtn.removeAttr('disabled');
            }
            else if (data.error){
              alert(data.error);
            }
          }
        ).error(function(){
          stravaRideDetailsDiv.hide();
          stravaLoading.hide();
          alert("Other Error!");
        });

      }
      else if(idResult && idResult[0]){
        stravaRideId = idResult[0];
        stravaRideIds = [idResult[0]];
        stravaLoading.show();

        stravaGetRideDetails(stravaRideId, function(ride){
          stravaLoading.hide();
          stravaRideNameTxt.text(ride.name);
          stravaRideDistanceTxt.text((ride.distance/1000).toFixed(1) + " km");
          stravaRideDurationTxt.text(juration.stringify(ride.elapsedTime));
          stravaRideAthleteTxt.text(ride.athlete.name);
          stravaLoadRideBtn.text("Import Ride");
          stravaRideDetailsDiv.show();
          stravaLoadRideBtn.removeAttr('disabled');
        }, function(){
          stravaRideDetailsDiv.hide();
          stravaLoading.hide();
          alert("Other Error!");
        });
      }
    });

    function stravaGetRideDetails(rideId, success, error){

        $.getJSON('http://ijmacd-gpstools.appspot.com/strava/v1/rides/'+rideId,
          function(data){
            var ride = data.ride;
            if(ride){
              stravaRideDetails[rideId] = ride;
              success(ride);
            }
            else if (data.error){
              if(typeof error == "function")
                error();
            }
          }
        ).error(error);
    }

    stravaImportBtn.click(function(){
      stravaModal.modal();
    });


    stravaLoadRideBtn.click(function(){
      resetModal();
      if(!stravaRideIds || !stravaRideIds.length)
        return;
      var i = 0,
          l = stravaRideIds.length;
      setProgress(i, l);
      for(;i<l;i++){
        (function(rideId){

          var both = !!stravaRideDetails[rideId],
              streams;

          if(!both){
            stravaGetRideDetails(rideId, processRide, function(){incrementProgress();});
          }

          $.getJSON('http://ijmacd-gpstools.appspot.com/strava/v1/streams/'+rideId+'?streams[]=latlng,time,altitude',
            function(data){
              if(data.latlng){
                streams = data;
                processRide();
              }
              else if (data.error){
                incrementProgress();
                alert(data.error);
              }
            }
          ).error(function(){
            incrementProgress();
            alert("Other Error!");
          });

          function processRide(){

            if(!both){
              both = true;
              return;
            }

            if(stravaRideDetails[rideId] && streams){
              var latlng = streams.latlng,
                  time = streams.time,
                  elevation = streams.altitude,
                  l = latlng.length,
                  i = 0,
                  points = [],
                  track, date,
                  rideDetails = stravaRideDetails[rideId],
                  startDate = new Date(rideDetails.startDate).valueOf();
              for(;i<l;i++){
                if(latlng[i][0] != 0 || latlng[i][1] != 0){
                  date = (new Date(startDate + (time[i]*1000))).toISOString();
                  points.push(new GPSTools.Point(latlng[i][0],latlng[i][1],elevation[i],date));
                }
              }
              track = new GPSTools.Track(points);
              track.name = rideDetails.name;
              addTrack(track);
              incrementProgress();
            }
          }

        }(stravaRideIds[i]));
      }

      progressCompleteOnce(function(){
        resetModal();
      });
    });

    function resetModal(){
      stravaModal.modal('hide');
      stravaLoading.hide();
      stravaLoadRideBtn.attr('disabled', true);
      stravaRideDetailsDiv.hide();
    }
  }());

    });
  });

  });

  // Dragging
  $(function(){

    var draggingElement = null,

        dragHover = function(e){
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
      dragHover(e);
      var files = e.originalEvent.dataTransfer.files,
          draggingTrackElement,
          draggingTrack,
          droppedElement,
          droppedTrackElement,
          droppedTrack,
          newSubTrackList,
          newSuperTrackElement,
          newSuperTrack,
          oldSubTrackList,
          oldSuperTrackElement,
          oldSuperTrack;
      if(files.length){
        loadFiles(files);
      }
      else {
        draggingElement = $(draggingElement);
        draggingTrackElement = draggingElement.closest('.track');
        draggingTrack = draggingElement.data("track");

        droppedElement = $(e.originalEvent.target);
        droppedTrackElement = droppedElement.closest('.track');
        droppedTrack = droppedTrackElement.data("track");

        newSubTrackList = droppedElement.closest('.sub-tracks');
        newSuperTrackElement = newSubTrackList.closest('.track');
        newSuperTrack = newSuperTrackElement.data("track");

        oldSubTrackList = draggingElement.closest('.sub-tracks');
        oldSuperTrackElement = oldSubTrackList.closest('.track');
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
    });

    $(document).on('dragstart', '.track', function(e){
      e.stopPropagation();
      draggingElement = e.currentTarget;
      $(this).css('opacity', 0.5);
      /* - This needs to wait, I'm busy
      var track = $(draggingElement).data("track"),
          // Potentially long operation:
          // magnitude ~1500ms! for real tracks (~8000 points)
          dl = getDownloadDetails(track, 'gpx'),
          dataURL = "data:"+dl.mime+";base64,"+btoa(dl.data),
          // Browser does NOT allow colons in name:
          // haven't found a way to escape them
          name = dl.name.replace(/:/g,""),
          data = dl.mime+":"+name+":"+dataURL;
      e.originalEvent.dataTransfer.setData("DownloadURL", data);
      */
    }).on('dragend', '.track', function(e){
      draggingElement = null;
      $(this).css('opacity', 1);
    });
  });

  function getDownloadDetails(track, format){
    var ext = format.toLowerCase(),
        fmt = format.toUpperCase(),
        generator = GPSTools.Format[fmt],
        data = generator.generate(track),
        mime = generator.mimeType,
        name = track.hasTime() ?
          track.getStart().toISOString() : (new Date()).toISOString();
    return {
      name: name + "." + ext,
      mime: mime,
      data: data
    };
  }

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
    if(setProgress(progress.val() + 1)){
      try{
        progressEvents.trigger("complete");
      }catch(e){}
      resetProgress();
    }
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

  var progressEvents = $({});

  function progressComplete(handler){
    progressEvents.on("complete", handler);
  }

  function progressCompleteOnce(handler){
    var f = function(){
      progressEvents.off("complete", f);
      handler();
    };
    progressEvents.on("complete", f);
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
