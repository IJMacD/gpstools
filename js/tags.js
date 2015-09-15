riot.tag('gpstools-app', '<gpstools-menu ></gpstools-menu> <track-map ></track-map> <track-list ></track-list> <track-detail ></track-detail> <input type="file" id="files" name="files" multiple>', function(opts) {

});

riot.tag('gpstools-menu', '<div id="action-bar"> <h1>GPSTools</h1> <div id="cab"> <button id="get-ele-btn" class="btn btn-small" title="Get Elevation"> <i class="cicon-mountain"></i> </button> <button id="gen-spd-btn" class="btn btn-small" title="Generate Speed"> <i class="icon-time"></i> </button> <button id="mrg-trk-btn" class="btn btn-small" title="Merge Tracks"> <i class="cicon-merge"></i> </button> <button id="ato-spl-btn" class="btn btn-small" track="Autosplit"> <i class="cicon-split"></i> </button> <button id="hud-btn" class="btn btn-small" data-toggle="modal" data-target="#hudModal" title="HUD"> <i class="icon-facetime-video"></i> </button> <div class="btn-group" id="export-grp"> <a id="gen-fmt-btn" class="btn btn-small" title="Export"> <i class="icon-download-alt"></i> <span>GPX</span> </a> <button class="btn btn-small dropdown-toggle" data-toggle="dropdown"> <span class="caret"></span> </button> <ul class="dropdown-menu"> <li><a href="#" id="gen-gpx-btn">Export GPX</a> <li><a href="#" id="gen-kml-btn">Export KML</a> <li><a href="#" id="gen-tcx-btn">Export TCX</a> <li><a href="#" id="gen-json-btn">Export JSON</a> </ul> </div> &nbsp; </div> <button id="open-file-btn" class="btn btn-small" title="Open Files"> <i class="icon-folder-open"></i> </button> <button id="strava-import-btn" class="btn btn-small" title="Strava Import"> <i class="cicon-strava"></i> </button> <button id="save-btn" class="btn btn-small" disabled title="Save"> <i class="icon-hdd"></i> </button> <div class="btn-group" id="new-trk-grp"> <button class="btn btn-small dropdown-toggle" data-toggle="dropdown" title="New Track"> <i class="icon-plus"></i> <span class="caret"></span> </button> <ul class="dropdown-menu"> <li><a href="#" id="drw-trk-btn">Draw Track</a> <li><a href="#" id="spr-trk-btn">Super Track</a> </ul> </div> <button id="fll-scn-btn" class="btn btn-small" title="Fullscreen Map"> <i class="icon-fullscreen"></i> </button> <progress value="0"></progress> </div>', function(opts) {


});

riot.tag('track-detail', '<div id="summary" class="panel" show="{ currentTrack }"> <h1 id="track-title" contentEditable="true">{ currentTrack.name }</h1> <output id="gps"> Distance (km): { GPSTools.Util.convertToKm( currentTrack.distance ) }<br> Distance (mi): { GPSTools.Util.convertToMiles( currentTrack.distance ) }<br> <span show="{ time }"> Start: { currentTrack.start }<br> End: { currentTrack.end }<br> Duration: { GPSTools.Util.duration( currentTrack.duration ) }<br> Average Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.averageSpeed ) }<br> Maximum Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.maximumSpeed ) }<br> Maximum Speed (mph): { GPSTools.Util.convertToMPH( currentTrack.maximumSpeed ) } </span> <span show="{ heightGain }"> Height Gain (m): { currentTrack.heightGain } </span> </output> </div> <div id="track-detail" style="display: none;"> <div id="details"> <h2>Details</h2> <div id="super-breakdown"> <table class="table"> <thead> <tr> <th>Segment</th> <th>Name</th> <th>Distance (km)</th> <th>Start Time</th> <th>End Time</th> <th>Duration</th> <th>Actions</th> </tr> </thead> <tbody></tbody> </table> </div> </div> </div>', function(opts) {
    this.currentTrack = null

    RiotControl.on('current_changed', track => {
      this.update({currentTrack: track})
    })
  
});

