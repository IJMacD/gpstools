<track-detail>

  <div id="summary" class="panel" show={ currentTrack }>
    <input type="text" class="track-title" onkeyup="{ editName }" value="{ currentTrack.name }" />
    <output id="gps">
      Distance (km): { GPSTools.Util.convertToKm( currentTrack.distance ).toFixed(3) }<br>
      Distance (mi): { GPSTools.Util.convertToMiles( currentTrack.distance ).toFixed(3) }<br>
      <span show="{ currentTrack.duration }">
        Start: { currentTrack.start }<br>
        End: { currentTrack.end }<br>
        Duration: { GPSTools.Util.duration( currentTrack.duration ) }<br>
        Average Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.averageSpeed ) }<br>
        Maximum Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.maximumSpeed ) }<br>
        Maximum Speed (mph): { GPSTools.Util.convertToMPH( currentTrack.maximumSpeed ) }
      </span>
      <span show="{ currentTrack.heightGain }">
        Height Gain (m): { currentTrack.heightGain }
      </span>
    </output>
  </div>

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
    this.currentTrack = null

    RiotControl.on('current_changed', track => {
      this.update({currentTrack: track})
    })

    editName(e){
      e.preventUpdate = true

      if(this.currentTrack)
        this.currentTrack.name = e.target.value

      TrackActions.edit(this.currentTrack);
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
