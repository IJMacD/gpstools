<track-graph>
  <div id="graph" class="panel" show={ opts.track.hasElevation() }>
    <div id="slt-btns">
      <button id="crp-slt-btn" class="btn">Crop Track</button>
      <button id="clr-slt-btn" class="btn">Clear Selection</button>
      <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button>
      <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        viewBox="0 0 1000 200"
        onmousemove="{ moveHandle }"
        onmouseup="{ unselectHandle }">

      <svg
          id="elevation-graph"
          viewBox="{ getViewBox(opts.track) }"
          preserveAspectRatio="none">
        <g transform="scale(1,-1)">
          <path d="{ getPath(opts.track) }" fill="#4040ff" />
        </g>
      </svg>

      <g transform="translate(50,180)">
        <rect x="0" y="-5" width="900" height="10"
          rx="5" ry="5"
          style="fill:#c0c0c0;stroke:#000000;stroke-width:1.5;" />
        <rect x="0" y="-4" width="900" height="8"
          id="slider"
          transform="translate(0 0)"
          onmousedown="{ selectHandle }" />
        <circle cx="0" cy="0" r="10"
          id="start"
          class="grab-handle"
          transform="translate(0 0)"
          onmousedown="{ selectHandle }" />
        <circle cx="0" cy="0" r="10"
          id="end"
          class="grab-handle"
          transform="translate(900 0)"
          onmousedown="{ selectHandle }" />
      </g>
    </svg>
  </div>

  <script>
    "use strict"

    let lastTrack

    let elevationGraph
    let sliderElement
    let startHandle
    let endHandle

    let viewStart = 0
    let viewEnd = 900

    this.on("mount", () => {
      elevationGraph = this.root.querySelector('#elevation-graph')
      sliderElement = this.root.querySelector('#slider')
      startHandle = this.root.querySelector('#start')
      endHandle = this.root.querySelector('#end')
    })

    this.on("update", () => {
      // Check if we've been mounted yet and have a track
      if(elevationGraph &&
          this.opts.track != lastTrack){
        this.setCrop(0, 900)
        lastTrack = this.opts.track
       }
    })

    getViewBox (track) {
      if(!track.points)
        return

      let numPoints = track.points.length
      let cropStart = viewStart / 900 * numPoints
      let cropEnd = (viewEnd - viewStart) / 900 * numPoints
      let maximumElevation = this.getMaximumElevation(track)
      return cropStart + " -" + maximumElevation + " " + cropEnd + " " + maximumElevation
    }
    getMaximumElevation (track) {
      return track.points.map(point => point.ele).reduce((a,b) => Math.max(a,b), 0)
    }
    getPath (track) {
      return "M 0 0 L " + track.points.map((point, i) =>  i + " " + (point.ele || 0)).join(" L ") + ` L ${ track.points.length } 0`
    }

    let currentHandle;
    let currentX;
    let currentTransform;

    selectHandle (e) {
      e.preventUpdate = true

      currentHandle = e.target
      currentX = e.clientX
      currentTransform = parseFloat(currentHandle.getAttributeNS(null, "transform").slice(10,-1).split(' ')[0])
    }

    moveHandle (e) {
      e.preventUpdate = true

      if(currentHandle){

        let dx = e.clientX - currentX

        if(currentHandle == sliderElement){
          let viewWidth = viewEnd - viewStart
          let newStart = util.bound(currentTransform + dx, 0, 900 - viewWidth)
          let newEnd = newStart + viewWidth
          let fixedEnd = Math.min(newEnd, 900)
          let diffEnd = newEnd - fixedEnd
          this.setCrop(newStart - diffEnd, fixedEnd)
        }
        else if(currentHandle == startHandle)
          this.setCrop(currentTransform + dx, viewEnd)
        else // endHandle
          this.setCrop(viewStart, currentTransform + dx)
      }
    }

    setCrop(start, end) {
      viewStart = util.bound(start, 0, viewEnd)
      viewEnd = util.bound(end, viewStart, 900)

      startHandle.setAttributeNS(null, "transform", "translate(" + viewStart + " 0)")
      endHandle.setAttributeNS(null, "transform", "translate(" + viewEnd + " 0)")

      sliderElement.setAttributeNS(null, "transform", "translate(" + viewStart + " 0)")
      sliderElement.setAttributeNS(null, "width", viewEnd - viewStart)


      elevationGraph.setAttributeNS(null, "viewBox", this.getViewBox(this.opts.track))
    }

    unselectHandle (e) {
      e.preventUpdate = true
      currentHandle = null
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
    svg {
      background: white;
      height: 100%;
      width: 100%;
    }
    .grab-handle {
      fill: #808080;
      stroke: #000000;
      stroke-width: 3;
      cursor: pointer;
      cursor: -webkit-grab;
    }
    #start {
      fill: #4f4;
    }
    #end {
      fill: #f44;
    }
    #slider {
      fill: #0000ff;
      cursor: pointer;
      cursor: -webkit-grab;
    }
  </style>
</track-graph>
