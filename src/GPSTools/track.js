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
        i,
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
  }

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
    this.avgSpeed = this.getDistance() / this.getDuration();
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
    for(var key in hist){
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
GPSTools.Track.prototype.getInstantDistance = function(/*time*/) {
  throw Error('Not Implemented')
  // var i0 = this.getPrecedingPointIndex(time);
  // return this.points[i0].speedTo(this.points[i0+1]);
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
