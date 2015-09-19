(function(window){
  window.GPSTools = window.GPSTools || {}

  GPSTools.Map = function (){
    var map,
        osmLayer,
        cycleLayer,
        osLayer,
        googStreetLayer,
        googSatLayer,
        lineLayer,
        drawLayer,
        drawControl,
        drawCallback,
        bounds,
        marker, markers,
        lineHighlight,
        tempLonLat,
        lonLatProjection = new ol.proj.get("EPSG:4326");
    return {
      create: function (target) {
        if(typeof target == "string")
          target = document.querySelector(target);

        map = new ol.Map({
          target: target,
          // 'controls': [
          //   //new ol.control.Navigation(),
          //   new ol.control.Zoom(),
          //   //new ol.control.LayerSwitcher()
          // ]
          layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                  new ol.layer.Tile({
                    title: 'MapQuest',
                    type: 'base',
                    source: new ol.source.MapQuest({layer: 'sat'})
                  }),
                  new ol.layer.Tile({
                    title: 'OSM',
                    type: 'base',
                    source: new ol.source.OSM()
                  })
                ]
              })
          ],
          view: new ol.View({
            center: ol.proj.transform([114, 22], 'EPSG:4326', 'EPSG:3857'),
            zoom: 8
          })
        });

        var layerSwitcher = new ol.control.LayerSwitcher();
        map.addControl(layerSwitcher);
        // osmLayer = new ol.layer.Tile({
        //   source: ol.source.OSM()
        // });
        // cycleLayer = new ol.Layer.OSM("OpenCycleMap",
        //   ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
        //    "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
        //    "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]);
        // osLayer = new ol.Layer.Bing({
        //   name: "Ordnance Survey (UK)",
        //   key: "AnAvwFeZFUyC15cF3frJiEgWVLsBwn8C3pKsNsfkGsFnk2SE_QD1mMiyMKKRFiz9",
        //   type: "ordnanceSurvey"
        // });
        // googStreetLayer = new ol.Layer.Google(
        //     "Google Streets", // the default
        //     {numZoomLevels: 20}
        // );
        // googSatLayer = new ol.Layer.Google(
        //     "Google Hybrid",
        //     {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
        // );
        // var myStyles = new ol.StyleMap({
        //     "default": new ol.Style({
        //         fillColor: "#ffcc66",
        //         strokeColor: "#99ff33",
        //         strokeOpacity: 0.5,
        //         strokeWidth: 5,
        //         graphicZIndex: 1
        //     }),
        //     "temporary": new ol.Style({
        //         fillColor: "#66ccff",
        //         strokeColor: "#3399ff",
        //         strokeOpacity: 0.5,
        //         strokeWidth: 5,
        //         graphicZIndex: 2
        //     })
        // });
        // lineLayer = new ol.Layer.Vector("Line Layer", {
        //   styleMap: myStyles,
        //   renderers: ["Canvas", "SVG", "VML"]
        // });
        // drawLayer = new ol.Layer.Vector("Draw Layer", {styleMap: myStyles});
        // drawControl = new ol.Control.DrawFeature(drawLayer, ol.Handler.Path);
        // drawControl.events.register('featureadded', null, function(){
        //   if(typeof drawCallback == "function"){
        //     var feature = drawLayer.features[0],
        //         points = feature.geometry.components,
        //         fromProjection = map.getProjectionObject(),
        //         toProjection = lonLatProjection,
        //         i=0, l=points.length,
        //         gPoints = [], point, track;
        //     drawLayer.destroyFeatures([feature]);
        //     for(;i<l;i++){
        //       point = points[i].transform(fromProjection, toProjection);
        //       gPoints.push(new GPSTools.Point(point.y, point.x));
        //     }
        //     track = new GPSTools.Track(gPoints);
        //     track.name = track.getDistance().toFixed(2) + " km Track";
        //     drawCallback(track);
        //   }
        //   drawControl.deactivate();
        // });
        // map.addControl(drawControl);
        //map.addLayers([osmLayer,cycleLayer,osLayer,lineLayer]);
        // map.addLayer(osmLayer);
        // map.addLayer(cycleLayer);
        // map.addLayer(osLayer);
        // map.addLayer(googStreetLayer);
        // map.addLayer(googSatLayer);
        // map.addLayer(lineLayer);
        // map.addLayer(drawLayer);

        // map.zoomToMaxExtent();

        // ol.Event.observe(document, "keydown", function(evt) {
        //     var handled = false;
        //     switch (evt.keyCode) {
        //         case 90: // z
        //             if (evt.metaKey || evt.ctrlKey) {
        //                 drawControl.undo();
        //                 handled = true;
        //             }
        //             break;
        //         case 89: // y
        //             if (evt.metaKey || evt.ctrlKey) {
        //                 drawControl.redo();
        //                 handled = true;
        //             }
        //             break;
        //         case 27: // esc
        //             drawControl.cancel();
        //             handled = true;
        //             break;
        //     }
        //     if (handled) {
        //         ol.Event.stop(evt);
        //     }
        // });
      },
      clearLine: function(highlight) {
        if(!map){
          $('#map').show();
          GPSTools.Map.create();
        }
        if(highlight){
          lineLayer.removeFeatures([lineHighlight]);
          map.zoomToExtent(bounds);
        }else
          lineLayer.removeAllFeatures();
      },
      // Used to be function (Points[] points, bool highlight)
      drawLine: function (points, options) {
        if(!map){
          $('#map').show();
          GPSTools.Map.create();
        }
        if(typeof options != "object"){
          options = {highlight: !!options};
        }
        var olPoints = [],
            i,
            olLine,
            olBounds,
            olStyle,
            olFeature,
            fromProjection = lonLatProjection,
            toProjection = map.getProjectionObject();
        logging("Drawing line" + (options.highlight ? " (highlight)" : ""));
        for(i=0;i<points.length;i++){
          if(isNaN(points[i].lat) || isNaN(points[i].lon))
            console.log("Bad Point: " + points[i].time);
          else
            olPoints.push(new ol.Geometry.Point(points[i].lon,points[i].lat).transform(fromProjection, toProjection));
        }
        olLine = new ol.Geometry.LineString(olPoints);
        logging("Conversion of points finished");
        olBounds = olLine.getBounds();
        olStyle = {
          strokeColor: options.color || (options.highlight ? '#ff0000': '#0000ff'),
          strokeOpacity: options.opacity || 0.5,
          strokeWidth: options.width || 5
        };
        // I tried to reuse Vector Feature!
        // I did I promise, it just displayed buggily
        olFeature = new ol.Feature.Vector(olLine, null, olStyle);

        if(options.highlight){
          if(lineHighlight)
            lineLayer.removeFeatures([lineHighlight]);
          lineHighlight = olFeature;
        }
        else{
          bounds = olBounds;
        }

        lineLayer.addFeatures([olFeature]);

        map.zoomToExtent(olBounds);
      },
      mark: function(point){
        var lonlat = new ol.LonLat(point.lon,point.lat).transform(lonLatProjection, map.getProjectionObject()),
            size,
            offset,
            icon;
        if(!marker){
          markers = new ol.Layer.Markers("Marker");
          map.addLayer(markers);
          size = new ol.Size(21,25);
          offset = new ol.Pixel(-(size.w/2), -size.h);
          icon = new ol.Icon('http://www.ol.org/dev/img/marker.png', size, offset);
          marker = new ol.Marker(lonlat,icon);
          markers.addMarker(marker);
        }else {
          marker.lonlat = lonlat;
          marker.display(true);
          markers.redraw();
        }
      },
      unmark: function(){
        if(marker){
          marker.display(false);
          markers.redraw();
        }
      },
      createLine: function(callback){
        if(!map){
          $('#map').show();
          GPSTools.Map.create();
        }
        drawControl.activate();
        drawCallback = callback;
      },
      setCentre: function(lon, lat, zoom){
        if(!tempLonLat){
          tempLonLat = new ol.LonLat();
        }
        tempLonLat.lon = lon;
        tempLonLat.lat = lat;
        tempLonLat.transform(lonLatProjection,map.getProjectionObject());
        map.setCenter(tempLonLat,zoom);
      },
      zoomToExtent: function(){
        var bounds = lineLayer.getDataExtent();
        map.zoomToExtent(bounds);
      },
      zoomToMaxExtent: function(){
        map.zoomToMaxExtent();
      },
      getLineThumb: function(dw,dh){
        if(!lineLayer.renderer.canvas)
          return;
        dw = dw || 40;
        dh = dh || dw;
        var sctx = lineLayer.renderer.canvas,
            scanvas = sctx.canvas,
            dcanvas = document.createElement('canvas'),
            dctx = dcanvas.getContext('2d'),
            sch = scanvas.height,
            scw = scanvas.width,
            sr = sch/scw,
            dr = dh/dw,
            sw = (sr < 1) ? sch / dr : scw,
            sh = (sr < 1) ? sch : dr * scw,
            sx = (sr < 1) ? (scw - sw) / 2 : 0,
            sy = (sr < 1) ? 0 : (sch - sh) / 2,
            dx = 0, dy = 0;
        dcanvas.width = dw;
        dcanvas.height = dh;
        dctx.fillStyle = "rgba(255,255,255,0.1)";
        dctx.fillRect(dx,dy,dw,dh);
        dctx.drawImage(scanvas, sx, sy, sw, sh, dx, dy, dw, dh);
        return dcanvas.toDataURL();
      },
      getMap: function(){
        return map;
      },
      updateSize: function(){
        map.updateSize();
      }
    }
  }()
}(window))
