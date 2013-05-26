$(function(){
	var testResults = $('#test-results');

	function test(name, evaluator){
		var result = false,
			desc = name;
		try {
			if(evaluator())
				result = true;
		} catch (e){
			desc += "<br>" + e;
		}
		$('<li>').addClass(result ? "pass" : "fail").html(desc).appendTo(testResults);
	}

	function testEqual(name, testValue, expectedValue, dp){
		var result = false,
			desc = name;
		try {
			if(dp)
				testValue = round(testValue,dp);
			if(testValue == expectedValue)
				result = true;
			else
				desc += "<br>Expecting " + expectedValue + ", but got " + testValue + " instead.";
		} catch (e){
			desc += "<br>" + e;
		}
		$('<li>').addClass(result ? "pass" : "fail").html(desc).appendTo(testResults);
	}

	function round(value, dp){
		var scale = Math.pow(10,dp);
		return Math.round(value*scale)/scale;
	}

	// ----------------------
	// Begin Testing
	// ----------------------

	test("GPSTools Available", function(){
		return !!GPSTools;
	});

	//test("GPSTools.parseTrack")
	//test("GPSTools.trimTrack")
	//test("GPSTools.cropTrack")
	//test("GPSTools.areMergeable")
	//test("GPSTools.mergeTracks")

	//test("GPSTools.Format.GPX")		// .isValid()
	//test("GPSTools.Format.KML")		// .parse()
	//test("GPSTools.Format.TCX")		// .generate()
	//test("GPSTools.Format.JSON")

	var point;
	test("Create a Point", function(){
		point = new GPSTools.Point(0,0,0,"2013-05-25T20:10:00Z");
		return point instanceof GPSTools.Point;
	});

	test("GPSTools.Point.getDate", function(){
		var r = point.getDate();
		return (r instanceof Date && r.valueOf() == 1369512600000);
	});

	test("GPSTools.Point.getTime", function(){
		return point.getTime() == 1369512600000;
	});

	var point2 = new GPSTools.Point(1,1,1,"2013-05-25T20:20:00Z")
	test("GPSTools.Point.distanceTo", function(){
		var d = point.distanceTo(point2);
		return round(d,1) == 157.2;
	});

	test("GPSTools.Point.speedTo", function(){
		var s = point.speedTo(point2);
		return round(s,2) == 262.08;
	});

	test("GPSTools.Point.bearingTo", function(){
		var b = point.bearingTo(point2);
		return round(b,4) == 44.9956;
	});

	var track;
	test("GPSTools.Track", function(){
		track = new GPSTools.Track();
		return track instanceof GPSTools.Track;
	});

	test("GPSTools.Track.setName", function(){
		var name  = "abcdef123456";
		track.setName(name);
		return track.name == name;
	});

	var point3 = new GPSTools.Point(2,1,2,"2013-05-25T20:30:00Z"),
		point4 = new GPSTools.Point(2,2,2,"2013-05-25T20:40:00Z");
	test("GPSTools.Track.setPoints", function(){
		track.setPoints([point,point2,point3,point4]);
		return (track.points.length == 4 &&
			track.points[0] == point &&
			track.points[3] == point4);
	});

	test("GPSTools.Track.getPoints", function(){
		var points = track.getPoints();
		return (points.length == 4 &&
			points[0] == point &&
			points[1] == point2 &&
			points[2] == point3 &&
			points[3] == point4);
	});

	var track2;
	test("GPSTools.Track.hasTime", function(){
		track2 = new GPSTools.Track();
		return track.hasTime() && !track2.hasTime();
	});

	test("GPSTools.Track.hasElevation", function(){
		return track.hasElevation() && !track2.hasElevation();
	});

	test("GPSTools.Track.getStartPoint", function(){
		return track.getStartPoint() === point;
	});

	test("GPSTools.Track.getStartTime", function(){
		var d = track.getStartTime();
		return d instanceof Date && d.valueOf() == 1369512600000;
	});

	test("GPSTools.Track.getEndPoint", function(){
		return track.getEndPoint() === point4;
	});

	test("GPSTools.Track.getEndTime", function(){
		var d = track.getEndTime();
		return d instanceof Date && d.valueOf() == 1369514400000;
	});

	testEqual("GPSTools.Track.getDuration", track.getDuration(), 30 * 60);

	testEqual("GPSTools.Track.getDistance", track.getDistance(), 379.6, 1);

	//test("GPSTools.Track.getElevation", function(){});
	testEqual("GPSTools.Track.getHeightGain", track.getHeightGain(), 2);
	//test("GPSTools.Track.getGradient", function(){});
	//test("GPSTools.Track.getGradientHistogram", function(){});
	//test("GPSTools.Track.getSpeed", function(){});
	testEqual("GPSTools.Track.getAvgSpeed", track.getAvgSpeed(), 210.9, 1);
	testEqual("GPSTools.Track.getMaxSpeed", track.getMaxSpeed(), 262.1, 1);
	//test("GPSTools.Track.getThumb", function(){});
	//test("GPSTools.Track.setTime", function(){});
	//test("GPSTools.Track.setStartTime", function(){});
	//test("GPSTools.Track.setEndTime", function(){});
	var testDate = new Date("2013-05-25T20:22:00Z");

	track.setPoints([point, point2, point3, point4,
		new GPSTools.Point(3,3,2,"2013-05-25T20:50:00Z"),
		new GPSTools.Point(4,3,2,"2013-05-25T21:00:00Z"),
		new GPSTools.Point(4,4,2,"2013-05-25T21:10:00Z"),
		new GPSTools.Point(5,5,2,"2013-05-25T21:20:00Z")]);
	testEqual("GPSTools.Track.getPrecedingPointIndex",
		track.getPrecedingPointIndex(testDate), 1);
	testEqual("GPSTools.Track.getInstantSpeed",
		track.getInstantSpeed(testDate), 208.35, 2);
	testEqual("GPSTools.Track.getInstantAltitude",
		track.getInstantAltitude(testDate), 1.2);
	//test("GPSTools.Track.getInstantDistance", function(){});
	//test("GPSTools.Track.getInstantHeading", function(){});

	//test("GPSTools.SuperTrack", function(){});
	//test("GPSTools.SuperTrack.getPoints", function(){});
	//test("GPSTools.SuperTrack.addTrack", function(){});
	//test("GPSTools.SuperTrack.removeTrack", function(){});
	//test("GPSTools.SuperTrack.hasTime", function(){});
	//test("GPSTools.SuperTrack.hasElevation", function(){});
	//test("GPSTools.SuperTrack.getDuration", function(){});
	//test("GPSTools.SuperTrack.getDistance", function(){});
	//test("GPSTools.SuperTrack.getElevation", function(){});
	//test("GPSTools.SuperTrack.getHeightGain", function(){});
	//test("GPSTools.SuperTrack.getGradient", function(){});
	//test("GPSTools.SuperTrack.getGradientHistogram", function(){});
	//test("GPSTools.SuperTrack.getSpeed", function(){});
	//test("GPSTools.SuperTrack.getAvgSpeed", function(){});
	//test("GPSTools.SuperTrack.getMaxSpeed", function(){});
	//test("GPSTools.SuperTrack.getThumb", function(){});
	//test("GPSTools.SuperTrack.setSplitTime", function(){});
});