riot.tag('track-graph', '<div id="graph"> <h2>Elevation / Speed</h2> <div id="slt-btns"> <button id="crp-slt-btn" class="btn">Crop Track</button> <button id="clr-slt-btn" class="btn">Clear Selection</button> <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button> <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button> </div> <canvas id="graphCanvas" width="940" height="250">[No canvas support]</canvas> </div> <div id="gradient"> <h2>Gradient Distribution</h2> <canvas id="gradientCanvas" width="940" height="250">[No canvas support]</canvas> </div>', function(opts) {

});

riot.tag('track-list', '<ul id="tracks-list" class="panel" onclick="{ addTrack }"> <li each="{ tracks }" class="track { selected: currentTrack == _item }" draggable="true" onclick="{ setCurrent }" riot-style="background-image: url({ getThumb(64) })"> <p class="track-name">{ name }</p> <span class="track-dist">{ GPSTools.Util.convertToKm( distance ).toFixed(2) } km</span> <span class="track-time" show="{ duration }">{ GPSTools.Util.duration( duration ) }</span> </li> <p show="{ !tracks.length }" class="unselectable">Import a track using the buttons above or drag‑n‑drop.</p> </ul>', 'track-list ul, [riot-tag="track-list"] ul{ top: 4em; box-sizing: border-box; bottom: 280px; overflow-y: auto; padding: 5px; position: absolute; width: 350px; left: 40px; user-select: none; -moz-user-select: none; -webkit-user-select: none; margin: 0; list-style: none; } track-list ul > p, [riot-tag="track-list"] ul > p{ color: rgba(255, 255, 255, 0.6); text-align: center; } track-list li, [riot-tag="track-list"] li{ border-radius: 5px; transition: all 0.5s; } track-list li:hover, [riot-tag="track-list"] li:hover{ background: rgba(128,128,128,0.5); }', function(opts) {
    this.tracks = []
    this.currentTrack = {}

    var i = 3

    RiotControl.on('track_changed', tracks => {
      this.update({tracks: tracks})
    })

    RiotControl.on('current_changed', track => {
      this.update({currentTrack: track})
    })

    RiotControl.trigger('track_init')

    this.addTrack = function() {
      RiotControl.trigger('track_add', {
        name: 'Track '+ i++,
        distance: 100000 * Math.random(),
        duration: 86400 * Math.random()
      })
    }.bind(this);

    this.setCurrent = function(e) {
      console.log(e)

      if(e.ctrlKey)
        return this.removeTrack(e)

      e.stopPropagation()
      RiotControl.trigger('current_set', e.item)
    }.bind(this);

    this.removeTrack = function(e) {
      e.stopPropagation()
      RiotControl.trigger('track_remove', e.item)
      if(this.currentTrack == e.item){
        RiotControl.trigger('current_set', null)
      }
    }.bind(this);

  
});

riot.tag('track-map', '<div class="{ panel: isPanel }"></div>', 'track-map > div, [riot-tag="track-map"] > div{ top: 0; right: 0; bottom: 0; left: 0; position: fixed; } track-map > div.panel, [riot-tag="track-map"] > div.panel{ top: 4em; bottom: 20px; box-sizing: border-box; overflow: hidden; position: absolute; left: 400px; right: 20px; transform: translate3d(0,0,0); }', function(opts) {
    this.isPanel = true

    this.on('mount', () => {
        GPSTools.Map.create(this.root.querySelector('div'));
        GPSTools.Map.getMap().addControl(new PanelControl({tag: this}));
    });

    this.switchPanel = function() {
      this.update({isPanel : !this.isPanel})
      GPSTools.Map.updateSize()
    }.bind(this);

    
    var PanelControl = function(opt_options) {

      var options = opt_options || {};
      var tag = options.tag;

      var getClassName = function(){
        return (tag.isPanel ? "icon-resize-full" : "icon-resize-small");
      }

      var button = document.createElement('button');
      var icon = document.createElement('i');
      icon.className = getClassName();
      button.appendChild(icon);

      var handleSwitchPanel = () => {
        tag.switchPanel();
        icon.className = getClassName();
      }

      button.addEventListener('click', handleSwitchPanel, false);
      button.addEventListener('touchstart', handleSwitchPanel, false);

      var element = document.createElement('div');
      element.className = 'panel-control ol-unselectable ol-control';
      element.appendChild(button);

      ol.control.Control.call(this, {
        element: element,
        target: options.target
      });

    };
    ol.inherits(PanelControl, ol.control.Control);
  
});
