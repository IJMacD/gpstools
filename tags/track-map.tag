<track-map>

  <div id="map" class="{ panel: isPanel }"></div>

  <script>
    this.isPanel = true

    this.on('mount', () => {
        GPSTools.Map.create('map');

        $('#map').on('click', () => {
          this.update({isPanel : !this.isPanel})
          GPSTools.Map.updateSize()
        })
    });

  </script>
</track-map>
