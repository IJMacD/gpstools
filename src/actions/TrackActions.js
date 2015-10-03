import RiotControl from '../../lib/RiotControl.js'

var TrackActions = {
  init () {
    RiotControl.trigger('track_init')
  },
  add (tracks) {
    RiotControl.trigger('track_add', tracks)
  },
  remove (track) {
    RiotControl.trigger('track_remove', track)
  },
  edit (track) {
    RiotControl.trigger('track_edit', track)
  }
}

export default TrackActions
