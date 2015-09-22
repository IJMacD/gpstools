function CurrentTrackStore(){
  riot.observable(this)

  var emitChange = () => {
    RiotControl.trigger('current_changed', this.currentTrack)
  }

  this.on('current_set', track => {
    this.currentTrack = track
    emitChange()
  })
}
