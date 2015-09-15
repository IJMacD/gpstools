<track-list>
  <ul id="tracks-list" class="panel" onclick="{ addTrack }">
    <li each={ tracks } class="track { selected: currentTrack == _item }"
        draggable="true" onclick="{ setCurrent }"
        style="background-image: url({ getThumb(64) })">
      <p class="track-name">{ name }</p>
      <span class="track-dist">{ GPSTools.Util.convertToKm( distance ).toFixed(2) } km</span>
      <span class="track-time" show="{ duration }">{ GPSTools.Util.duration( duration ) }</span>
    </li>
    <p show="{ !tracks.length }" class="unselectable">Import a track using the buttons above or drag‑n‑drop.</p>
  </ul>

  <script>
    this.tracks = []
    this.currentTrack = {}

    var i = 3

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
      console.log(e)

      if(e.ctrlKey)
        return this.removeTrack(e)

      e.stopPropagation()
      RiotControl.trigger('current_set', e.item)
    }

    removeTrack(e) {
      e.stopPropagation()
      RiotControl.trigger('track_remove', e.item)
      if(this.currentTrack == e.item){
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
