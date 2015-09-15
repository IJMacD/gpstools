<track-detail>

  <div id="summary" class="panel" show={ currentTrack }>
    <h1 id="track-title" contentEditable="true">{ currentTrack.name }</h1>
    <output id="gps">
      Distance (km): { GPSTools.Util.convertToKm( currentTrack.distance ) }<br>
      Distance (mi): { GPSTools.Util.convertToMiles( currentTrack.distance ) }<br>
      <span show="{ time }">
        Start: { currentTrack.start }<br>
        End: { currentTrack.end }<br>
        Duration: { GPSTools.Util.duration( currentTrack.duration ) }<br>
        Average Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.averageSpeed ) }<br>
        Maximum Speed (km/h): { GPSTools.Util.convertToKPH( currentTrack.maximumSpeed ) }<br>
        Maximum Speed (mph): { GPSTools.Util.convertToMPH( currentTrack.maximumSpeed ) }
      </span>
      <span show="{ heightGain }">
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
  </script>

</track-detail>
