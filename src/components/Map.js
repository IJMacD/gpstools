import React, { Component } from 'react'

export default class Map extends Component {
  render(){
    const { style } = this.props
    return (
      <div className="track-map" style={style}></div>
    )
  }
}
