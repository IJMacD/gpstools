function TrackStore(){
  riot.observable(this)

  const LOCALSTORAGE_KEY = 'gpstools-track-index'
  this.tracks = loadTracks()

  var emitChange = () => {
    RiotControl.trigger('track_changed', this.tracks)
  }

  this.on('track_init', emitChange)

  this.on('track_add', tracks => {
    if(!Array.isArray(tracks))
      tracks = [tracks]

    tracks.forEach(track => this.tracks.push(track))
    emitChange()
  })

  this.on('track_remove', track => {
    var index = this.tracks.indexOf(track)
    if(index >= 0)
      this.tracks.splice(index, 1)
    else
      this.tracks.pop()
    emitChange()
  })

  this.on('track_edit', emitChange)

  // Is this allowed? listening to our own change event?
  this.on('track_changed', () => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.tracks))
  })

  function loadTracks() {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "[]")
      .map(jsonTrack => new GPSTools.Track(jsonTrack))
  }
}
