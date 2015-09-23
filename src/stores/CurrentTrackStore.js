var CurrentTrackStore = new Store({
  currentTrack: null,
  getCurrent: function(){ return this.currentTrack }
}, function() {
  this.on('current_set', track => {
    this.currentTrack = track
    this.emitChange()
  })
})
