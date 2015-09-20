function CurrentTrackStore(){
  riot.observable(this)

  this.on('current_set', track => {
    this.currentTrack = track
    RiotControl.trigger('current_changed', this.currentTrack)
  })
}
