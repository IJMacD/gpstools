var ActiveActions = {
  set (tracks) {
    RiotControl.trigger('active_set', tracks)
  },
  add (tracks) {
    RiotControl.trigger('active_add', tracks)
  },
  clear () {
    RiotControl.trigger('active_set', null)
  }
}
