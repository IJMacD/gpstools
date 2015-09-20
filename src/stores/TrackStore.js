function TrackStore(){
  riot.observable(this)

  const LOCALSTORAGE_KEY = 'gpstools-track-index'
  this.tracks = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || []

  this.on('track_init', () => {
    RiotControl.trigger('track_changed', this.tracks)
  })

  this.on('track_add', track => {
    this.tracks.push(track)
    RiotControl.trigger('track_changed', this.tracks)
  })

  this.on('track_remove', track => {
    var index = this.tracks.indexOf(track)
    if(index >= 0)
      this.tracks.splice(index, 1)
    else
      this.tracks.pop()
    RiotControl.trigger('track_changed', this.tracks)
  })

  this.on('track_edit', () => {
    RiotControl.trigger('track_changed', this.tracks);
  })

  this.on('track_changed', () => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.tracks))
  })
}
