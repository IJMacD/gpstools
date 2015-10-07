import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class App extends Component {
  render () {
    return (
      <Menu tracks={tracks} />

      <Map tracks={tracks} />

      <List tracks={tracks}/>

      <Detail tracks={tracks} />

      <Graph tracks={tracks} />
    )
  }
}

function mapStateToProps(state) {
  return {
    tracks: state.tracks
  }
}

export default connect(mapStateToProps, { })(App);
