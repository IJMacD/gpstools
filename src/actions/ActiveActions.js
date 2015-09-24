var ActiveActions = {
  set (track) {
    RiotControl.trigger('active_set', track)
  },
  clear () {
    RiotControl.trigger('active_set', null)
  }
}
