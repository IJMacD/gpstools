var CurrentActions = {
  set (track) {
    RiotControl.trigger('current_set', track)
  },
  clear () {
    RiotControl.trigger('current_set', null)
  }
}
