<track-list>
  <ul id="tracks-list" class="panel" onclick="{ addTrack }">
    <li each={ track in tracks } class="track { selected: ActiveStore.isActive(track) }"
        draggable="true" onclick="{ setCurrent }"
        style="background-image: url({ track.getThumb(64) })">
      <button class="close" onclick="{ removeTrack }"><i class="icon-remove icon-white"></i></button>
      <p class="track-name">{ track.name }</p>
      <span class="track-dist">{ GPSTools.Util.convertToKm( track.distance ).toFixed(2) } km</span>
      <span class="track-time" show="{ track.duration }">{ GPSTools.Util.duration( track.duration ) }</span>
    </li>
    <p show="{ !tracks.length }" class="unselectable">Import a track using the buttons above or drag‑n‑drop.</p>
  </ul>

  <script>
    this.tracks = []

    var i = 1

    TrackStore.on('change', () => {
      this.update({tracks: TrackStore.getTracks()})
    })

    TrackActions.init()

    addTrack() {
      FileActions.pick()
    }

    setCurrent(e) {
      // Need to stop propagation because the list below also listens for click events
      e.stopPropagation()

      if(!e.ctrlKey)
        ActiveActions.clear()

      ActiveActions.set(e.item.track)
    }

    removeTrack(e) {
      // Need to stop propagation because the list below also listens for click events
      e.stopPropagation()

      var track = e.item.track

      TrackActions.remove(track)

      if(this.currentTrack == track){
        ActiveActions.clear()
      }
    }

  </script>

  <style scoped>
    ul {
      top: 4em;
      box-sizing: border-box;
      bottom: 280px;
      overflow-y: auto;
      padding: 5px;
      position: absolute;
      width: 350px;
      left: 40px;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      margin: 0;
      list-style: none;
    }

    ul > p {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
    }

    li {
      border-radius: 5px;
      transition: all 0.5s;
    }

    li:hover {
      background: rgba(128,128,128,0.5);
    }
  </style>
</track-list>
