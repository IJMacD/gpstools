<div id="hudModal" class="modal hide fade">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3>Create Heads Up Display</h3>
  </div>
  <div class="modal-body form-horizontal">
    <a href="#" id="hud-cst-btn">Customise</a>
    <a href="#" id="hud-prv-btn">Preview</a>
    <div id="hudCustomControls">
      <div class="control-group">
        <label class="control-label" for="hudFrameStart">Frame Start: </label>
        <div class="controls"><input id="hudFrameStart" value="0" type="number"/></div>
      </div>
      <div class="control-group">
        <label class="control-label" for="hudFrameCount">Frame Count: </label>
        <div class="controls"><input id="hudFrameCount" value="10000" type="number"/></div>
      </div>
      <div class="control-group">
        <label class="control-label" for="hudAutoContinue">Auto Continue: </label>
        <div class="controls"><input id="hudAutoContinue" type="checkbox" checked/></div>
      </div>
      <div class="control-group">
        <label class="control-label" for="hudOrientateMap">Orientate Map to Direction of Travel: </label>
        <div class="controls"><input id="hudOrientateMap" type="checkbox" checked/></div>
      </div>
    </div>
    <p id="hud-status"></p>
    <canvas id="hud-preview" width="1280" height="720" />
  </div>
  <div class="modal-footer">
    <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Close</a>
    <a href="#" class="btn" id="cnl-hud-btn">Cancel</a>
    <a href="#" class="btn" id="stp-hud-btn">Step</a>
    <a href="#" class="btn btn-primary" id="gen-hud-btn">Download</a>
  </div>
</div>
