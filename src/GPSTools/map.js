(function(window){
  window.GPSTools = window.GPSTools || {}

  GPSTools.Map = function (){
    var map,
        // osmLayer,
        // cycleLayer,
        // osLayer,
        // googStreetLayer,
        // googSatLayer,
        lineSource = new ol.source.Vector(),
        lineLayer,
        // drawLayer,
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
                    title: 'Bing',
                    type: 'base',
                    source: new ol.source.BingMaps({
                      key: 'AnAvwFeZFUyC15cF3frJiEgWVLsBwn8C3pKsNsfkGsFnk2SE_QD1mMiyMKKRFiz9',
                      imagerySet: 'AerialWithLabels',
                      maxZoom: 19
                    })
                  }),
                  new ol.layer.Tile({
                    title: 'Ordnance Survey',
                    type: 'base',
                    source: new ol.source.BingMaps({
                      key: 'AnAvwFeZFUyC15cF3frJiEgWVLsBwn8C3pKsNsfkGsFnk2SE_QD1mMiyMKKRFiz9',
                      imagerySet: 'ordnanceSurvey'
                    })
                  }),
                  new ol.layer.Tile({
                    title: "OpenCycleMap",
                    type: 'base',
                    source: new ol.source.XYZ({
                      url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
                    })
                  }),
                  new ol.layer.Tile({
                    title: 'OSM',
                    type: 'base',
                    source: new ol.source.OSM()
                  }),
                  new ol.layer.Vector({
                    source: lineSource,
                    style: new ol.style.Style({
                      stroke: new ol.style.Stroke({
                        color: "#ff0000",
                        width: 3
                      })
                    })
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
        // map.addLayer(drawLayer);

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
        if(highlight){
          lineSource.removeFeature(lineHighlight);
          map.zoomToExtent(bounds);
        }else
          lineSource.clear();
      },
      // Used to be function (Points[] points, bool highlight)
      drawLine: function (points, options) {
        var olCoordinates = points.map(point => ol.proj.transform([point.lon, point.lat], 'EPSG:4326', 'EPSG:3857')),
            olLineString = new ol.geom.LineString(olCoordinates),
            olFeature = new ol.Feature(olLineString)
        lineSource.addFeature(olFeature)
        map.getView().fit(lineSource.getExtent(), map.getSize())
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
