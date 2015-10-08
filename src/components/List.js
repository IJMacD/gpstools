import React, { Component } from 'react'

export default class List extends Component {
  render(){
    const { tracks, style } = this.props

    style.margin = 0
    
    return (
      <ul id="tracks-list" className="panel" style={ style }>
        {tracks.map(track => (
          <li className="track { selected: isActive(track) }"
              draggable="true" onclick="{ trackClick }" >
            <button className="close" onclick="{ removeTrack }"><i className="icon-remove icon-white"></i></button>
            <p className="track-name">{ track.name }</p>
            <span className="track-dist">{ GPSTools.Util.convertToKm( track.distance ).toFixed(2) } km</span>
            <span className="track-time" show="{ track.duration }">{ GPSTools.Util.duration( track.duration ) }</span>
          </li>
        ))}
        <p show="{ !opts.tracks.length }" className="unselectable">Import a track using the buttons above or drag‑n‑drop.</p>
      </ul>
    )
  }
}
