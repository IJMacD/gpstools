<track-detail>

  <input type="text" class="track-title" onkeyup="{ editName }" value="{ opts.track.name }" />
  <output id="gps">
    Distance (km): { GPSTools.Util.convertToKm( opts.track.distance ).toFixed(3) }<br>
    Distance (mi): { GPSTools.Util.convertToMiles( opts.track.distance ).toFixed(3) }<br>
    <span show="{ opts.track.duration }">
      Start: { opts.track.start }<br>
      End: { opts.track.end }<br>
      Duration: { GPSTools.Util.duration( opts.track.duration ) }<br>
      Average Speed (km/h): { GPSTools.Util.convertToKPH( opts.track.averageSpeed ).toFixed(3) }<br>
      Maximum Speed (km/h): { GPSTools.Util.convertToKPH( opts.track.maximumSpeed ).toFixed(3) }<br>
      Maximum Speed (mph): { GPSTools.Util.convertToMPH( opts.track.maximumSpeed ).toFixed(3) }
    </span>
    <span show="{ opts.track.heightGain }">
      Height Gain (m): { opts.track.heightGain }
    </span>
  </output>

  <div id="track-detail" style="display: none;">
    <div id="details">
      <h2>Details</h2>

      <div id="super-breakdown">
        <table class="table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Name</th>
              <th>Distance (km)</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    editName(e){
      e.preventUpdate = true

      opts.track.name = e.target.value

      this.parent.editTrack(opts.track)
    }
  </script>

  <style scoped>
    .track-title {
      background: none;
      border: none;
      color: white;
      font-size: 2em;
      height: initial;
      padding: 0;
      width: 100%;
    }
    .track-title:focus {
      outline: none;
      border: 0;
      box-shadow: none;
    }
  </style>

</track-detail>
