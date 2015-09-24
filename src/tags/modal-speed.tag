<div id="speedModal" class="modal hide fade">
  <div class="modal-header">
  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
  <h3>Define Track Time</h3>
  </div>
  <div class="modal-body">
  <form class="form-horizontal">
    <div class="control-group">
      <label for="start_txt" class="control-label">Start:</label>
      <div class="controls">
        <input type="datetime" id="start_txt">
      </div>
    </div>
    <div class="control-group">
      <label for="end_txt" class="control-label">End:</label>
      <div class="controls">
        <input type="datetime" id="end_txt">
      </div>
    </div>
    <div class="control-group">
      <label for="duration_txt" class="control-label">Duration:</label>
      <div class="controls">
        <input type="text" id="duration_txt">
      </div>
    </div>
    <div class="control-group">
      <label for="distance_lbl" class="control-label">Distance:</label>
      <div class="controls">
        <span id="distance_lbl"></span> km
      </div>
    </div>
    <div class="control-group">
      <label for="speed_lbl" class="control-label">Speed:</label>
      <div class="controls">
        <span id="speed_lbl"></span> m s<sup>-1</sup>
      </div>
    </div>
  </form>
  </div>
  <div class="modal-footer">
  <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Close</a>
  <a href="#" class="btn btn-primary">Save changes</a>
  </div>
</div>
