var ActiveStore = (function() {
  'use strict'

  var _active = []

  var ActiveStore = new Store();

  ActiveStore.getActive = function () {
    return _active
  }

  ActiveStore.getActiveCount = function () {
    return _active.length
  }

  /**
   * Get a single instance which represents all of the currently active tracks
   */
  ActiveStore.getCurrent = function(){
    if(_active.length == 0)
      return null
    if(_active.length == 1)
      return _active[0]
    else {
      return _active.reduce((amalg, track, index) => {

        amalg.name = `(${index + 1}  tracks)`

        amalg.distance += track.distance
        amalg.duration += track.duration

        if(amalg.start && track.start)
          amalg.start = track.start < amalg.start ? track.start : amalg.start
        else
          amalg.start = amalg.start || track.start

        if(amalg.end && track.end)
          amalg.end = track.end > amalg.end ? track.end : amalg.end
        else
          amalg.end = amalg.end || track.end

        amalg.averageSpeed = amalg.distance / amalg.duration

        amalg.maximumSpeed = Math.max(amalg.maximumSpeed, track.maximumSpeed)

        return amalg
      },{
        distance: 0,
        duration: 0,
        start: null,
        end: null,
        averageSpeed: 0,
        maximumSpeed: 0
      })
    }
  }

  ActiveStore.isActive = function (track) {
    return _active.indexOf(track) !== -1
  }

  ActiveStore.on('active_set', function(tracks) {
    // Can be called with 'null' as the track which is intended to clear the
    // current selection

    _active = tracks || []

    this.emitChange()

  }.bind(ActiveStore))

  ActiveStore.on('active_add', function(tracks) {

    tracks = tracks || []

    tracks.forEach(track => {
      let index = _active.indexOf(track)

      if(index == -1)
        _active.push(track)
    })

    this.emitChange()

  }.bind(ActiveStore))

  ActiveStore.on('active_remove', function(tracks) {

    tracks = tracks || []

    tracks.forEach(track => {
      let index = _active.indexOf(track)

      if(index == -1)
        _active.splice(index, 1)
    })

    this.emitChange()

  }.bind(ActiveStore))

  return ActiveStore

}())
