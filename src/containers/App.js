import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as TrackActions from '../actions/track'
import { bindActionCreators } from 'redux'

import Menu from '../components/Menu'
import Map from '../components/Map'
import List from '../components/List'
import Detail from '../components/Detail'
import Graph from '../components/Graph'

class App extends Component {
  render () {
    const { tracks } = this.props

    const mapStyle = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      position: 'fixed'
    }

    const listStyle = {
      top: '4em',
      bottom: '290px',
      position: 'absolute',
      width: '350px',
      left: '40px'
    }

    const detailStyle = {
      bottom: '20px',
      boxSizing: 'border-box',
      height: '250px',
      overflowY: 'auto',
      padding: '10px 20px',
      position: 'absolute',
      width: '350px',
      left: '40px'
    }

    const graphStyle = {
      bottom: '20px',
      boxSizing: 'border-box',
      height: '180px',
      overflow: 'hidden',
      position: 'absolute',
      left: '400px',
      right: '20px'
    }

    return (
      <div className="gpstools-app">
        <Menu tracks={tracks} />

        <Map tracks={tracks} style={mapStyle} />

        <List tracks={tracks} style={listStyle} />

        <Detail tracks={tracks} style={detailStyle} />

        <Graph tracks={tracks} style={graphStyle} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    tracks: state.tracks
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(TrackActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
