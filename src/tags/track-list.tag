<track-list>
  <ul id="tracks-list" class="panel">
    <li each={ track in opts.tracks } class="track { selected: this.parent.parent.isActive(track) }"
        draggable="true" onclick="{ setCurrent }"
        style="background-image: url({ this.parent.getTrackThumb(track, 64) })">
      <button class="close" onclick="{ removeTrack }"><i class="icon-remove icon-white"></i></button>
      <p class="track-name">{ track.name }</p>
      <span class="track-dist">{ GPSTools.Util.convertToKm( track.distance ).toFixed(2) } km</span>
      <span class="track-time" show="{ track.duration }">{ GPSTools.Util.duration( track.duration ) }</span>
    </li>
    <p show="{ !opts.tracks.length }" class="unselectable">Import a track using the buttons above or drag‑n‑drop.</p>
  </ul>

  <script>
    "use strict"

    var firstActiveIndex = null;

    this.setCurrent = (e) => {

      let track = e.item.track
      let index = this.opts.tracks.indexOf(track)

      if(e.shiftKey){
        const startActiveIndex = Math.min(firstActiveIndex, index)
        const endActiveIndex = Math.max(firstActiveIndex, index)
        let newActive = this.opts.tracks.slice(startActiveIndex, endActiveIndex + 1)
        this.parent.setActive(newActive)
      }
      else if (e.ctrlKey) {
        firstActiveIndex = index
        this.parent.addActive([track])
      }
      else {
        firstActiveIndex = index
        this.parent.setActive([track])
      }
    }

    this.removeTrack = (e) => {

      this.parent.removeTrack(e.item.track)
    }

  </script>

  <style scoped>
    ul {
      height: 100%;
      overflow-y: auto;
      padding: 5px;
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
