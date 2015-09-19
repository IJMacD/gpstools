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
