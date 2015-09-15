function TrackStore(){
  riot.observable(this)

  this.tracks = [{
    name: 'Track 1',
    distance: 12342.52345
  },{
    name: 'Track 2',
    distance: 75234.5,
    duration: 29138
  }]

  this.on('track_init', () => {
    this.trigger('track_changed', this.tracks)
  })

  this.on('track_add', track => {
    this.tracks.push(track)
    this.trigger('track_changed', this.tracks)
  })

  this.on('track_remove', track => {
    var index = this.tracks.indexOf(track);
    if(index >= 0){
      this.tracks.splice(index, 1)
    }
    else
      this.tracks.pop()
    this.trigger('todo_changed', this.tracks)
  })
}
