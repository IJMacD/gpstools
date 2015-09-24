var ActiveStore = new Store({
  currentTrack: null,
  getCurrent: function(){ return this.currentTrack }
}, function() {

  this.on('active_set', track => {

    this.currentTrack = track

    if(track)
      track.active = !track.active
    else
      TrackStore.getActive().forEach(track => track.active = false)

    this.emitChange()
  })

})
