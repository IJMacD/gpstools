import React, { Component } from 'react'

export default class Menu extends Component {
  render () {
    return (
      <div className="gpstools-menu">
        <div id="action-bar">
          <h1>GPSTools</h1>
          <div id="cab" show="{ opts.track }">
            <button id="get-ele-btn" className="btn btn-small" title="Get Elevation"
               show="{ !opts.track.hasElevation() }">
              <i className="cicon-mountain"></i>
            </button>
            <button id="gen-spd-btn" className="btn btn-small" title="Generate Speed"
               show="{ opts.track.hasElevation() &amp;&amp; !opts.track.hasTime() }">
              <i className="icon-time"></i>
            </button>
            <button id="mrg-trk-btn" className="btn btn-small" title="Merge Tracks"
               show="{ opts.tracks.length > 1 }">
              <i className="cicon-merge"></i>
            </button>
            <button id="ato-spl-btn" className="btn btn-small" track="Autosplit"
              show="{ opts.tracks.length == 1 }">
              <i className="cicon-split"></i>
            </button>
            <button id="hud-btn" className="btn btn-small" data-toggle="modal"
              data-target="#hudModal" title="HUD" show="{ opts.track.hasTime() }">
              <i className="icon-facetime-video"></i>
            </button>
            <span className="btn-group" id="export-grp">
              <button id="gen-fmt-btn" className="btn btn-small" title="Export">
                <i className="icon-download-alt"></i>
                <span>GPX</span>
              </button>
              <button className="btn btn-small dropdown-toggle" data-toggle="dropdown">
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu">
                <li><a href="#" id="gen-gpx-btn">Export GPX</a></li>
                <li><a href="#" id="gen-kml-btn">Export KML</a></li>
                <li><a href="#" id="gen-tcx-btn">Export TCX</a></li>
                <li><a href="#" id="gen-json-btn">Export JSON</a></li>
              </ul>
            </span>
          </div>
          <button id="open-file-btn" className="btn btn-small" title="Open Files" onclick="{ this.parent.pickFile }">
            <i className="icon-folder-open"></i>
          </button>
          <button id="strava-import-btn" className="btn btn-small" title="Strava Import">
            <i className="cicon-strava"></i>
          </button>
          <button id="save-btn" className="btn btn-small" disabled title="Save">
            <i className="icon-hdd"></i>
          </button>
          <div className="btn-group" id="new-trk-grp">
            <button className="btn btn-small dropdown-toggle" data-toggle="dropdown" title="New Track">
              <i className="icon-plus"></i>
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
              <li><a href="#" id="drw-trk-btn">Draw Track</a></li>
              <li><a href="#" id="spr-trk-btn">Super Track</a></li>
            </ul>
          </div>
          <button id="fll-scn-btn" className="btn btn-small" title="Fullscreen Map">
            <i className="icon-fullscreen"></i>
          </button>
          <progress value="0"></progress>
        </div>

      </div>
    )
  }
}
