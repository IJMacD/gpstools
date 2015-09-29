<track-graph>
  <div id="graph" class="panel" show={ opts.track }>
    <div id="slt-btns">
      <button id="crp-slt-btn" class="btn">Crop Track</button>
      <button id="clr-slt-btn" class="btn">Clear Selection</button>
      <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button>
      <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        viewBox="{ getViewBox(opts.track) }"
        preserveAspectRatio="none">
      <g transform="scale(1,-1)">
        <path d="{ getPath(opts.track) }" fill="#4040ff" />
      </g>
    </svg>
  </div>

  <script>
    "use strict"

    getViewBox (track) {
      let maximumElevation = this.getMaximumElevation(track)
      return "0 -" + maximumElevation + " " + track.points.length + " " + maximumElevation
    }
    getMaximumElevation (track) {
      return track.points.map(point => point.ele).reduce((a,b) => Math.max(a,b), 0)
    }
    getPath (track) {
      return "M 0 0 L " + track.points.map((point, i) =>  i + " " + (point.ele || 0)).join(" L ") + ` L ${ track.points.length } 0`
    }
  </script>

  <style scoped>
    :scope > div.panel {
      bottom: 20px;
      box-sizing: border-box;
      height: 180px;
      overflow: hidden;
      position: absolute;
      left: 400px;
      right: 20px;
    }
    :scope svg {
      background: white;
      height: 100%;
      width: 100%;
    }
  </style>
</track-graph>
