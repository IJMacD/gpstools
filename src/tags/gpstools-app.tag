<gpstools-app>
  <gpstools-menu tracks={ tracks.filter(isActive) } track={ currentTrack }  />

  <track-map id="map" tracks={ tracks.filter(isActive) } class="{ panel: mapIsPanel, min: shouldMapMinimise() }" />

  <track-list id="list" tracks={ tracks }/>

  <track-detail id="detail" track={ currentTrack } class="panel" show={ currentTrack } />

  <track-graph id="graph" track={ currentTrack } class="panel" show={ currentTrack.hasElevation() } />

  <div id="status-msg"><p id="status-msg-text"></p></div>

  <script>
    "use strict";

    this.mapIsPanel = true
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

    shouldMapMinimise () {
      let active = this.tracks.filter(this.isActive)
      return active.length && active[0].hasElevation()
    }

  </script>


  <style scoped>
    #list {
      top: 4em;
      bottom: 290px;
      position: absolute;
      width: 350px;
      left: 40px;
    }
    #detail {
      bottom: 20px;
      box-sizing: border-box;
      height: 250px;
      overflow-y: auto;
      padding: 10px 20px;
      position: absolute;
      width: 350px;
      left: 40px;
    }
    #graph {
      bottom: 20px;
      box-sizing: border-box;
      height: 180px;
      overflow: hidden;
      position: absolute;
      left: 400px;
      right: 20px;
    }
    #map {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      position: fixed;
    }
    #map.panel {
      top: 4em;
      bottom: 20px;
      box-sizing: border-box;
      overflow: hidden;
      position: absolute;
      left: 400px;
      right: 20px;
      transform: translate3d(0,0,0);
    }
    #map.panel.min {
      bottom: 220px;
    }
  </style>
</gpstools-app>
