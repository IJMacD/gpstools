<div id="importModal" class="modal hide fade">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Strava Import</h3>
  </div>
  <div class="modal-body">
    <p>Insert Strava Ride ID or Ride URL to begin import</p>
  <form class="form-horizontal">
    <div class="control-group">
      <label for="rideid_txt" class="control-label">Ride ID or URL:</label>
      <div class="controls">
        <input type="text" id="rideid_txt">
        <!-- build:[src] img/loading.gif -->
        <img id="strava-loading" class="loading" src="assets/img/loading.gif" />
        <!-- /build -->
      </div>
    </div>
    <div id="strava-ride-details">
      <div class="control-group">
        <label for="strava-name" class="control-label">Ride Name:</label>
        <p id="strava-name" class="controls"></p>
      </div>
      <div class="control-group">
        <label for="strava-distance" class="control-label">Distance:</label>
        <p id="strava-distance" class="controls"></p>
      </div>
      <div class="control-group">
        <label for="strava-duration" class="control-label">Duration:</label>
        <p id="strava-duration" class="controls"></p>
      </div>
      <div class="control-group">
        <label for="strava-athlete" class="control-label">Athlete:</label>
        <p id="strava-athlete" class="controls"></p>
      </div>
    </div>
    <div id="strava-rides-details">
      <div class="control-group">
        <label for="strava-num-rides" class="control-label">Number of Rides:</label>
        <p id="strava-num-rides" class="controls"></p>
      </div>
      <div class="control-group">
        <label for="strava-first-ride" class="control-label">First Ride:</label>
        <p id="strava-first-ride" class="controls"></p>
      </div>
      <div class="control-group">
        <label for="strava-last-ride" class="control-label">Last Ride:</label>
        <p id="strava-last-ride" class="controls"></p>
      </div>
    </div>
  </form>
  </div>
  <div class="modal-footer">
  <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Close</a>
  <a href="#" class="btn btn-primary" disabled>Import</a>
  </div>
</div>
