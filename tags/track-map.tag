<track-map>

    <div id="map">
      <div id="mapCanvas"></div>
    </div>

    <script>
    
    this.on('mount', function(){
        GPSTools.Map.create('mapCanvas');
    });

    </script>
</track-map>
