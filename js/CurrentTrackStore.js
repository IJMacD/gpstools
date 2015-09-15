function currentTrackStore(){
  riot.observable(this)

  this.on('current_set', track => {
    this.currentTrack = track
    this.trigger('current_changed', this.currentTrack)
  })
}
