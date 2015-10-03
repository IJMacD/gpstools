import RiotControl from '../../lib/RiotControl'

var ActiveActions = {
  set (tracks) {
    RiotControl.trigger('active_set', tracks)
  },
  add (tracks) {
    RiotControl.trigger('active_add', tracks)
  },
  clear () {
    RiotControl.trigger('active_set', null)
  },
  setSelection(start, end){
    RiotControl.trigger('selection_set', {start, end})
  }
}

export default ActiveActions
