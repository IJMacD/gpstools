import React, { Component } from 'react'

export default class Detail extends Component {
  render(){
    const { style } = this.props
    const track = this.props.tracks[0]

    if(!track) return false

    return (
      <div className="track-detail panel" style={ style }>

        <input type="text" className="track-title" onchange="{ editName }" value={ track.name } />
        <output id="gps">
          Distance (km): { GPSTools.Util.convertToKm( track.distance ).toFixed(3) }<br />
          Distance (mi): { GPSTools.Util.convertToMiles( track.distance ).toFixed(3) }<br />
          <span show="{ track.duration }">
            Start: { track.start }<br />
            End: { track.end }<br />
            Duration: { GPSTools.Util.duration( track.duration ) }<br />
            Average Speed (km/h): { GPSTools.Util.convertToKPH( track.averageSpeed ).toFixed(3) }<br />
            Maximum Speed (km/h): { GPSTools.Util.convertToKPH( track.maximumSpeed ).toFixed(3) }<br />
            Maximum Speed (mph): { GPSTools.Util.convertToMPH( track.maximumSpeed ).toFixed(3) }
          </span>
          <span show="{ track.heightGain }">
            Height Gain (m): { track.heightGain }
          </span>
        </output>
      </div>
    )
  }
}
