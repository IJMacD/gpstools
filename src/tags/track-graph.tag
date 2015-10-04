var util = require('../util')

<track-graph>
  <div id="slt-btns">
    <button id="crp-slt-btn" class="btn">Crop Track</button>
    <button id="clr-slt-btn" class="btn">Clear Selection</button>
    <button id="tos-slt-btn" class="btn"><i class="icon-arrow-left"></i></button>
    <button id="toe-slt-btn" class="btn"><i class="icon-arrow-right"></i></button>
  </div>
  <svg xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
      viewBox="0 0 1000 200">
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
      <g transform="translate(0,10)" id="markers"></g>
      <g transform="{ getGraphTransform(opts.track) }">
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

  <script>
    "use strict"

    let lastTrack

    let svgElement
    let elevationGraph
    let sliderElement
    let startHandle
    let endHandle
    let markers

    const VIEW_BAR_WIDTH = 1000
    const DISTANCE_SCALE = 1 / 10

    let viewStart = 0
    let viewEnd = VIEW_BAR_WIDTH

    this.on("mount", () => {
      svgElement = this.root.querySelector('svg')
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

    this.getViewBox = (track) => {
      if(!track.points)
        return

      let numPoints = track.distance * DISTANCE_SCALE
      let cropStart = viewStart / VIEW_BAR_WIDTH * numPoints
      let cropEnd = (viewEnd - viewStart) / VIEW_BAR_WIDTH * numPoints
      let maximumElevation = this.getMaximumElevation(track)
      return cropStart + " 0 " + cropEnd + " " + maximumElevation
    }
    this.getGraphTransform = (track) => {
      return "translate(0," + this.getMaximumElevation(track) + ") scale(1,-1)"
    }
    this.getMaximumElevation = (track) => {
      return track.points.map(point => point.ele).reduce((a,b) => Math.max(a,b), 0)
    }
    this.getPath = (track) => {
      return "M 0 0 L " +
        this.getDerivedPoints(track).map(dp => {
          return (dp.cumulativeDistance * DISTANCE_SCALE) + " " + (dp.point.ele || 0)
        }).join(" L ") +
        ` L ${ track.points.length } 0`
    }
    this.getDerivedPoints = (track) => {
      // TODO: Add possible caching
      let points = track.points
      let numPoints = points.length
      let derivedPoints = new Array(numPoints)

      let cumulativeDistance = 0
      let cumulativeDuration = 0

      for(let i = 0; i < numPoints; i++) {

        if(i > 0){
          let previousPoint = points[i-1]
          let currentPoint = points[i]

          let distance = GPSTools.Point.distance(previousPoint, currentPoint)
          let duration = GPSTools.Point.duration(previousPoint, currentPoint)

          cumulativeDistance += distance
          cumulativeDuration += duration
        }

        derivedPoints[i] = {
          point: points[i],
          cumulativeDistance,
          cumulativeDuration
        }
      }

      return derivedPoints
    }

    let currentHandle;
    let currentX;
    let currentTransform;

    this.selectHandle = (e) => {
      e.preventUpdate = true

      currentHandle = e.target
      currentX = e.clientX

      currentTransform = parseFloat(currentHandle.getAttributeNS(null, "transform").slice(10,-1).split(' ')[0])

      document.body.addEventListener('mousemove', this.moveHandle)
      document.body.addEventListener('mouseup', this.unselectHandle)
      document.body.className = "grabbing"
    }

    this.moveHandle = (e) => {
      e.preventUpdate = true

      if(currentHandle){

        let svgScale = VIEW_BAR_WIDTH / svgElement.clientWidth
        let dx = (e.clientX - currentX) * svgScale

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

    this.setCrop = (start, end) => {
      viewStart = util.bound(start, 0, viewEnd)
      viewEnd = util.bound(end, viewStart, VIEW_BAR_WIDTH)

      startHandle.setAttributeNS(null, "transform", "translate(" + viewStart + " 0)")
      endHandle.setAttributeNS(null, "transform", "translate(" + viewEnd + " 0)")

      sliderElement.setAttributeNS(null, "transform", "translate(" + viewStart + " 0)")
      sliderElement.setAttributeNS(null, "width", viewEnd - viewStart)


      elevationGraph.setAttributeNS(null, "viewBox", this.getViewBox(this.opts.track))
    }

    this.unselectHandle = (e) => {
      e.preventUpdate = true
      currentHandle = null


      document.body.removeEventListener('mousemove', this.moveHandle)
      document.body.removeEventListener('mouseup', this.unselectHandle)
      document.body.className = ""
    }

    this.createMarkers = () => {
      let length = this.opts.track.distance
      let ns = "http://www.w3.org/2000/svg"

      removeAllChildren(markers)

      for(let i = 0; i < length; i += 1000){
        let line = document.createElementNS(ns, "rect")

        line.setAttributeNS(null, "x", i * DISTANCE_SCALE)
        line.setAttributeNS(null, "width", 2)

        line.setAttributeNS(null, "style", "fill: white;")

        if(i % 10000 == 0){
          line.setAttributeNS(null, "y", "0")
          line.setAttributeNS(null, "height", "10")

          let label = document.createElementNS(ns, "text")
          label.setAttributeNS(null, "x", (i + 30) * DISTANCE_SCALE * DISTANCE_SCALE)
          label.setAttributeNS(null, "y", "20")
          label.setAttributeNS(null, "style", "fill: white; fill-opacity: 0.5; font-size: 10px")
          label.setAttributeNS(null, "transform", "scale(" + (1/DISTANCE_SCALE) + ",1)")
          label.appendChild(document.createTextNode((i/1000) + " km"))

          markers.appendChild(label)

        }
        else {
          line.setAttributeNS(null, "y", "0")
          line.setAttributeNS(null, "height", "2.5")
        }

        markers.appendChild(line)
      }
    }

    function removeAllChildren (element) {
      while(element.firstChild){
        element.removeChild(element.firstChild)
      }
    }
  </script>

  <style scoped>
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
  <style>
    body.grabbing {
      cursor: -webkit-grabbing !important;
    }
  </style>
</track-graph>
