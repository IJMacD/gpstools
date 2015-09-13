<track-detail>

  <div id="summary">
    <h1 id="track-title" contentEditable="true"></h1>
    <output id="gps">
      Distance (km): { distance }<br>
      Distance (mi): { GPSTools.Util.convertToMiles( distance ) }<br>
      <span show="{ time }">
        Start: { start }<br>
        End: { end }<br>
        Duration: { GPSTools.Util.duration( duration ) }<br>
        Average Speed (km/h): { GPSTools.Util.convertToKPH( averageSpeed ) }<br>
        Maximum Speed (km/h): { GPSTools.Util.convertToKPH( maximumSpeed ) }<br>
        Maximum Speed (mph): { GPSTools.Util.convertToMPH( maximumSpeed ) }
      </span>
      <span show="{ heightGain }">
        Height Gain (m): { heightGain }
      </span>
    </output>
  </div>

  <div id="track-detail">
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

</track-detail>
