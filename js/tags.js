riot.tag('gpstools-app', '<gpstools-menu ></gpstools-menu> <div id="sidebar"> <track-list ></track-list> <track-detail ></track-detail> </div> <input type="file" id="files" name="files" multiple>', function(opts) {

});

riot.tag('gpstools-menu', '<div id="action-bar"> <h1>GPSTools</h1> <div id="cab"> <button id="get-ele-btn" class="btn btn-small" title="Get Elevation"> <i class="cicon-mountain"></i> </button> <button id="gen-spd-btn" class="btn btn-small" title="Generate Speed"> <i class="icon-time"></i> </button> <button id="mrg-trk-btn" class="btn btn-small" title="Merge Tracks"> <i class="cicon-merge"></i> </button> <button id="ato-spl-btn" class="btn btn-small" track="Autosplit"> <i class="cicon-split"></i> </button> <button id="hud-btn" class="btn btn-small" data-toggle="modal" data-target="#hudModal" title="HUD"> <i class="icon-facetime-video"></i> </button> <div class="btn-group" id="export-grp"> <a id="gen-fmt-btn" class="btn btn-small" title="Export"> <i class="icon-download-alt"></i> <span>GPX</span> </a> <button class="btn btn-small dropdown-toggle" data-toggle="dropdown"> <span class="caret"></span> </button> <ul class="dropdown-menu"> <li><a href="#" id="gen-gpx-btn">Export GPX</a> <li><a href="#" id="gen-kml-btn">Export KML</a> <li><a href="#" id="gen-tcx-btn">Export TCX</a> <li><a href="#" id="gen-json-btn">Export JSON</a> </ul> </div> &nbsp; </div> <button id="open-file-btn" class="btn btn-small" title="Open Files"> <i class="icon-folder-open"></i> </button> <button id="strava-import-btn" class="btn btn-small" title="Strava Import"> <i class="cicon-strava"></i> </button> <button id="save-btn" class="btn btn-small" disabled title="Save"> <i class="icon-hdd"></i> </button> <div class="btn-group" id="new-trk-grp"> <button class="btn btn-small dropdown-toggle" data-toggle="dropdown" title="New Track"> <i class="icon-plus"></i> <span class="caret"></span> </button> <ul class="dropdown-menu"> <li><a href="#" id="drw-trk-btn">Draw Track</a> <li><a href="#" id="spr-trk-btn">Super Track</a> </ul> </div> <button id="fll-scn-btn" class="btn btn-small" title="Fullscreen Map"> <i class="icon-fullscreen"></i> </button> <progress value="0"></progress> </div>', function(opts) {


});

riot.tag('track-detail', '<div id="summary"> <h1 id="track-title" contentEditable="true"></h1> <output id="gps"></output> </div> <div id="track-detail"> <div id="details"> <h2>Details</h2> <div id="super-breakdown"> <table class="table"> <thead> <tr> <th>Segment</th> <th>Name</th> <th>Distance (km)</th> <th>Start Time</th> <th>End Time</th> <th>Duration</th> <th>Actions</th> </tr> </thead> <tbody></tbody> </table> </div> </div> </div>', function(opts) {


});

riot.tag('track-graph', '<div id="graph"> <h2>Elevation / Speed</h2> <div id="slt-btns"> <button id="crp-slt-btn" class="btn">Crop Track</button> <button id="clr-slt-btn" class="btn">Clear Selection</button> <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button> <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button> </div> <canvas id="graphCanvas" width="940" height="250">[No canvas support]</canvas> </div> <div id="gradient"> <h2>Gradient Distribution</h2> <canvas id="gradientCanvas" width="940" height="250">[No canvas support]</canvas> </div>', function(opts) {

});

riot.tag('track-list', '<div id="tracks-list"></div>', function(opts) {

});

riot.tag('track-map', '<div id="map"> <div id="mapCanvas"></div> </div>', function(opts) {

});
