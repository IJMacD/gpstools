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
    return (
      <div>
        <Menu tracks={tracks} />

        <Map tracks={tracks} />

        <List tracks={tracks}/>

        <Detail tracks={tracks} />

        <Graph tracks={tracks} />
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
