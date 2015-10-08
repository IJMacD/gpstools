import React, { Component } from 'react'

export default class Graph extends Component {
  render(){
    const { style } = this.props
    const stop0 = {stopColor: '#5b5f6c', stopOpacity: 1}
    const stop1 = {stopColor: '#888993', stopOpacity: 1}

    return (
      <div className="track-graph panel" style={ style }>
        <div id="slt-btns">
          <button id="crp-slt-btn" className="btn">Crop Track</button>
          <button id="clr-slt-btn" className="btn">Clear Selection</button>
          <button id="tos-slt-btn" className="btn"><i className="icon-arrow-left"></i></button>
          <button id="toe-slt-btn" className="btn"><i className="icon-arrow-right"></i></button>
        </div>
        <svg version="1.1"
            viewBox="0 0 1000 200">
          <defs
             id="defs4864">
            <linearGradient
               id="linearGradient5447">
              <stop
                 style={stop0}
                 offset="0"
                 id="stop5449" />
              <stop
                 style={stop1}
                 offset="1"
                 id="stop5451" />
            </linearGradient>
            <linearGradient
               id="linearGradient5453"
               x1="0"
               y1="4.3845406"
               x2="0"
               y2="-4.5838375"
               gradientUnits="userSpaceOnUse" />

          </defs>

          <svg
              id="elevation-graph"
              viewBox="{ getViewBox(opts.track) }"
              preserveAspectRatio="none">
            <g transform="translate(0,10)" id="markers"></g>
            <g transform="{ getGraphTransform(opts.track) }">
              <path d="{ getPath(opts.track) }" fill="#f33" />
            </g>
          </svg>

          <g transform="translate(0,10)">
            <rect
              id="slider"
              transform="translate(0 0)"
              x="0" y="-4"
              width="1000" height="8"
              rx="3" ry="3"
              onmousedown="{ selectHandle }" />
            <path
              id="start"
              className="grab-handle"
              d="m 0,8.5 c -10e-6,-3.8069906 6.72575,-4.324487 8.87655,-4.324487 l 0,-8.280933 c -2.79488,0 -9.15258,-0.218586 -9.06057,5.06057 z"
              transform="translate(0 0)"
              onmousedown="{ selectHandle }" />
            <path
              id="end"
              className="grab-handle"
              d="m 0,8.5 c 10e-6,-3.8069906 -6.72575,-4.3244874 -8.87655,-4.3244875 l 0,-8.2809328 c 2.79488,0 9.15258,-0.2185859 9.06057,5.06057003 z"
              transform="translate(1000 0)"
              onmousedown="{ selectHandle }" />
          </g>
        </svg>
      </div>
    )
  }
}
