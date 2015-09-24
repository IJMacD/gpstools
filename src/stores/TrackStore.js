var TrackStore = new Store({
    tracks: [],
    getTracks: function(){ return this.tracks },
    getActive: function(){ return this.tracks.filter(track => track.active) }
  }, function(){

    const LOCALSTORAGE_KEY = 'gpstools-track-index'

    this.on('track_init', () => {
      this.tracks = loadTracks()
      this.emitChange()
    })

    this.on('track_add', tracks => {
      if(!Array.isArray(tracks))
        tracks = [tracks]

      tracks.forEach(track => this.tracks.push(track))
      this.emitChange()
    })

    this.on('track_remove', track => {
      var index = this.tracks.indexOf(track)
      if(index >= 0)
        this.tracks.splice(index, 1)
      else
        this.tracks.pop()
      this.emitChange()
    })

    this.on('track_edit', this.emitChange)

    this.on('active_set', this.emitChange)

    // Is this allowed? listening to our own change event?
    this.on('change', () => {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.tracks))
    })

    function loadTracks() {
      return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "[]")
        .map(jsonTrack => new GPSTools.Track(jsonTrack))
    }
  })
