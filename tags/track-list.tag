<track-list>
  <ul id="tracks-list" class="panel" onclick="{ addTrack }">
    <li each={ track in tracks } class="track { selected: currentTrack == track }"
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

    RiotControl.on('track_changed', tracks => {
      this.update({tracks: tracks})
    })

    RiotControl.on('current_changed', track => {
      this.update({currentTrack: track})
    })

    RiotControl.trigger('track_init')

    addTrack() {
      RiotControl.trigger('track_add', {
        name: 'Track '+ i++,
        distance: 100000 * Math.random(),
        duration: 86400 * Math.random()
      })
    }

    setCurrent(e) {
      e.stopPropagation()

      var track = e.item.track

      RiotControl.trigger('current_set', track)
    }

    removeTrack(e) {
      e.stopPropagation()

      var track = e.item.track

      RiotControl.trigger('track_remove', track)

      if(this.currentTrack == track){
        RiotControl.trigger('current_set', null)
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
