<track-graph>
  <div id="graph" class="panel" show={ opts.track.hasElevation() }>
    <div id="slt-btns">
      <button id="crp-slt-btn" class="btn">Crop Track</button>
      <button id="clr-slt-btn" class="btn">Clear Selection</button>
      <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button>
      <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
        viewBox="0 0 1000 200"
        onmousemove="{ moveHandle }"
        onmouseup="{ unselectHandle }"
        onmouseleave="{ unselectHandle }">
    <defs
       id="defs4864">
      <linearGradient
         inkscape:collect="always"
         id="linearGradient5447">
        <stop
           style="stop-color:#5b5f6c;stop-opacity:1"
           offset="0"
           id="stop5449" />
        <stop
           style="stop-color:#888993;stop-opacity:1"
           offset="1"
           id="stop5451" />
      </linearGradient>
      <linearGradient
         inkscape:collect="always"
         xlink:href="#linearGradient5447"
         id="linearGradient5453"
         x1="0"
         y1="4.3845406"
         x2="0"
         y2="-4.5838375"
         gradientUnits="userSpaceOnUse" />

    </defs>

      <svg
          id="elevation-graph"
          viewBox="{ getViewBox(opts.track) }"
          preserveAspectRatio="none">
        <g transform="translate(0,-80)" id="markers"></g>
        <g transform="scale(1,-1)">
          <path d="{ getPath(opts.track) }" fill="#f33" />
        </g>
      </svg>

      <g transform="translate(0,10)">
        <rect
          id="slider"
          transform="translate(0 0)"
          x="0" y="-4"
          width="1000" height="8"
          rx="3" ry="3"
          onmousedown="{ selectHandle }" />
        <path
          id="start"
          class="grab-handle"
          d="m 0,8.5 c -10e-6,-3.8069906 6.72575,-4.324487 8.87655,-4.324487 l 0,-8.280933 c -2.79488,0 -9.15258,-0.218586 -9.06057,5.06057 z"
          transform="translate(0 0)"
          onmousedown="{ selectHandle }" />
        <path
          id="end"
          class="grab-handle"
          d="m 0,8.5 c 10e-6,-3.8069906 -6.72575,-4.3244874 -8.87655,-4.3244875 l 0,-8.2809328 c 2.79488,0 9.15258,-0.2185859 9.06057,5.06057003 z"
          transform="translate(1000 0)"
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
    let markers

    const VIEW_BAR_WIDTH = 1000

    let viewStart = 0
    let viewEnd = VIEW_BAR_WIDTH

    this.on("mount", () => {
      elevationGraph = this.root.querySelector('#elevation-graph')
      sliderElement = this.root.querySelector('#slider')
      startHandle = this.root.querySelector('#start')
      endHandle = this.root.querySelector('#end')
      markers = this.root.querySelector('#markers')
    })

    this.on("update", () => {
      // Check if we've been mounted yet and have a track
      if(this.isMounted &&
          this.opts.track != lastTrack){

        this.setCrop(0, VIEW_BAR_WIDTH)
        lastTrack = this.opts.track

        this.createMarkers()
       }
    })

    getViewBox (track) {
      if(!track.points)
        return

      let numPoints = track.points.length
      let cropStart = viewStart / VIEW_BAR_WIDTH * numPoints
      let cropEnd = (viewEnd - viewStart) / VIEW_BAR_WIDTH * numPoints
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
          let newStart = util.bound(currentTransform + dx, 0, VIEW_BAR_WIDTH - viewWidth)
          let newEnd = newStart + viewWidth
          let fixedEnd = Math.min(newEnd, VIEW_BAR_WIDTH)
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
      viewEnd = util.bound(end, viewStart, VIEW_BAR_WIDTH)

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

    createMarkers () {
      let length = this.opts.track.points.length
      let ns = "http://www.w3.org/2000/svg"

      this.removeAllChildren(markers)

      let background = document.createElementNS(ns, "rect")
      background.setAttributeNS(null, "x", "0")
      background.setAttributeNS(null, "y", "0")
      background.setAttributeNS(null, "width", opts.track.points.length)
      background.setAttributeNS(null, "height", "10")
      background.setAttributeNS(null, "style", "fill:#222;")

      markers.appendChild(background)

      for(let i = 0; i < length; i += 100){
        let element = document.createElementNS(ns, "rect")

        element.setAttributeNS(null, "x", i)
        element.setAttributeNS(null, "width", 2)

        element.setAttributeNS(null, "style", "fill: white;")

        if(i % 1000 == 0){
          element.setAttributeNS(null, "y", "0")
          element.setAttributeNS(null, "height", "10")
        }
        else {
          element.setAttributeNS(null, "y", "7.5")
          element.setAttributeNS(null, "height", "2.5")
        }

        markers.appendChild(element)
      }
    }

    removeAllChildren (element) {
      while(element.firstChild){
        element.removeChild(element.firstChild)
      }
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
      height: 100%;
      width: 100%;
    }
    .grab-handle {
      fill: #c0c0c0;
      stroke: #5e5e5e;
      stroke-width: 1;
      cursor: pointer;
      cursor: -webkit-grab;
    }
    #slider {
      fill: url(#linearGradient5453);
      stroke: #5e5e5e;
      stroke-width: 1;
      cursor: pointer;
      cursor: -webkit-grab;
    }
  </style>
</track-graph>
