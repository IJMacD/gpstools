// import * as ActionTypes from '../actions'
import * as TrackActionTypes from '../actions/track'
import { combineReducers } from 'redux'

function tracks(state = [], action){
  switch (action.type) {
    case TrackActionTypes.TRACK_ADD:
      return [..state, action.track]
    case TrackActionTypes.TRACK_EDIT:
      return [].concat(state.slice(0,action.id), action.track, state.slice(action.id + 1))
    case TrackActionTypes.TRACK_REMOVE:
      return [].concat(state.slice(0,action.id), state.slice(action.id + 1))
    default:
      return state
  }
}

const rootReducer = combineReducers({
  tracks
})

export default rootReducer
