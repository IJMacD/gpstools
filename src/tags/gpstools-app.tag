<gpstools-app>
  <gpstools-menu tracks={ tracks.filter(isActive) } track={ currentTrack }  />

  <track-map tracks={ tracks.filter(isActive) } />

  <track-list tracks={ tracks }/>

  <track-detail track={ currentTrack }  />

  <div id="status-msg"><p id="status-msg-text"></p></div>

  <script>
    this.tracks = []

    TrackActions.init()

    TrackStore.on('change', () => {
      this.update({tracks: TrackStore.getTracks()})
    })

    ActiveStore.on('change', () => {
      this.update({currentTrack: ActiveStore.getCurrent()})
    })

    pickFile () {
      FileActions.pick()
    }

    editTrack (track) {
      TrackActions.edit(track);
    }

    setActive (track, isOnlyActive) {

      if(isOnlyActive)
        ActiveActions.clear()

      ActiveActions.set(track)
    }

    removeTrack (track) {
      TrackActions.remove(track)

      if(this.currentTrack == track){
        ActiveActions.clear()
      }
    }

    isActive (track) {
      return ActiveStore.isActive(track)
    }

  </script>

</gpstools-app>
