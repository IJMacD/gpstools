<gpstools-menu>
  <div id="action-bar">
    <h1>GPSTools</h1>
    <div id="cab" show="{ opts.track }">
      <button id="get-ele-btn" class="btn btn-small" title="Get Elevation"
         show="{ !opts.track.hasElevation() }">
        <i class="cicon-mountain"></i>
      </button>
      <button id="gen-spd-btn" class="btn btn-small" title="Generate Speed"
         show="{ opts.track.hasElevation() &amp;&amp; !opts.track.hasTime() }">
        <i class="icon-time"></i>
      </button>
      <button id="mrg-trk-btn" class="btn btn-small" title="Merge Tracks"
         show="{ opts.tracks.length > 1 }">
        <i class="cicon-merge"></i>
      </button>
      <button id="ato-spl-btn" class="btn btn-small" track="Autosplit"
        show="{ opts.tracks.length == 1 }">
        <i class="cicon-split"></i>
      </button>
      <button id="hud-btn" class="btn btn-small" data-toggle="modal"
        data-target="#hudModal" title="HUD" show="{ opts.track.hasTime() }">
        <i class="icon-facetime-video"></i>
      </button>
      <span class="btn-group" id="export-grp">
        <a id="gen-fmt-btn" class="btn btn-small" title="Export">
          <i class="icon-download-alt"></i>
          <span>GPX</span>
        </a>
        <button class="btn btn-small dropdown-toggle" data-toggle="dropdown">
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a href="#" id="gen-gpx-btn">Export GPX</a>
          <li><a href="#" id="gen-kml-btn">Export KML</a>
          <li><a href="#" id="gen-tcx-btn">Export TCX</a>
          <li><a href="#" id="gen-json-btn">Export JSON</a>
        </ul>
      </span>
    </div>
    <button id="open-file-btn" class="btn btn-small" title="Open Files" onclick="{ this.parent.pickFile }">
      <i class="icon-folder-open"></i>
    </button>
    <button id="strava-import-btn" class="btn btn-small" title="Strava Import">
      <i class="cicon-strava"></i>
    </button>
    <button id="save-btn" class="btn btn-small" disabled title="Save">
      <i class="icon-hdd"></i>
    </button>
    <div class="btn-group" id="new-trk-grp">
      <button class="btn btn-small dropdown-toggle" data-toggle="dropdown" title="New Track">
        <i class="icon-plus"></i>
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
        <li><a href="#" id="drw-trk-btn">Draw Track</a>
        <li><a href="#" id="spr-trk-btn">Super Track</a>
      </ul>
    </div>
    <button id="fll-scn-btn" class="btn btn-small" title="Fullscreen Map">
      <i class="icon-fullscreen"></i>
    </button>
    <progress value="0"></progress>
  </div>

</gpstools-menu>
